import { supabase } from '@/lib/supabase';
import type {
  CycleExpenseWithCategoryRow,
  GrowerPerformanceRow,
  PerformanceMetricRow,
} from '@/lib/data-adapters';
import { requireOrgId } from './context';
import { toDataLayerError } from './errors';

export interface PerformanceStats {
  epef: number;
  livability: number;
  fcr: number;
  avgWeight: number;
  epefTrend: 'up' | 'down' | 'stable';
  epefChange: number;
}

export interface LeaderboardEntry {
  id: string;
  growerName: string;
  epef: number;
  points: number;
  rank: number;
  rankAtClose: number | null;
  careerTier: 'training' | 'junior' | 'senior' | 'elite' | null;
  trend: 'up' | 'down' | 'neutral';
  efficiency: number;
  status: 'Elite' | 'Senior' | 'Junior' | 'Training';
  lastBatchDate: string;
  fcr: number;
  mortalityPct: number;
  cyclesCompleted: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface FinancialDataPoint {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface CostCategoryPoint {
  name: string;
  value: number;
  color: string;
}

export interface PerformanceData {
  stats: PerformanceStats;
  leaderboard: LeaderboardEntry[];
  fcrHistory: ChartDataPoint[];
  mortalityHistory: ChartDataPoint[];
  financialHistory: FinancialDataPoint[];
  costBreakdown: CostCategoryPoint[];
}

export async function fetchPerformanceData(orgId: string): Promise<PerformanceData> {
  try {
    const resolvedOrgId = requireOrgId(orgId);
    const [
      { data: historyData, error: historyError },
      { data: orgMetrics, error: metricsError },
      { data: settlements, error: settlementsError },
      { data: expenses, error: expensesError },
    ] = await Promise.all([
      supabase
        .from('grower_performance')
        .select(`
          created_at,
          final_fcr,
          final_mortality_rate,
          epef_score,
          total_points,
          grower_id,
          rank_at_close,
          career_tier,
          profiles!grower_performance_grower_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('org_id', resolvedOrgId)
        .order('created_at', { ascending: true })
        .limit(20),
      supabase.from('performance_metrics').select('*').eq('org_id', resolvedOrgId),
      supabase
        .from('settlement_statements')
        .select('created_at, total_production_value, final_net_payout')
        .eq('org_id', resolvedOrgId)
        .order('created_at', { ascending: true }),
      supabase
        .from('cycle_expenses')
        .select('created_at, total_paid, category:expense_categories(name)')
        .eq('org_id', resolvedOrgId),
    ]);

    if (historyError) throw historyError;
    if (metricsError) throw metricsError;
    if (settlementsError) throw settlementsError;
    if (expensesError) throw expensesError;

    const uniqueGrowers = new Map<string, LeaderboardEntry>();
    const growerCycleCount = new Map<string, number>();

    ((historyData || []) as GrowerPerformanceRow[]).forEach((entry) => {
      growerCycleCount.set(entry.grower_id, (growerCycleCount.get(entry.grower_id) ?? 0) + 1);
    });

    ((historyData || []) as GrowerPerformanceRow[]).forEach((entry) => {
      const growerName = `${entry.profiles?.first_name || ''} ${entry.profiles?.last_name || ''}`.trim();
      const existing = uniqueGrowers.get(entry.grower_id);
      // Keep the record with highest epef_score per grower
      if (!existing || (Number(entry.epef_score) || 0) > existing.epef) {
        const careerTierRaw = (entry as unknown as Record<string, unknown>).career_tier as string | null;
        const rankAtCloseRaw = (entry as unknown as Record<string, unknown>).rank_at_close as number | null;
        const careerTier = (['training', 'junior', 'senior', 'elite'].includes(careerTierRaw ?? '')
          ? careerTierRaw as 'training' | 'junior' | 'senior' | 'elite'
          : null);
        uniqueGrowers.set(entry.grower_id, {
          id: entry.grower_id,
          growerName,
          epef: Number(entry.epef_score) || 0,
          points: Number(entry.total_points) || 0,
          rank: 0,
          rankAtClose: rankAtCloseRaw ?? null,
          careerTier,
          trend: 'neutral',
          efficiency: Math.min(100, ((Number(entry.epef_score) || 0) / 400) * 100),
          status:
            entry.epef_score && entry.epef_score > 350 ? 'Elite'
            : entry.epef_score && entry.epef_score > 300 ? 'Senior'
            : entry.epef_score && entry.epef_score > 280 ? 'Junior'
            : 'Training',
          lastBatchDate: entry.created_at,
          fcr: Number(entry.final_fcr) || 0,
          mortalityPct: (Number(entry.final_mortality_rate) || 0) * 100,
          cyclesCompleted: growerCycleCount.get(entry.grower_id) ?? 1,
        });
      }
    });

    const leaderboard = Array.from(uniqueGrowers.values())
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    const fcrHistory: ChartDataPoint[] = (historyData || []).map((entry) => ({
      label: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short' }),
      value: Number(entry.final_fcr) || 0,
    }));

    const mortalityHistory: ChartDataPoint[] = (historyData || []).map((entry) => ({
      label: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short' }),
      value: (Number(entry.final_mortality_rate) || 0) * 100,
    }));

    const financialByMonth = new Map<string, FinancialDataPoint>();
    (settlements || []).forEach((settlement) => {
      const month = new Date(settlement.created_at).toLocaleDateString('en-US', { month: 'short' });
      const current = financialByMonth.get(month) || { month, revenue: 0, cost: 0, profit: 0 };
      const revenue = Math.abs(Number(settlement.total_production_value) || 0);
      current.revenue += revenue;
      current.profit += revenue;
      financialByMonth.set(month, current);
    });

    ((expenses || []) as CycleExpenseWithCategoryRow[]).forEach((expense) => {
      const month = new Date(expense.created_at).toLocaleDateString('en-US', { month: 'short' });
      const current = financialByMonth.get(month) || { month, revenue: 0, cost: 0, profit: 0 };
      const cost = Math.abs(Number(expense.total_paid) || 0);
      current.cost += cost;
      current.profit -= cost;
      financialByMonth.set(month, current);
    });

    const financialHistory = Array.from(financialByMonth.values());
    const categoryMap = new Map<string, number>();
    const chartColors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ];

    ((expenses || []) as CycleExpenseWithCategoryRow[]).forEach((expense) => {
      const categoryName = expense.category?.name || 'Uncategorized';
      const cost = Math.abs(Number(expense.total_paid) || 0);
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + cost);
    });

    const costBreakdown: CostCategoryPoint[] = Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: chartColors[index % chartColors.length],
    }));

    const metrics = (orgMetrics || []) as PerformanceMetricRow[];
    const history = (historyData || []) as GrowerPerformanceRow[];

    const stats: PerformanceStats = {
      epef: history.length ? history.reduce((sum, item) => sum + (item.epef_score || 0), 0) / history.length : 0,
      livability: metrics.length
        ? metrics.reduce((sum, item) => sum + (item.livability_pct || 0), 0) / metrics.length
        : history.length
          ? history.reduce((sum, item) => sum + (100 - (item.final_mortality_rate || 0) * 100), 0) / history.length
          : 0,
      fcr: metrics.length
        ? metrics.reduce((sum, item) => sum + (item.fcr_to_date || 0), 0) / metrics.length
        : history.length
          ? history.reduce((sum, item) => sum + (item.final_fcr || 0), 0) / history.length
          : 0,
      avgWeight: 0,
      epefTrend: 'stable',
      epefChange: 0,
    };

    return {
      stats,
      leaderboard,
      fcrHistory,
      mortalityHistory,
      financialHistory,
      costBreakdown,
    };
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch performance data.', 'performance.fetchPerformanceData');
  }
}
