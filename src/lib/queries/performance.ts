import { supabase } from '@/lib/supabase';

/**
 * Fetch historical performance data for the organization's leaderboard
 */
export async function getGrowerPerformanceHistory(orgId: string, limit = 50) {
  const { data, error } = await supabase
    .from('grower_performance')
    .select(`
      created_at,
      final_fcr,
      final_mortality_rate,
      epef_score,
      total_points,
      grower_id,
      profiles!grower_performance_grower_id_fkey (
        first_name,
        last_name
      )
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Fetch organization-wide performance aggregates
 */
export async function getOrgPerformanceMetrics(orgId: string) {
  const { data, error } = await supabase
    .from('performance_metrics')
    .select('*')
    .eq('org_id', orgId);

  if (error) throw error;
  return data;
}

/**
 * Fetch historical FCR and Mortality for charts (organization-wide)
 */
export async function getOrgHistoricalTrends(orgId: string, limit = 20) {
  const { data, error } = await supabase
    .from('grower_performance')
    .select('created_at, final_fcr, final_mortality_rate')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}
