import { supabase } from '@/lib/supabase';

/**
 * Fetch all production cycles for an organization with basic farm info and latest metrics
 */
export async function getCycles(orgId: string) {
  const { data, error } = await supabase
    .from('production_cycles')
    .select(`
      *,
      farms (name),
      performance_metrics (fcr_to_date, livability_pct, created_at)
    `)
    .eq('org_id', orgId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch a single cycle by ID with its full details
 */
export async function getCycleDetails(cycleId: string) {
  const { data, error } = await supabase
    .from('production_cycles')
    .select(`
      *,
      farms (*),
      grower:profiles!production_cycles_grower_id_fkey (*),
      performance_metrics (*),
      daily_logs (*),
      health_records (*),
      harvest_sales (*)
    `)
    .eq('id', cycleId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch performance metrics history for a specific cycle
 */
export async function getCycleMetricsHistory(cycleId: string) {
  const { data, error } = await supabase
    .from('performance_metrics')
    .select('*')
    .eq('cycle_id', cycleId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Fetch daily logs for a specific cycle
 */
export async function getCycleDailyLogs(cycleId: string) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('cycle_id', cycleId)
    .order('log_date', { ascending: false });

  if (error) throw error;
  return data;
}
