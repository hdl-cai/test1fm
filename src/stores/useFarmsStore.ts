import { create } from 'zustand';
import type { Farm } from '@/types';
import {
  createFarmRecord,
  fetchFarmDetails as fetchFarmDetailsData,
  fetchFarms as fetchFarmList,
  type FarmDetailsData,
} from '@/lib/data/farms';
import { getErrorMessage } from '@/lib/data/errors';

export interface FarmsState {
  // Data
  farms: Farm[];
  selectedFarmId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Details for selected farm
  farmHistory: FarmDetailsData['farmHistory'];
  farmPersonnel: FarmDetailsData['farmPersonnel'];
  farmStock: FarmDetailsData['farmStock'];
  
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
      const farms = await fetchFarmList(orgId);
      set({ farms, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to fetch farms.'), isLoading: false });
    }
  },

  fetchFarmDetails: async (farmId: string) => {
    set({ isLoading: true, error: null });
    try {
      const details = await fetchFarmDetailsData(farmId);

      set({
        farmHistory: details.farmHistory,
        farmPersonnel: details.farmPersonnel,
        farmStock: details.farmStock,
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
      const newFarm = await createFarmRecord({ name, region, capacity, houseCount, lat, lng, orgId });
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
