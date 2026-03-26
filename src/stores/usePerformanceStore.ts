/**
 * Performance Store
 * Zustand store for production performance, leaderboard, and KPIs with live data integration
 */

import { create } from 'zustand';
import { fetchPerformanceData as fetchPerformanceDataFromDataLayer } from '@/lib/data/performance';
import { getErrorMessage } from '@/lib/data/errors';

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
      const data = await fetchPerformanceDataFromDataLayer(orgId);
      set({ 
        leaderboard: data.leaderboard, 
        stats: data.stats, 
        fcrHistory: data.fcrHistory,
        mortalityHistory: data.mortalityHistory,
        financialHistory: data.financialHistory,
        costBreakdown: data.costBreakdown,
        isLoading: false 
      });
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to fetch performance data.');
      set({ error: message, isLoading: false });
    }
  }
}));
