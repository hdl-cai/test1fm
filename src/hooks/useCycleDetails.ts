import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useCycleDetails(cycleId: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cycle, setCycle] = useState<any>(null);
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [vaccinationSchedules, setVaccinationSchedules] = useState<any[]>([]);
  const [harvestRecords, setHarvestRecords] = useState<any[]>([]);
  const [salesRecords, setSalesRecords] = useState<any[]>([]);
  const [deliveredInputs, setDeliveredInputs] = useState<any[]>([]);
  const [cycleExpenses, setCycleExpenses] = useState<any[]>([]);

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
      
      const metrics = (cycleData as any).performance_metrics as any[];
      const sortedMetrics = metrics ? [...metrics].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) : [];
      const latestMetrics = sortedMetrics.length > 0 ? sortedMetrics[0] : null;
      
      setCycle({
        ...cycleData,
        latestMetrics
      });

      // 2. Fetch daily logs
      const { data: logs, error: logsError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('cycle_id', cycleId)
        .order('log_date', { ascending: false });

       if (logsError) throw logsError;
      setDailyLogs(logs || []);
 
      // 3. Fetch vaccinations
      const { data: vaccs, error: vaccError } = await supabase
        .from('vaccination_schedules')
        .select('*')
        .eq('cycle_id', cycleId)
        .order('scheduled_date', { ascending: true });

      if (!vaccError) setVaccinationSchedules(vaccs || []);

      // 4. Fetch health records
      const { data: health, error: healthError } = await supabase
        .from('health_records')
        .select(`
          *,
          profiles (first_name, last_name)
        `)
        .eq('cycle_id', cycleId)
        .order('recorded_at', { ascending: false });

      if (!healthError) setHealthRecords(health || []);
      // 5. Fetch harvest
      const { data: harvests, error: harvestError } = await supabase
        .from('harvest_logs')
        .select('*')
        .eq('cycle_id', cycleId);
      
      if (!harvestError) setHarvestRecords(harvests || []);

      // 6. Fetch sales
      const { data: sales, error: salesError } = await supabase
        .from('harvest_sales')
        .select('*')
        .eq('cycle_id', cycleId);
      
      if (!salesError) setSalesRecords(sales || []);

      // 7. Fetch delivered inputs (for feed/supply reconciliation)
      const { data: inputs, error: inputsError } = await supabase
        .from('delivered_inputs')
        .select('*')
        .eq('cycle_id', cycleId)
        .order('delivery_date', { ascending: true });

      if (!inputsError) setDeliveredInputs(inputs || []);

      // 8. Fetch cycle expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('cycle_expenses')
        .select(`
          *,
          expense_categories (name)
        `)
        .eq('cycle_id', cycleId)
        .order('created_at', { ascending: false });

      if (!expensesError) setCycleExpenses(expenses || []);

    } catch (err: any) {
      setError(err.message);
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
