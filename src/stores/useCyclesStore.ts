/**
 * Production Cycles Store
 * Zustand store for production cycle management
 */

import { create } from 'zustand';
import type { ProductionCycle } from '@/types';
import { supabase } from '@/lib/supabase';
import { differenceInDays } from 'date-fns';

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
          performance_metrics (fcr_to_date, livability_pct)
        `)
        .eq('org_id', orgId)
        .range(0, 199);

      if (error) throw error;

       const mappedCycles: ProductionCycle[] = (data || []).map(row => {
        const metrics = row.performance_metrics as any[];
        // Sort metrics by created_at descending to get the latest one
        const sortedMetrics = metrics ? [...metrics].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ) : [];
        const latest = sortedMetrics.length > 0 ? sortedMetrics[0] : null;
        
        return {
          id: row.id,
          farmId: row.farm_id,
          growerId: row.grower_id,
          batchName: row.batch_name,
          startDate: new Date(row.start_date),
          expectedEndDate: new Date(row.anticipated_harvest_date || row.start_date),
          birdCount: row.initial_birds,
          status: row.status as any,
          mortalityRate: latest ? 100 - (latest.livability_pct * 100) : 0,
          feedConsumed: 0,
          currentFeedStock: 0,
          fcr: latest?.fcr_to_date || 0,
        };
      });

      // Calculate aggregate metrics
      const activeCycles = mappedCycles.filter(c => c.status === 'active');
      const completedCycles = mappedCycles.filter(c => c.status === 'completed');
      const totalActiveBirds = activeCycles.reduce((sum, c) => sum + c.birdCount, 0);
      const cyclesWithFCR = mappedCycles.filter(c => c.fcr !== undefined && c.fcr > 0);
      const averageFCR = cyclesWithFCR.length > 0 
        ? cyclesWithFCR.reduce((sum, c) => sum + (c.fcr || 0), 0) / cyclesWithFCR.length 
        : 0;
      const averageMortalityRate = activeCycles.length > 0
        ? activeCycles.reduce((sum, c) => sum + c.mortalityRate, 0) / activeCycles.length
        : 0;

      set({ 
        cycles: mappedCycles, 
        isLoading: false,
        activeCyclesCount: activeCycles.length,
        completedCyclesCount: completedCycles.length,
        totalActiveBirds,
        averageFCR,
        averageMortalityRate
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
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
      const { error } = await supabase
        .from('production_cycles')
        .insert({
          org_id: orgId,
          farm_id: farmId,
          grower_id: growerId,
          batch_name: batchName,
          initial_birds: birdCount,
          start_date: startDate,
          anticipated_harvest_date: anticipatedHarvestDate,
          status: 'active',
        });

      if (error) throw error;

      // Re-fetch cycles to get the server-generated ID and updated list
      await get().fetchCycles(orgId);
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
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
