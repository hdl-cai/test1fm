/**
 * Inventory Data
 * 
 * 24 Inventory Items: feed, medical, supplements
 * Mixed global and farm-specific items
 */

import type { InventoryItem } from '@/types';

export const inventoryItems: InventoryItem[] = [
  // FEED (12 items)
  // Starter feeds
  {
    id: 'inv-001',
    name: 'Premium Starter Feed',
    category: 'feed',
    currentStock: 5000,
    unit: 'kg',
    threshold: 1000,
    status: 'in_stock',
    farmId: 'farm-001',
    lastRestocked: new Date('2026-01-25'),
  },
  {
    id: 'inv-002',
    name: 'Starter Feed Type B',
    category: 'feed',
    currentStock: 3500,
    unit: 'kg',
    threshold: 800,
    status: 'in_stock',
    farmId: 'farm-002',
    lastRestocked: new Date('2026-01-28'),
  },
  {
    id: 'inv-003',
    name: 'Organic Starter',
    category: 'feed',
    currentStock: 2800,
    unit: 'kg',
    threshold: 500,
    status: 'in_stock',
    farmId: 'farm-003',
    lastRestocked: new Date('2026-01-30'),
  },
  
  // Grower feeds
  {
    id: 'inv-004',
    name: 'Grower Feed Standard',
    category: 'feed',
    currentStock: 8500,
    unit: 'kg',
    threshold: 2000,
    status: 'in_stock',
    farmId: 'farm-001',
    lastRestocked: new Date('2026-01-20'),
  },
  {
    id: 'inv-005',
    name: 'Grower Feed Premium',
    category: 'feed',
    currentStock: 4200,
    unit: 'kg',
    threshold: 1000,
    status: 'in_stock',
    farmId: 'farm-002',
    lastRestocked: new Date('2026-01-22'),
  },
  {
    id: 'inv-006',
    name: 'Grower Feed Economy',
    category: 'feed',
    currentStock: 1800,
    unit: 'kg',
    threshold: 1500,
    status: 'low_stock',
    farmId: 'farm-003',
    lastRestocked: new Date('2026-01-15'),
  },
  
  // Finisher feeds
  {
    id: 'inv-007',
    name: 'Finisher Feed A',
    category: 'feed',
    currentStock: 6200,
    unit: 'kg',
    threshold: 1500,
    status: 'in_stock',
    farmId: 'farm-001',
    lastRestocked: new Date('2026-01-18'),
  },
  {
    id: 'inv-008',
    name: 'Finisher Feed B',
    category: 'feed',
    currentStock: 3900,
    unit: 'kg',
    threshold: 1000,
    status: 'in_stock',
    farmId: 'farm-002',
    lastRestocked: new Date('2026-01-24'),
  },
  
  // Global feed items
  {
    id: 'inv-009',
    name: 'Broiler Premix',
    category: 'feed',
    currentStock: 450,
    unit: 'kg',
    threshold: 100,
    status: 'in_stock',
    lastRestocked: new Date('2026-01-10'),
  },
  {
    id: 'inv-010',
    name: 'Layer Mash',
    category: 'feed',
    currentStock: 0,
    unit: 'kg',
    threshold: 500,
    status: 'out_of_stock',
    lastRestocked: new Date('2025-12-20'),
  },
  {
    id: 'inv-011',
    name: 'Corn Grits',
    category: 'feed',
    currentStock: 12000,
    unit: 'kg',
    threshold: 3000,
    status: 'in_stock',
    lastRestocked: new Date('2026-01-05'),
  },
  {
    id: 'inv-012',
    name: 'Soybean Meal',
    category: 'feed',
    currentStock: 8000,
    unit: 'kg',
    threshold: 2000,
    status: 'in_stock',
    lastRestocked: new Date('2026-01-08'),
  },
  
  // MEDICAL (6 items)
  {
    id: 'inv-013',
    name: 'Newcastle Vaccine',
    category: 'medical',
    currentStock: 250,
    unit: 'doses',
    threshold: 50,
    status: 'in_stock',
    lastRestocked: new Date('2026-01-15'),
  },
  {
    id: 'inv-014',
    name: 'Gumboro Vaccine',
    category: 'medical',
    currentStock: 180,
    unit: 'doses',
    threshold: 40,
    status: 'in_stock',
    lastRestocked: new Date('2026-01-12'),
  },
  {
    id: 'inv-015',
    name: 'Coccidiostat',
    category: 'medical',
    currentStock: 35,
    unit: 'kg',
    threshold: 10,
    status: 'in_stock',
    lastRestocked: new Date('2026-01-20'),
  },
  {
    id: 'inv-016',
    name: 'Antibiotics - Enrofloxacin',
    category: 'medical',
    currentStock: 12,
    unit: 'bottles',
    threshold: 5,
    status: 'low_stock',
    lastRestocked: new Date('2025-12-28'),
  },
  {
    id: 'inv-017',
    name: 'Vitamins & Electrolytes',
    category: 'medical',
    currentStock: 85,
    unit: 'sachets',
    threshold: 20,
    status: 'in_stock',
    lastRestocked: new Date('2026-01-25'),
  },
  {
    id: 'inv-018',
    name: 'Disinfectant Solution',
    category: 'medical',
    currentStock: 45,
    unit: 'liters',
    threshold: 10,
    status: 'in_stock',
    lastRestocked: new Date('2026-01-18'),
  },
  
  // SUPPLEMENTS (6 items)
  {
    id: 'inv-019',
    name: 'Lysine Supplement',
    category: 'supplements',
    currentStock: 120,
    unit: 'kg',
    threshold: 25,
    status: 'in_stock',
    lastRestocked: new Date('2026-01-10'),
  },
  {
    id: 'inv-020',
    name: 'Methionine',
    category: 'supplements',
    currentStock: 95,
    unit: 'kg',
    threshold: 20,
    status: 'in_stock',
    lastRestocked: new Date('2026-01-14'),
  },
  {
    id: 'inv-021',
    name: 'Calcium Carbonate',
    category: 'supplements',
    currentStock: 280,
    unit: 'kg',
    threshold: 50,
    status: 'in_stock',
    lastRestocked: new Date('2026-01-08'),
  },
  {
    id: 'inv-022',
    name: 'Phytase Enzyme',
    category: 'supplements',
    currentStock: 18,
    unit: 'kg',
    threshold: 5,
    status: 'in_stock',
    lastRestocked: new Date('2025-12-30'),
  },
  {
    id: 'inv-023',
    name: 'Probiotic Mix',
    category: 'supplements',
    currentStock: 8,
    unit: 'kg',
    threshold: 10,
    status: 'low_stock',
    lastRestocked: new Date('2025-12-22'),
  },
  {
    id: 'inv-024',
    name: 'Mycotoxin Binder',
    category: 'supplements',
    currentStock: 55,
    unit: 'kg',
    threshold: 15,
    status: 'in_stock',
    lastRestocked: new Date('2026-01-16'),
  },
];

