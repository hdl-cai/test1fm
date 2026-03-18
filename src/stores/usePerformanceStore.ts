/**
 * Performance Store
 * Zustand store for production performance, leaderboard, and KPIs with live data integration
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
  trend: 'up' | 'down' | 'neutral';
  efficiency: number; // Percentage
  status: 'Elite' | 'Senior' | 'Junior' | 'Training';
  lastBatchDate: string;
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

export interface PerformanceState {
  // Data
  stats: PerformanceStats | null;
  leaderboard: LeaderboardEntry[];
  fcrHistory: ChartDataPoint[];
  mortalityHistory: ChartDataPoint[];
  financialHistory: FinancialDataPoint[];
  costBreakdown: CostCategoryPoint[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPerformanceData: (orgId: string) => Promise<void>;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  stats: null,
  leaderboard: [],
  fcrHistory: [],
  mortalityHistory: [],
  financialHistory: [],
  costBreakdown: [],
  isLoading: false,
  error: null,

  fetchPerformanceData: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Fetch historical performance data from grower_performance
      const { data: historyData, error: historyError } = await supabase
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
        .order('created_at', { ascending: true })
        .limit(20);

      if (historyError) throw historyError;

      // 2. Fetch Aggregated Org Performance
      const { data: orgMetrics, error: metricsError } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('org_id', orgId);

      if (metricsError) throw metricsError;

      // 3. Fetch Financial Data for Trends
      const { data: settlements, error: settlementsError } = await supabase
        .from('settlement_statements')
        .select('created_at, total_production_value, final_net_payout')
        .eq('org_id', orgId)
        .order('created_at', { ascending: true });

      if (settlementsError) throw settlementsError;

      const { data: expenses, error: expensesError } = await supabase
        .from('cycle_expenses')
        .select('created_at, total_paid, category:expense_categories(name)')
        .eq('org_id', orgId);

      if (expensesError) throw expensesError;

      // --- TRANSFORMATIONS ---

      // Map Leaderboard
      const uniqueGrowers = new Map<string, LeaderboardEntry>();
      (historyData || []).forEach((entry) => {
          const name = `${(entry.profiles as any)?.first_name || '' } ${(entry.profiles as any)?.last_name || ''}`.trim();
          uniqueGrowers.set(entry.grower_id, {
            id: entry.grower_id,
            growerName: name,
            epef: Number(entry.epef_score) || 0,
            points: Number(entry.total_points) || 0,
            rank: 0,
            trend: 'neutral',
            efficiency: Math.min(100, (Number(entry.epef_score) || 0) / 400 * 100),
            status: entry.epef_score && entry.epef_score > 350 ? 'Elite' : entry.epef_score && entry.epef_score > 300 ? 'Senior' : 'Junior',
            lastBatchDate: entry.created_at
          });
      });

      const leaderboard = Array.from(uniqueGrowers.values())
        .sort((a, b) => b.points - a.points)
        .map((g, i) => ({ ...g, rank: i + 1 }));

      // FCR & Mortality History
      const fcrHistory: ChartDataPoint[] = (historyData || []).map(entry => ({
        label: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short' }),
        value: Number(entry.final_fcr) || 0
      }));

      const mortalityHistory: ChartDataPoint[] = (historyData || []).map(entry => ({
        label: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short' }),
        value: (Number(entry.final_mortality_rate) || 0) * 100
      }));

      // Financial History (Group by month)
      const financialByMonth = new Map<string, FinancialDataPoint>();
      
      // Process Revenue from settlements (Treating as Gross Revenue)
      (settlements || []).forEach(s => {
          const month = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short' });
          const current = financialByMonth.get(month) || { month, revenue: 0, cost: 0, profit: 0 };
          const rev = Math.abs(Number(s.total_production_value) || 0);
          current.revenue += rev;
          current.profit += rev; // Start with Gross as base for Profit
          financialByMonth.set(month, current);
      });

      // Process Costs from expenses
      (expenses || []).forEach(e => {
          const month = new Date(e.created_at).toLocaleDateString('en-US', { month: 'short' });
          const current = financialByMonth.get(month) || { month, revenue: 0, cost: 0, profit: 0 };
          const cost = Math.abs(Number(e.total_paid) || 0);
          current.cost += cost;
          current.profit -= cost; // Deduct cost from Gross to get Net Profit
          financialByMonth.set(month, current);
      });

      const financialHistory = Array.from(financialByMonth.values());

      // Cost Breakdown
      const categoryMap = new Map<string, number>();
      const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
      
      (expenses || []).forEach(e => {
          const catName = (e.category as any)?.name || 'Uncategorized';
          const cost = Math.abs(Number(e.total_paid) || 0);
          categoryMap.set(catName, (categoryMap.get(catName) || 0) + cost);
      });

      const costBreakdown: CostCategoryPoint[] = Array.from(categoryMap.entries()).map(([name, value], i) => ({
          name,
          value,
          color: chartColors[i % chartColors.length]
      }));

      // Averages for Stats
      const stats: PerformanceStats = {
        epef: orgMetrics?.length ? orgMetrics.reduce((sum, m: any) => sum + (m.epef_to_date || 0), 0) / orgMetrics.length : (historyData?.length ? historyData.reduce((sum, h) => sum + (h.epef_score || 0), 0) / historyData.length : 0),
        livability: orgMetrics?.length ? orgMetrics.reduce((sum, m: any) => sum + (m.livability_pct || 0), 0) / orgMetrics.length : (historyData?.length ? historyData.reduce((sum, h) => sum + (100 - (h.final_mortality_rate || 0) * 100), 0) / historyData.length : 0),
        fcr: orgMetrics?.length ? orgMetrics.reduce((sum, m: any) => sum + (m.fcr_to_date || 0), 0) / orgMetrics.length : (historyData?.length ? historyData.reduce((sum, h) => sum + (h.final_fcr || 0), 0) / historyData.length : 0),
        avgWeight: 0, 
        epefTrend: 'stable',
        epefChange: 0
      };

      set({ 
        leaderboard, 
        stats, 
        fcrHistory,
        mortalityHistory,
        financialHistory,
        costBreakdown,
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  }
}));
