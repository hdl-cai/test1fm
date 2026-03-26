/**
 * Production Cycles Store
 * Zustand store for production cycle management
 */

import { create } from 'zustand';
import type { ProductionCycle } from '@/types';
import { mapCycleRowToProductionCycle } from '@/lib/data-adapters';
import { supabase } from '@/lib/supabase';
import { differenceInDays } from 'date-fns';
import { useAuthStore } from './useAuthStore';

function getCycleSummary(cycles: ProductionCycle[]) {
  const activeCycles = cycles.filter(c => c.status === 'active');
  const completedCycles = cycles.filter(c => c.status === 'completed');
  const totalActiveBirds = activeCycles.reduce((sum, c) => sum + c.birdCount, 0);
  const cyclesWithFCR = cycles.filter(c => c.fcr !== undefined && c.fcr > 0);
  const averageFCR = cyclesWithFCR.length > 0
    ? cyclesWithFCR.reduce((sum, c) => sum + (c.fcr || 0), 0) / cyclesWithFCR.length
    : 0;
  const averageMortalityRate = activeCycles.length > 0
    ? activeCycles.reduce((sum, c) => sum + c.mortalityRate, 0) / activeCycles.length
    : 0;

  return {
    activeCyclesCount: activeCycles.length,
    completedCyclesCount: completedCycles.length,
    totalActiveBirds,
    averageFCR,
    averageMortalityRate,
  };
}

export interface CyclesState {
  // Data
  cycles: ProductionCycle[];
  selectedCycleId: string | null;
  isLoading: boolean;
  error: string | null;
  
  activeCyclesCount: number;
  completedCyclesCount: number;
  totalActiveBirds: number;
  averageMortalityRate: number;
  averageFCR: number;
  
  // Actions
  fetchCycles: (orgId: string) => Promise<void>;
  setCycles: (cycles: ProductionCycle[]) => void;
  selectCycle: (cycleId: string | null) => void;
  updateCycle: (cycleId: string, updates: Partial<ProductionCycle>) => void;
  createCycle: (data: { batchName: string; farmId: string; growerId: string; birdCount: number; startDate: string; anticipatedHarvestDate: string; orgId: string }) => Promise<void>;
  completeCycle: (cycleId: string, finalData: { averageWeight: number; revenue: number; cost: number }) => void;
  
  // Selectors
  getCycleById: (cycleId: string) => ProductionCycle | undefined;
  getCyclesByFarmId: (farmId: string) => ProductionCycle[];
  getCyclesByGrowerId: (growerId: string) => ProductionCycle[];
  getActiveCyclesByFarmId: (farmId: string) => ProductionCycle[];
  getCycleProgress: (cycle: ProductionCycle) => number;
  getDaysRemaining: (cycle: ProductionCycle) => number;
}

export const useCyclesStore = create<CyclesState>((set, get) => ({
  // Initial state
  cycles: [],
  selectedCycleId: null,
  isLoading: false,
  error: null,
  activeCyclesCount: 0,
  completedCyclesCount: 0,
  totalActiveBirds: 0,
  averageMortalityRate: 0,
  averageFCR: 0,
  
  // Actions
  fetchCycles: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('production_cycles')
        .select(`
          *,
          farms (name),
          performance_metrics (fcr_to_date, livability_pct, created_at)
        `)
        .eq('org_id', orgId)
        .range(0, 199);

      if (error) throw error;

       const mappedCycles: ProductionCycle[] = (data || []).map(mapCycleRowToProductionCycle);

      const summary = getCycleSummary(mappedCycles);

      set({ 
        cycles: mappedCycles, 
        isLoading: false,
        ...summary
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch production cycles.';
      set({ error: message, isLoading: false });
    }
  },

  setCycles: (newCycles) => set({ cycles: newCycles }),
  
  selectCycle: (cycleId) => set({ selectedCycleId: cycleId }),
  
  updateCycle: (cycleId, updates) => set((state) => ({
    cycles: state.cycles.map(cycle => 
      cycle.id === cycleId 
        ? { ...cycle, ...updates }
        : cycle
    ),
  })),
  
  createCycle: async ({ batchName, farmId, growerId, birdCount, startDate, anticipatedHarvestDate, orgId }) => {
    set({ isLoading: true, error: null });
    try {
      const authOrgId = useAuthStore.getState().user?.orgId;
      const resolvedOrgId = authOrgId ?? orgId;
      if (!resolvedOrgId) {
        throw new Error('Organization context is required to create a production cycle.');
      }

      const { data: createdCycle, error } = await supabase
        .from('production_cycles')
        .insert({
          org_id: resolvedOrgId,
          farm_id: farmId,
          grower_id: growerId,
          batch_name: batchName,
          initial_birds: birdCount,
          start_date: startDate,
          anticipated_harvest_date: anticipatedHarvestDate,
          status: 'active',
        })
        .select(`
          *,
          performance_metrics (fcr_to_date, livability_pct, created_at)
        `)
        .single();

      if (error) throw error;

      const nextCycles = [...get().cycles, mapCycleRowToProductionCycle(createdCycle)];
      set({
        cycles: nextCycles,
        isLoading: false,
        ...getCycleSummary(nextCycles),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create production cycle.';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
  
  completeCycle: (cycleId, finalData) => set((state) => ({
    cycles: state.cycles.map(cycle => 
      cycle.id === cycleId 
        ? { 
            ...cycle, 
            status: 'completed',
            averageWeight: finalData.averageWeight,
            revenue: finalData.revenue,
            cost: finalData.cost,
          }
        : cycle
    ),
  })),
  
  // Selectors
  getCycleById: (cycleId) => get().cycles.find(c => c.id === cycleId),
  getCyclesByFarmId: (farmId) => get().cycles.filter(c => c.farmId === farmId),
  getCyclesByGrowerId: (growerId) => get().cycles.filter(c => c.growerId === growerId),
  getActiveCyclesByFarmId: (farmId) => get().cycles.filter(c => c.farmId === farmId && c.status === 'active'),
  getCycleProgress: (cycle) => {
    if (cycle.status === 'completed') return 100;
    const total = differenceInDays(cycle.expectedEndDate, cycle.startDate);
    const elapsed = differenceInDays(new Date(), cycle.startDate);
    return Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100);
  },
  getDaysRemaining: (cycle) => {
    if (cycle.status === 'completed') return 0;
    return Math.max(differenceInDays(cycle.expectedEndDate, new Date()), 0);
  },
}));
