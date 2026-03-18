import { create } from 'zustand';
import type { Farm } from '@/types';
import { supabase } from '@/lib/supabase';

export interface FarmsState {
  // Data
  farms: Farm[];
  selectedFarmId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Details for selected farm
  farmHistory: any[];
  farmPersonnel: any[];
  farmStock: any[];
  
  // Computed values (derived from data)
  activeFarms: Farm[];
  totalBirdCount: number;
  totalCapacity: number;
  occupancyRate: number;
  
  // Actions
  fetchFarms: (orgId: string) => Promise<void>;
  fetchFarmDetails: (farmId: string) => Promise<void>;
  setFarms: (farms: Farm[]) => void;
  selectFarm: (farmId: string | null) => void;
  updateFarm: (farmId: string, updates: Partial<Farm>) => void;
  addFarm: (farm: Omit<Farm, 'id' | 'lastUpdated'>) => void;
  
  // Selectors
  getFarmById: (farmId: string) => Farm | undefined;
  getActiveFarms: () => Farm[];
}

export const useFarmsStore = create<FarmsState>((set, get) => ({
  // Initial state
  farms: [],
  selectedFarmId: null,
  isLoading: false,
  error: null,
  farmHistory: [],
  farmPersonnel: [],
  farmStock: [],
  
  // Computed values implemented as getters
  get activeFarms() {
    return get().farms.filter(farm => farm.status === 'active');
  },
  get totalBirdCount() {
    return get().farms.reduce((total, farm) => total + farm.currentBirdCount, 0);
  },
  get totalCapacity() {
    return get().farms.reduce((total, farm) => total + farm.capacity, 0);
  },
  get occupancyRate() {
    const totalCapacity = get().totalCapacity;
    const totalBirds = get().totalBirdCount;
    return totalCapacity > 0 ? (totalBirds / totalCapacity) * 100 : 0;
  },
  
  // Actions
  fetchFarms: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Fetch all farms for the organization
      const { data: farmsData, error: farmsError } = await supabase
        .from('farms')
        .select('*')
        .eq('org_id', orgId);

      if (farmsError) throw farmsError;

      // 2. Fetch active cycles to calculate bird counts and metrics
      const { data: cyclesData, error: cyclesError } = await supabase
        .from('production_cycles')
        .select(`
          id, 
          farm_id, 
          initial_birds,
          performance_metrics (fcr_to_date, livability_pct)
        `)
        .eq('org_id', orgId)
        .eq('status', 'active');

      if (cyclesError) throw cyclesError;

      // 3. Map to Farm interface
      const mappedFarms: Farm[] = (farmsData || []).map(f => {
        const farmCycles = (cyclesData || []).filter(c => c.farm_id === f.id);
        const currentBirdCount = farmCycles.reduce((acc, c) => acc + (c.initial_birds || 0), 0);
        
        // Calculate average FCR and Livability for the farm from active cycles
        let totalFCR = 0;
        let totalLivability = 0;
        let metricsCount = 0;

        farmCycles.forEach(c => {
          const metrics = c.performance_metrics as any[];
          if (metrics && metrics.length > 0) {
            // Get the latest metric
            const latest = metrics[metrics.length - 1];
            totalFCR += latest.fcr_to_date || 0;
            totalLivability += latest.livability_pct || 1;
            metricsCount++;
          }
        });

        const avgFCR = metricsCount > 0 ? totalFCR / metricsCount : 0;
        const avgLivability = metricsCount > 0 ? totalLivability / metricsCount : 1;

        return {
          id: f.id,
          name: f.name,
          region: f.region || 'Unknown',
          status: f.status as any,
          capacity: f.capacity,
          currentBirdCount: currentBirdCount,
          activeCycles: farmCycles.length,
          avgFCR: avgFCR,
          avgLiveWeight: 0, // Need daily_logs for this, can add later if critical
          bpi: (avgLivability * 100 * 1.8) / (avgFCR * 32) * 100, // Approximate BPI formula
          coordinates: { 
            lat: f.location_lat || 14.5995, 
            lng: f.location_lng || 120.9842 
          },
          lastUpdated: new Date(f.created_at),
        };
      });

      set({ farms: mappedFarms, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchFarmDetails: async (farmId: string) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Fetch production history (completed cycles)
      const { data: history, error: historyError } = await supabase
        .from('production_cycles')
        .select(`
          id, 
          batch_name, 
          initial_birds,
          start_date,
          actual_end_date,
          status,
          performance_metrics (fcr_to_date, livability_pct)
        `)
        .eq('farm_id', farmId)
        .order('actual_end_date', { ascending: false });

      if (historyError) throw historyError;

      // 2. Fetch personnel (assignments -> profiles)
      const { data: assignments, error: personnelError } = await supabase
        .from('farm_assignments')
        .select(`
          role,
          status,
          profiles (
            id,
            first_name,
            last_name,
            email,
            id
          )
        `)
        .eq('farm_id', farmId);

      if (personnelError) throw personnelError;

      // 3. Fetch inventory stock for the farm
      const { data: stock, error: stockError } = await supabase
        .from('inventory_stock')
        .select(`
          current_qty,
          inventory_items (name, unit)
        `)
        .eq('farm_id', farmId);

      if (stockError) throw stockError;

      set({ 
        farmHistory: history || [], 
        farmPersonnel: assignments || [],
        farmStock: stock || [],
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  setFarms: (newFarms) => set({ farms: newFarms }),
  
  selectFarm: (farmId) => set({ selectedFarmId: farmId }),
  
  updateFarm: (farmId, updates) => set((state) => ({
    farms: state.farms.map(farm => 
      farm.id === farmId 
        ? { ...farm, ...updates, lastUpdated: new Date() }
        : farm
    ),
  })),
  
  addFarm: (farmData) => set((state) => {
    const newFarm: Farm = {
      ...farmData,
      id: `farm-${String(state.farms.length + 1).padStart(3, '0')}`,
      lastUpdated: new Date(),
    };
    return { farms: [...state.farms, newFarm] };
  }),
  
  // Selectors
  getFarmById: (farmId) => get().farms.find(f => f.id === farmId),
  getActiveFarms: () => get().farms.filter(f => f.status === 'active'),
}));
