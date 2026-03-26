/**
 * Inventory Store
 * Zustand store for inventory management
 */

import { create } from 'zustand';
import { fetchInventoryData } from '@/lib/data/inventory';
import { getErrorMessage } from '@/lib/data/errors';
import type { InventoryItem } from '@/types';

export interface InventoryState {
  // Data
  items: InventoryItem[];
  categories: { id: string, name: string }[];
  selectedItemId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Computed values
  feedItems: InventoryItem[];
  medicalItems: InventoryItem[];
  supplementItems: InventoryItem[];
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  totalFeedStock: number;
  itemsNeedingRestock: number;
  
  // Actions
  setItems: (items: InventoryItem[]) => void;
  fetchInventory: (orgId: string) => Promise<void>;
  selectItem: (itemId: string | null) => void;
  updateItem: (itemId: string, updates: Partial<InventoryItem>) => void;
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  restockItem: (itemId: string, amount: number) => void;
  consumeStock: (itemId: string, amount: number) => void;
  
  // Selectors
  getItemById: (itemId: string) => InventoryItem | undefined;
  getItemsByCategory: (category: InventoryItem['category']) => InventoryItem[];
  getItemsByFarmId: (farmId: string | null) => InventoryItem[];
  getItemsByStatus: (status: InventoryItem['status']) => InventoryItem[];
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // Initial state
  items: [],
  categories: [],
  selectedItemId: null,
  isLoading: false,
  error: null,
  
  // Computed values
  get feedItems() {
    return get().items.filter(item => item.category === 'feed');
  },
  get medicalItems() {
    return get().items.filter(item => item.category === 'medical');
  },
  get supplementItems() {
    return get().items.filter(item => item.category === 'supplements');
  },
  get lowStockItems() {
    return get().items.filter(item => item.status === 'low_stock');
  },
  get outOfStockItems() {
    return get().items.filter(item => item.status === 'out_of_stock');
  },
  get totalFeedStock() {
    return get().items
      .filter(item => item.category === 'feed')
      .reduce((sum, item) => sum + item.currentStock, 0);
  },
  get itemsNeedingRestock() {
    return get().items.filter(
      item => item.status === 'low_stock' || item.status === 'out_of_stock'
    ).length;
  },
  
  // Actions
  setItems: (newItems) => set({ items: newItems }),
  
  fetchInventory: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchInventoryData(orgId);
      set({ categories: data.categories, items: data.items, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to fetch inventory.'), isLoading: false });
    }
  },
  
  selectItem: (itemId) => set({ selectedItemId: itemId }),
  
  updateItem: (itemId, updates) => set((state) => ({
    items: state.items.map(item => 
      item.id === itemId 
        ? { ...item, ...updates }
        : item
    ),
  })),
  
  addItem: (itemData) => set((state) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${String(state.items.length + 1).padStart(3, '0')}`,
    };
    return { items: [...state.items, newItem] };
  }),
  
  restockItem: (itemId, amount) => set((state) => ({
    items: state.items.map(item => {
      if (item.id !== itemId) return item;
      
      const newStock = item.currentStock + amount;
      let newStatus: InventoryItem['status'] = 'in_stock';
      if (newStock === 0) newStatus = 'out_of_stock';
      else if (newStock <= item.threshold) newStatus = 'low_stock';
      
      return {
        ...item,
        currentStock: newStock,
        status: newStatus,
        lastRestocked: new Date(),
      };
    }),
  })),
  
  consumeStock: (itemId, amount) => set((state) => ({
    items: state.items.map(item => {
      if (item.id !== itemId) return item;
      
      const newStock = Math.max(0, item.currentStock - amount);
      let newStatus: InventoryItem['status'] = 'in_stock';
      if (newStock === 0) newStatus = 'out_of_stock';
      else if (newStock <= item.threshold) newStatus = 'low_stock';
      
      return {
        ...item,
        currentStock: newStock,
        status: newStatus,
      };
    }),
  })),
  
  // Selectors
  getItemById: (itemId) => get().items.find(i => i.id === itemId),
  getItemsByCategory: (category) => get().items.filter(i => i.category === category),
  getItemsByFarmId: (farmId) => {
    if (farmId === null) {
      return get().items.filter(item => item.farmId === undefined);
    }
    return get().items.filter(item => item.farmId === farmId || item.farmId === undefined);
  },
  getItemsByStatus: (status) => get().items.filter(i => i.status === status),
}));
