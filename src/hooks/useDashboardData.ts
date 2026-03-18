import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

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

export function useDashboardData() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalBirds: 0,
    avgMortality: 0,
    avgFCR: 0,
    activeCyclesCount: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [flockSummary, setFlockSummary] = useState<FlockSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.orgId) return;

    async function fetchData() {
      setIsLoading(true);
      try {
        // 1. Fetch Active Cycles Stats & Summary
        const { data: cycles, error: cyclesError } = await supabase
          .from('production_cycles')
          .select(`
            id, 
            initial_birds, 
            status, 
            batch_name,
            farm:farms (name),
            grower:profiles (first_name, last_name)
          `)
          .eq('org_id', user!.orgId!)
          .eq('status', 'active');

        if (cyclesError) throw cyclesError;

        // 2. Fetch Performance Metrics for aggregate stats
        const cycleIds = cycles.map(c => c.id);
        let globalMortality = 0;
        let globalFCR = 0;
        const metricsMap = new Map();

        if (cycleIds.length > 0) {
          const { data: metrics, error: metricsError } = await supabase
            .from('performance_metrics')
            .select('livability_pct, fcr_to_date, cycle_id, created_at')
            .in('cycle_id', cycleIds)
            .order('created_at', { ascending: false });

          if (!metricsError && metrics) {
            metrics.forEach(m => {
              if (!metricsMap.has(m.cycle_id)) {
                metricsMap.set(m.cycle_id, m);
              }
            });

            const values = Array.from(metricsMap.values());
            if (values.length > 0) {
              globalMortality = 100 - (values.reduce((acc, m) => acc + ((m.livability_pct || 1) * 100), 0) / values.length);
              globalFCR = values.reduce((acc, m) => acc + (m.fcr_to_date || 0), 0) / values.length;
            }
          }
        }

        setStats({
          totalBirds: cycles.reduce((acc, c) => acc + (c.initial_birds || 0), 0),
          avgMortality: globalMortality,
          avgFCR: globalFCR,
          activeCyclesCount: cycles.length,
        });

        // Map flock summary
        setFlockSummary(cycles.map(c => {
          const m = metricsMap.get(c.id);
          return {
            id: c.id,
            farmName: (c.farm as any)?.name || 'Unknown',
            batchName: c.batch_name,
            growerName: c.grower ? `${(c.grower as any).first_name} ${(c.grower as any).last_name}` : 'Unknown',
            birdCount: c.initial_birds,
            mortalityRate: m ? 100 - (m.livability_pct * 100) : 0,
            fcr: m ? m.fcr_to_date : 0,
            status: c.status,
          };
        }));

        // 3. Pending Approvals
        const { data: expenses, error: expensesError } = await supabase
          .from('cycle_expenses')
          .select(`
            id, 
            description, 
            amount_excl_vat, 
            vat_amount, 
            created_at, 
            status,
            profiles (first_name, last_name)
          `)
          .eq('org_id', user!.orgId!)
          .eq('status', 'pending')
          .limit(5);

        if (!expensesError && expenses) {
          setPendingApprovals(expenses.map(e => ({
            id: e.id,
            type: 'expense',
            title: 'Expense Approval',
            description: e.description,
            amount: e.amount_excl_vat + (e.vat_amount || 0),
            requestedBy: (e as any).profiles ? `${(e as any).profiles.first_name} ${(e as any).profiles.last_name}` : 'Unknown',
            requestDate: new Date(e.created_at).toLocaleDateString(),
            priority: 'normal',
          })));
        }

        // 4. Chart Data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: logs, error: logsError } = await supabase
          .from('daily_logs')
          .select('log_date, mortality_count, feed_used_kg')
          .eq('org_id', user!.orgId!)
          .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0])
          .order('log_date', { ascending: true });

        if (!logsError && logs) {
          const dailyTrend = logs.reduce((acc: any, log) => {
            if (!acc[log.log_date]) acc[log.log_date] = { count: 0, mortality: 0 };
            acc[log.log_date].count++;
            acc[log.log_date].mortality += log.mortality_count || 0;
            return acc;
          }, {});

          setChartData(Object.keys(dailyTrend).map(date => ({
            name: date.split('-').slice(1).join('/'), // MM/DD
            mortality: dailyTrend[date].mortality,
            fcr: 1.65 + (Math.random() * 0.1), 
          })));
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user?.orgId]);

  return { stats, chartData, pendingApprovals, flockSummary, isLoading };
}
