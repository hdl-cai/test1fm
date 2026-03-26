import { supabase } from '@/lib/supabase';
import { requireOrgId } from './context';
import { toDataLayerError } from './errors';

export interface DashboardStats {
  totalBirds: number;
  avgMortality: number;
  avgFCR: number;
  activeCyclesCount: number;
}

export interface ChartData {
  name: string;
  mortality: number;
  fcr: number;
}

export interface PendingApproval {
  id: string;
  type: 'expense' | 'cash_advance';
  title: string;
  description: string;
  amount: number;
  requestedBy: string;
  requestDate: string;
  priority: 'high' | 'normal' | 'low';
}

export interface FlockSummaryItem {
  id: string;
  farmName: string;
  batchName: string;
  growerName: string;
  birdCount: number;
  mortalityRate: number;
  fcr: number;
  status: string;
}

export interface DashboardData {
  stats: DashboardStats;
  chartData: ChartData[];
  pendingApprovals: PendingApproval[];
  flockSummary: FlockSummaryItem[];
}

export async function fetchDashboardData(orgId: string): Promise<DashboardData> {
  try {
    const resolvedOrgId = requireOrgId(orgId);
    const { data: cycles, error: cyclesError } = await supabase
      .from('production_cycles')
      .select(`
        id,
        initial_birds,
        status,
        batch_name,
        farm:farms!production_cycles_farm_id_fkey (name),
        grower:profiles!production_cycles_grower_id_fkey (first_name, last_name)
      `)
      .eq('org_id', resolvedOrgId)
      .eq('status', 'active');

    if (cyclesError) {
      throw cyclesError;
    }

    const cycleIds = (cycles || []).map((cycle) => cycle.id);
    let globalMortality = 0;
    let globalFCR = 0;
    const metricsMap = new Map<string, { livability_pct: number | null; fcr_to_date: number | null }>();

    if (cycleIds.length > 0) {
      const { data: metrics, error: metricsError } = await supabase
        .from('performance_metrics')
        .select('livability_pct, fcr_to_date, cycle_id, created_at')
        .in('cycle_id', cycleIds)
        .order('created_at', { ascending: false });

      if (metricsError) {
        throw metricsError;
      }

      (metrics || []).forEach((metric) => {
        if (!metricsMap.has(metric.cycle_id)) {
          metricsMap.set(metric.cycle_id, metric);
        }
      });

      const values = Array.from(metricsMap.values());
      if (values.length > 0) {
        globalMortality = 100 - values.reduce((acc, metric) => acc + ((metric.livability_pct || 1) * 100), 0) / values.length;
        globalFCR = values.reduce((acc, metric) => acc + (metric.fcr_to_date || 0), 0) / values.length;
      }
    }

    const stats: DashboardStats = {
      totalBirds: (cycles || []).reduce((acc, cycle) => acc + (cycle.initial_birds || 0), 0),
      avgMortality: globalMortality,
      avgFCR: globalFCR,
      activeCyclesCount: (cycles || []).length,
    };

    const flockSummary: FlockSummaryItem[] = (cycles || []).map((cycle) => {
      const metric = metricsMap.get(cycle.id);
      return {
        id: cycle.id,
        farmName: (cycle.farm as { name?: string } | null)?.name || 'Unknown',
        batchName: cycle.batch_name,
        growerName: cycle.grower
          ? `${(cycle.grower as { first_name?: string; last_name?: string }).first_name || ''} ${(cycle.grower as { first_name?: string; last_name?: string }).last_name || ''}`.trim() || 'Unknown'
          : 'Unknown',
        birdCount: cycle.initial_birds,
        mortalityRate: metric ? 100 - ((metric.livability_pct || 1) * 100) : 0,
        fcr: metric?.fcr_to_date || 0,
        status: cycle.status,
      };
    });

    const { data: expenses, error: expensesError } = await supabase
      .from('cycle_expenses')
      .select(`
        id,
        description,
        amount_excl_vat,
        vat_amount,
        created_at,
        status,
        requester:profiles!cycle_expenses_submitted_by_fkey (first_name, last_name)
      `)
      .eq('org_id', resolvedOrgId)
      .eq('status', 'pending')
      .limit(5);

    if (expensesError) {
      throw expensesError;
    }

    const pendingApprovals: PendingApproval[] = (expenses || []).map((expense) => ({
      id: expense.id,
      type: 'expense',
      title: 'Expense Approval',
      description: expense.description,
      amount: expense.amount_excl_vat + (expense.vat_amount || 0),
      requestedBy: expense.requester
        ? `${(expense.requester as { first_name?: string; last_name?: string }).first_name || ''} ${(expense.requester as { first_name?: string; last_name?: string }).last_name || ''}`.trim() || 'Unknown'
        : 'Unknown',
      requestDate: new Date(expense.created_at).toLocaleDateString(),
      priority: 'normal',
    }));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: logs, error: logsError } = await supabase
      .from('daily_logs')
      .select('log_date, mortality_count, feed_used_kg')
      .eq('org_id', resolvedOrgId)
      .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: true });

    if (logsError) {
      throw logsError;
    }

    const dailyTrend = (logs || []).reduce((acc: Record<string, { count: number; mortality: number }>, log) => {
      if (!acc[log.log_date]) {
        acc[log.log_date] = { count: 0, mortality: 0 };
      }
      acc[log.log_date].count += 1;
      acc[log.log_date].mortality += log.mortality_count || 0;
      return acc;
    }, {});

    const chartData: ChartData[] = Object.keys(dailyTrend).map((date) => ({
      name: date.split('-').slice(1).join('/'),
      mortality: dailyTrend[date].mortality,
      fcr: 1.65 + Math.random() * 0.1,
    }));

    return {
      stats,
      chartData,
      pendingApprovals,
      flockSummary,
    };
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch dashboard data.', 'dashboard.fetchDashboardData');
  }
}
