/**
 * Analytics Store
 * Zustand store wrapping all 10 Phase 3B analytics RPC functions.
 */

import { create } from 'zustand';
import { fetchAllAnalytics } from '@/lib/data/analytics';
import { getErrorMessage } from '@/lib/data/errors';
import type {
  FcrTrendPoint,
  MortalityTrendPoint,
  AdgTrendPoint,
  CycleDurationPoint,
  RevenueExpensesPoint,
  NetProfitPoint,
  CostDistPoint,
  CostPerKgPoint,
  SeasonalityPoint,
  InputPerformancePoint,
} from '@/lib/data/analytics';

interface AnalyticsState {
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
  isLoading: boolean;
  error: string | null;
  fetchAllAnalytics: (orgId?: string) => Promise<void>;
  reset: () => void;
}

const initialState: Omit<AnalyticsState, 'fetchAllAnalytics' | 'reset'> = {
  fcrTrend: [],
  mortalityTrend: [],
  adgTrend: [],
  cycleDurationDist: [],
  revenueVsExpenses: [],
  netProfitPerCycle: [],
  costDistribution: [],
  costPerKgTrend: [],
  seasonalityMortality: [],
  inputPerformance: [],
  isLoading: false,
  error: null,
};

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  ...initialState,

  fetchAllAnalytics: async (orgId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchAllAnalytics(orgId);
      set({ ...data, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load analytics'), isLoading: false });
    }
  },

  reset: () => set(initialState),
}));
