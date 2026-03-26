import { create } from 'zustand';
import type { Farm } from '@/types';
import type { Tables } from '@/types/supabase';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';

type FarmMetricRow = Pick<Tables<'performance_metrics'>, 'created_at' | 'fcr_to_date' | 'livability_pct'>;
type FarmCycleRow = Pick<
  Tables<'production_cycles'>,
  'id' | 'farm_id' | 'initial_birds' | 'batch_name' | 'start_date' | 'actual_end_date' | 'status'
> & {
  performance_metrics: FarmMetricRow[] | null;
};
type FarmHistoryRow = FarmCycleRow;
type FarmPersonnelRow = Pick<Tables<'farm_assignments'>, 'role' | 'status'> & {
  profiles: Pick<Tables<'profiles'>, 'id' | 'first_name' | 'last_name' | 'email'> | null;
};
type FarmStockRow = Pick<Tables<'inventory_stock'>, 'current_qty'> & {
  inventory_items: Pick<Tables<'inventory_items'>, 'name' | 'unit'> | null;
};

function toFarmStatus(status: string | null): Farm['status'] {
  if (status === 'empty' || status === 'maintenance') {
    return status;
  }

  return 'active';
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export interface FarmsState {
  // Data
  farms: Farm[];
  selectedFarmId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Details for selected farm
  farmHistory: FarmHistoryRow[];
  farmPersonnel: FarmPersonnelRow[];
  farmStock: FarmStockRow[];
  
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
  createFarm: (data: { name: string; region: string; capacity: number; houseCount?: number; lat?: number; lng?: number; orgId: string }) => Promise<void>;
  
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
        .eq('org_id', orgId)
        .range(0, 199);

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

        farmCycles.forEach((c) => {
          const metrics = (c as FarmCycleRow).performance_metrics || [];
          if (metrics && metrics.length > 0) {
            const latest = metrics
              .slice()
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
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
          status: toFarmStatus(f.status),
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
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to fetch farms.'), isLoading: false });
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
        farmHistory: (history || []) as FarmHistoryRow[],
        farmPersonnel: (assignments || []) as FarmPersonnelRow[],
        farmStock: (stock || []) as FarmStockRow[],
        isLoading: false 
      });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to fetch farm details.'), isLoading: false });
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
  
  createFarm: async ({ name, region, capacity, houseCount, lat, lng, orgId }) => {
    set({ isLoading: true, error: null });
    try {
      const authOrgId = useAuthStore.getState().user?.orgId;
      const resolvedOrgId = authOrgId ?? orgId;
      if (!resolvedOrgId) {
        throw new Error('Organization context is required to create a farm.');
      }

      const { data: createdFarm, error } = await supabase
        .from('farms')
        .insert({
          org_id: resolvedOrgId,
          farm_id_code: name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
          name,
          region,
          capacity,
          house_count: houseCount ?? 1,
          location_lat: lat ?? null,
          location_lng: lng ?? null,
          status: 'active',
        })
        .select('*')
        .single();

      if (error) throw error;

      const newFarm: Farm = {
        id: createdFarm.id,
        name: createdFarm.name,
        region: createdFarm.region || 'Unknown',
        status: toFarmStatus(createdFarm.status),
        capacity: createdFarm.capacity,
        currentBirdCount: 0,
        activeCycles: 0,
        avgFCR: 0,
        avgLiveWeight: 0,
        bpi: 0,
        coordinates: {
          lat: createdFarm.location_lat || 14.5995,
          lng: createdFarm.location_lng || 120.9842
        },
        lastUpdated: new Date(createdFarm.created_at),
      };

      set((state) => ({
        farms: [...state.farms, newFarm],
        isLoading: false,
      }));
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to create farm.'), isLoading: false });
      throw err; // Re-throw so the calling component can handle it
    }
  },
  
  // Selectors
  getFarmById: (farmId) => get().farms.find(f => f.id === farmId),
  getActiveFarms: () => get().farms.filter(f => f.status === 'active'),
}));
