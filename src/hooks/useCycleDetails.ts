import { useState, useEffect, useCallback } from 'react';
import { fetchCycleDetails, type CycleDetailsData } from '@/lib/data/cycles';
import { getErrorMessage } from '@/lib/data/errors';

export function useCycleDetails(cycleId: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cycle, setCycle] = useState<CycleDetailsData['cycle'] | null>(null);
  const [dailyLogs, setDailyLogs] = useState<CycleDetailsData['dailyLogs']>([]);
  const [healthRecords, setHealthRecords] = useState<CycleDetailsData['healthRecords']>([]);
  const [vaccinationSchedules, setVaccinationSchedules] = useState<CycleDetailsData['vaccinationSchedules']>([]);
  const [harvestRecords, setHarvestRecords] = useState<CycleDetailsData['harvestRecords']>([]);
  const [salesRecords, setSalesRecords] = useState<CycleDetailsData['salesRecords']>([]);
  const [deliveredInputs, setDeliveredInputs] = useState<CycleDetailsData['deliveredInputs']>([]);
  const [cycleExpenses, setCycleExpenses] = useState<CycleDetailsData['cycleExpenses']>([]);

  const fetchDetails = useCallback(async () => {
    if (!cycleId) return;
    setIsLoading(true);
    setError(null);

    try {
      const details = await fetchCycleDetails(cycleId);
      setCycle(details.cycle);
      setDailyLogs(details.dailyLogs);
      setVaccinationSchedules(details.vaccinationSchedules);
      setHealthRecords(details.healthRecords);
      setHarvestRecords(details.harvestRecords);
      setSalesRecords(details.salesRecords);
      setDeliveredInputs(details.deliveredInputs);
      setCycleExpenses(details.cycleExpenses);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch cycle details.'));
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
