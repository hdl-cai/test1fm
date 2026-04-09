/**
 * Market Store
 * Zustand store for market prices management
 */

import { create } from 'zustand';
import { 
  fetchMarketPrices, 
  fetchLatestMarketPrice, 
  upsertMarketPrice, 
  verifyMarketPrice, 
  deleteMarketPrice
} from '@/lib/data/market';
import type {
  MarketPrice,
  MarketPriceInsert,
  MarketPriceWithProfile,
} from '@/lib/data/market';
import { getErrorMessage } from '@/lib/data/errors';

export interface MarketState {
  // Data
  prices: MarketPriceWithProfile[];
  latestPrices: Record<string, MarketPrice>; // key is region
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPrices: (orgId: string, filters?:Parameters<typeof fetchMarketPrices>[1]) => Promise<void>;
  fetchLatestPrice: (orgId: string, region: string) => Promise<void>;
  addPrice: (orgId: string, priceData: Omit<MarketPriceInsert, 'org_id' | 'entered_by'>, userId: string) => Promise<void>;
  verifyPrice: (priceId: string) => Promise<void>;
  removePrice: (priceId: string) => Promise<void>;
  
  // Selectors
  getPriceById: (id: string) => MarketPriceWithProfile | undefined;
  getPricesByRegion: (region: string) => MarketPriceWithProfile[];
}

export const useMarketStore = create<MarketState>((set, get) => ({
  // Initial state
  prices: [],
  latestPrices: {},
  isLoading: false,
  error: null,
  
  // Actions
  fetchPrices: async (orgId, filters) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchMarketPrices(orgId, filters);
      set({ prices: data, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to fetch market prices.'), isLoading: false });
    }
  },
  
  fetchLatestPrice: async (orgId, region) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchLatestMarketPrice(orgId, region);
      if (data) {
        set((state) => ({
          latestPrices: { ...state.latestPrices, [region]: data },
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to fetch latest market price.'), isLoading: false });
    }
  },
  
  addPrice: async (orgId, priceData, userId) => {
    set({ isLoading: true, error: null });
    try {
      const newPrice = await upsertMarketPrice(orgId, priceData, userId);
      const enriched: MarketPriceWithProfile = { ...newPrice, profiles: null };
      set((state) => ({
        prices: [enriched, ...state.prices],
        latestPrices: { ...state.latestPrices, [newPrice.region]: newPrice },
        isLoading: false
      }));
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to add market price.'), isLoading: false });
      throw err;
    }
  },
  
  verifyPrice: async (priceId) => {
    set({ isLoading: true, error: null });
    try {
      await verifyMarketPrice(priceId);
      set((state) => ({
        prices: state.prices.map(p => 
          p.id === priceId 
            ? { ...p, last_verified_at: new Date().toISOString() } 
            : p
        ),
        isLoading: false
      }));
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to verify market price.'), isLoading: false });
    }
  },
  
  removePrice: async (priceId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteMarketPrice(priceId);
      set((state) => ({
        prices: state.prices.filter(p => p.id !== priceId),
        isLoading: false
      }));
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to delete market price.'), isLoading: false });
    }
  },
  
  // Selectors
  getPriceById: (id) => get().prices.find(p => p.id === id),
  getPricesByRegion: (region) => get().prices.filter(p => p.region === region),
}));