// Helper functions
export function getInventoryItemById(id: string): InventoryItem | undefined {
  return inventoryItems.find(item => item.id === id);
}

export function getInventoryByCategory(category: InventoryItem['category']): InventoryItem[] {
  return inventoryItems.filter(item => item.category === category);
}

export function getInventoryByFarmId(farmId: string | null): InventoryItem[] {
  if (farmId === null) {
    return inventoryItems.filter(item => item.farmId === undefined);
  }
  return inventoryItems.filter(item => item.farmId === farmId || item.farmId === undefined);
}

export function getInventoryByStatus(status: InventoryItem['status']): InventoryItem[] {
  return inventoryItems.filter(item => item.status === status);
}

export function getLowStockItems(): InventoryItem[] {
  return inventoryItems.filter(item => item.status === 'low_stock');
}

export function getOutOfStockItems(): InventoryItem[] {
  return inventoryItems.filter(item => item.status === 'out_of_stock');
}

export function getFeedItems(): InventoryItem[] {
  return inventoryItems.filter(item => item.category === 'feed');
}

export function getMedicalItems(): InventoryItem[] {
  return inventoryItems.filter(item => item.category === 'medical');
}

export function getSupplementItems(): InventoryItem[] {
  return inventoryItems.filter(item => item.category === 'supplements');
}

export function getTotalFeedStock(): number {
  return inventoryItems
    .filter(item => item.category === 'feed')
    .reduce((sum, item) => sum + item.currentStock, 0);
}

export function getInventoryValue(unitPrices: Record<string, number>): number {
  return inventoryItems.reduce((total, item) => {
    const price = unitPrices[item.id] || 0;
    return total + (item.currentStock * price);
  }, 0);
}

export function getItemsNeedingRestock(): InventoryItem[] {
  return inventoryItems.filter(
    item => item.status === 'low_stock' || item.status === 'out_of_stock'
  );
}
