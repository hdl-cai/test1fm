import { supabase } from '@/lib/supabase';
import { requireOrgId } from './context';
import { toDataLayerError } from './errors';

// ─── Return Types ────────────────────────────────────────────────────────────

export interface FcrTrendPoint {
  cycle_label: string;
  fcr: number;
  end_date: string;
}

export interface MortalityTrendPoint {
  cycle_label: string;
  mortality_pct: number;
  end_date: string;
}

export interface AdgTrendPoint {
  cycle_label: string;
  adg_g: number;
  end_date: string;
}

export interface CycleDurationPoint {
  bucket: string;
  count: number;
}

export interface RevenueExpensesPoint {
  month: string;
  revenue: number;
  expenses: number;
}

export interface NetProfitPoint {
  cycle_label: string;
  revenue: number;
  expenses: number;
  net_profit: number;
  end_date: string;
}

export interface CostDistPoint {
  category: string;
  total_amount: number;
  pct: number;
}

export interface CostPerKgPoint {
  cycle_label: string;
  cost_per_kg: number;
  end_date: string;
}

export interface SeasonalityPoint {
  month_num: number;
  month_name: string;
  avg_mortality_pct: number;
  cycle_count: number;
}

export interface InputPerformancePoint {
  input_type: string;
  input_value: string;
  avg_harvest_weight_kg: number;
  avg_fcr: number;
  cycle_count: number;
}

// ─── RPC Wrappers ─────────────────────────────────────────────────────────────

export async function fetchFcrTrend(orgId?: string): Promise<FcrTrendPoint[]> {
  const id = requireOrgId(orgId);
  const { data, error } = await supabase.rpc('fn_fcr_trend', { p_org_id: id });
  if (error) throw toDataLayerError(error, 'Failed to fetch FCR trend');
  return (data ?? []) as FcrTrendPoint[];
}

export async function fetchMortalityTrend(orgId?: string): Promise<MortalityTrendPoint[]> {
  const id = requireOrgId(orgId);
  const { data, error } = await supabase.rpc('fn_mortality_trend', { p_org_id: id });
  if (error) throw toDataLayerError(error, 'Failed to fetch mortality trend');
  return (data ?? []) as MortalityTrendPoint[];
}

export async function fetchAdgTrend(orgId?: string): Promise<AdgTrendPoint[]> {
  const id = requireOrgId(orgId);
  const { data, error } = await supabase.rpc('fn_adg_trend', { p_org_id: id });
  if (error) throw toDataLayerError(error, 'Failed to fetch ADG trend');
  return (data ?? []) as AdgTrendPoint[];
}

export async function fetchCycleDurationDistribution(orgId?: string): Promise<CycleDurationPoint[]> {
  const id = requireOrgId(orgId);
  const { data, error } = await supabase.rpc('fn_cycle_duration_distribution', { p_org_id: id });
  if (error) throw toDataLayerError(error, 'Failed to fetch cycle duration distribution');
  return (data ?? []) as CycleDurationPoint[];
}

export async function fetchRevenueVsExpenses(orgId?: string): Promise<RevenueExpensesPoint[]> {
  const id = requireOrgId(orgId);
  const { data, error } = await supabase.rpc('fn_revenue_vs_expenses_monthly', { p_org_id: id });
  if (error) throw toDataLayerError(error, 'Failed to fetch revenue vs expenses');
  return (data ?? []) as RevenueExpensesPoint[];
}

export async function fetchNetProfitPerCycle(orgId?: string): Promise<NetProfitPoint[]> {
  const id = requireOrgId(orgId);
  const { data, error } = await supabase.rpc('fn_net_profit_per_cycle', { p_org_id: id });
  if (error) throw toDataLayerError(error, 'Failed to fetch net profit per cycle');
  return (data ?? []) as NetProfitPoint[];
}

export async function fetchCostDistribution(orgId?: string, months = 12): Promise<CostDistPoint[]> {
  const id = requireOrgId(orgId);
  const { data, error } = await supabase.rpc('fn_cost_distribution', { p_org_id: id, p_months: months });
  if (error) throw toDataLayerError(error, 'Failed to fetch cost distribution');
  return (data ?? []) as CostDistPoint[];
}

export async function fetchCostPerKgTrend(orgId?: string): Promise<CostPerKgPoint[]> {
  const id = requireOrgId(orgId);
  const { data, error } = await supabase.rpc('fn_cost_per_kg_trend', { p_org_id: id });
  if (error) throw toDataLayerError(error, 'Failed to fetch cost per kg trend');
  return (data ?? []) as CostPerKgPoint[];
}

export async function fetchSeasonalityMortality(orgId?: string): Promise<SeasonalityPoint[]> {
  const id = requireOrgId(orgId);
  const { data, error } = await supabase.rpc('fn_seasonality_mortality', { p_org_id: id });
  if (error) throw toDataLayerError(error, 'Failed to fetch seasonality data');
  return (data ?? []) as SeasonalityPoint[];
}

export async function fetchInputPerformance(orgId?: string): Promise<InputPerformancePoint[]> {
  const id = requireOrgId(orgId);
  const { data, error } = await supabase.rpc('fn_input_performance', { p_org_id: id });
  if (error) throw toDataLayerError(error, 'Failed to fetch input performance');
  return (data ?? []) as InputPerformancePoint[];
}

// ─── Composite fetch ───────────────────────────────────────────────────────────

export interface AllAnalyticsData {
  fcrTrend: FcrTrendPoint[];
  mortalityTrend: MortalityTrendPoint[];
  adgTrend: AdgTrendPoint[];
  cycleDurationDist: CycleDurationPoint[];
  revenueVsExpenses: RevenueExpensesPoint[];
  netProfitPerCycle: NetProfitPoint[];
  costDistribution: CostDistPoint[];
  costPerKgTrend: CostPerKgPoint[];
  seasonalityMortality: SeasonalityPoint[];
  inputPerformance: InputPerformancePoint[];
}

export async function fetchAllAnalytics(orgId?: string): Promise<AllAnalyticsData> {
  const [
    fcrTrend,
    mortalityTrend,
    adgTrend,
    cycleDurationDist,
    revenueVsExpenses,
    netProfitPerCycle,
    costDistribution,
    costPerKgTrend,
    seasonalityMortality,
    inputPerformance,
  ] = await Promise.all([
    fetchFcrTrend(orgId),
    fetchMortalityTrend(orgId),
    fetchAdgTrend(orgId),
    fetchCycleDurationDistribution(orgId),
    fetchRevenueVsExpenses(orgId),
    fetchNetProfitPerCycle(orgId),
    fetchCostDistribution(orgId),
    fetchCostPerKgTrend(orgId),
    fetchSeasonalityMortality(orgId),
    fetchInputPerformance(orgId),
  ]);

  return {
    fcrTrend,
    mortalityTrend,
    adgTrend,
    cycleDurationDist,
    revenueVsExpenses,
    netProfitPerCycle,
    costDistribution,
    costPerKgTrend,
    seasonalityMortality,
    inputPerformance,
  };
}
