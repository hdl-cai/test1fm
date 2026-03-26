import { useState, useEffect, useCallback } from 'react';
import type {
  CycleDetailsRow,
  DeliveredInputRow,
  HealthRecordWithVeterinarianRow,
  HarvestSaleRow,
  VaccinationScheduleRow,
} from '@/lib/data-adapters';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/supabase';

type CycleLatestMetric = NonNullable<CycleDetailsRow['performance_metrics']>[number];

type CycleDetailsState = CycleDetailsRow & {
  latestMetrics: CycleLatestMetric | null;
};

type CycleExpenseWithCategoryRow = Tables<'cycle_expenses'> & {
  expense_categories: { name: string } | null;
};

export function useCycleDetails(cycleId: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cycle, setCycle] = useState<CycleDetailsState | null>(null);
  const [dailyLogs, setDailyLogs] = useState<Tables<'daily_logs'>[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecordWithVeterinarianRow[]>([]);
  const [vaccinationSchedules, setVaccinationSchedules] = useState<VaccinationScheduleRow[]>([]);
  const [harvestRecords, setHarvestRecords] = useState<Tables<'harvest_logs'>[]>([]);
  const [salesRecords, setSalesRecords] = useState<HarvestSaleRow[]>([]);
  const [deliveredInputs, setDeliveredInputs] = useState<DeliveredInputRow[]>([]);
  const [cycleExpenses, setCycleExpenses] = useState<CycleExpenseWithCategoryRow[]>([]);

  const fetchDetails = useCallback(async () => {
    if (!cycleId) return;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch main cycle data with joined farm and grower
      const { data: cycleData, error: cycleError } = await supabase
        .from('production_cycles')
        .select(`
          *,
          farms (id, name, capacity, region),
          profiles (id, first_name, last_name, email),
          performance_metrics (fcr_to_date, livability_pct, created_at)
        `)
        .eq('id', cycleId)
        .single();

      if (cycleError) throw cycleError;

      const typedCycleData = cycleData as CycleDetailsRow;
      const metrics = typedCycleData.performance_metrics || [];
      const sortedMetrics = metrics ? [...metrics].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) : [];
      const latestMetrics = sortedMetrics.length > 0 ? sortedMetrics[0] : null;
      
      setCycle({
        ...typedCycleData,
        latestMetrics
      });

      const [
        { data: logs, error: logsError },
        { data: vaccs, error: vaccError },
        { data: health, error: healthError },
        { data: harvests, error: harvestError },
        { data: sales, error: salesError },
        { data: inputs, error: inputsError },
        { data: expenses, error: expensesError },
      ] = await Promise.all([
        supabase
          .from('daily_logs')
          .select('*')
          .eq('cycle_id', cycleId)
          .order('log_date', { ascending: false }),
        supabase
          .from('vaccination_schedules')
          .select('*')
          .eq('cycle_id', cycleId)
          .order('scheduled_date', { ascending: true }),
        supabase
          .from('health_records')
          .select(`
            *,
            veterinarian:profiles!health_records_veterinarian_id_fkey (first_name, last_name)
          `)
          .eq('cycle_id', cycleId)
          .order('record_date', { ascending: false }),
        supabase
          .from('harvest_logs')
          .select('*')
          .eq('cycle_id', cycleId),
        supabase
          .from('harvest_sales')
          .select('*')
          .eq('cycle_id', cycleId),
        supabase
          .from('delivered_inputs')
          .select('*')
          .eq('cycle_id', cycleId)
          .order('delivery_date', { ascending: true }),
        supabase
          .from('cycle_expenses')
          .select(`
            *,
            expense_categories (name)
          `)
          .eq('cycle_id', cycleId)
          .order('created_at', { ascending: false }),
      ]);

      if (logsError) throw logsError;
      if (vaccError) throw vaccError;
      if (healthError) throw healthError;
      if (harvestError) throw harvestError;
      if (salesError) throw salesError;
      if (inputsError) throw inputsError;
      if (expensesError) throw expensesError;

      setDailyLogs(logs || []);
      setVaccinationSchedules(vaccs || []);
      setHealthRecords((health as HealthRecordWithVeterinarianRow[]) || []);
      setHarvestRecords(harvests || []);
      setSalesRecords(sales || []);
      setDeliveredInputs(inputs || []);
      setCycleExpenses((expenses as CycleExpenseWithCategoryRow[]) || []);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch cycle details.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [cycleId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    cycle,
    dailyLogs,
    healthRecords,
    vaccinationSchedules,
    harvestRecords,
    salesRecords,
    deliveredInputs,
    cycleExpenses,
    isLoading,
    error,
    refetch: fetchDetails
  };
}
