/**
 * Production Cycles Data
 * 
 * 8 Production Cycles: 5 active, 3 completed
 * Linked to farms and growers
 */

import type { ProductionCycle } from '@/types';

export const productionCycles: ProductionCycle[] = [
  // Active Cycles (5)
  {
    id: 'cycle-001',
    farmId: 'farm-001',
    growerId: 'person-003', // Bob Smith
    batchName: 'Batch #2024-A',
    startDate: new Date('2024-12-01'),
    expectedEndDate: new Date('2025-02-15'),
    birdCount: 25000,
    status: 'active',
    mortalityRate: 0.82,
    feedConsumed: 48500,
    currentFeedStock: 2000,
    fcr: 1.94,
    averageWeight: 1850,
  },
  {
    id: 'cycle-002',
    farmId: 'farm-001',
    growerId: 'person-003', // Bob Smith
    batchName: 'Batch #2024-B',
    startDate: new Date('2025-01-10'),
    expectedEndDate: new Date('2025-03-25'),
    birdCount: 23750,
    status: 'active',
    mortalityRate: 0.65,
    feedConsumed: 28000,
    currentFeedStock: 3500,
    fcr: 1.85,
    averageWeight: 1200,
  },
  {
    id: 'cycle-003',
    farmId: 'farm-002',
    growerId: 'person-004', // Maria Santos
    batchName: 'Cagayan-2025-01',
    startDate: new Date('2025-01-15'),
    expectedEndDate: new Date('2025-04-01'),
    birdCount: 20000,
    status: 'active',
    mortalityRate: 0.91,
    feedConsumed: 32000,
    currentFeedStock: 2500,
    fcr: 2.00,
    averageWeight: 1450,
  },
  {
    id: 'cycle-004',
    farmId: 'farm-002',
    growerId: 'person-005', // Juan Cruz
    batchName: 'Cagayan-2025-02',
    startDate: new Date('2025-02-01'),
    expectedEndDate: new Date('2025-04-15'),
    birdCount: 18920,
    status: 'active',
    mortalityRate: 0.45,
    feedConsumed: 18000,
    currentFeedStock: 4200,
    fcr: 1.78,
    averageWeight: 950,
  },
  {
    id: 'cycle-005',
    farmId: 'farm-003',
    growerId: 'person-006', // Ana Reyes
    batchName: 'Tarlac-Winter-2025',
    startDate: new Date('2025-01-20'),
    expectedEndDate: new Date('2025-04-05'),
    birdCount: 17100,
    status: 'active',
    mortalityRate: 0.73,
    feedConsumed: 24000,
    currentFeedStock: 2800,
    fcr: 1.92,
    averageWeight: 1350,
  },
  
  // Completed Cycles (3)
  {
    id: 'cycle-006',
    farmId: 'farm-001',
    growerId: 'person-003', // Bob Smith
    batchName: 'Batch #2024-Prev',
    startDate: new Date('2024-09-01'),
    expectedEndDate: new Date('2024-11-15'),
    birdCount: 24500,
    status: 'completed',
    mortalityRate: 1.12,
    feedConsumed: 52000,
    currentFeedStock: 0,
    fcr: 2.12,
    averageWeight: 2200,
  },
  {
    id: 'cycle-007',
    farmId: 'farm-002',
    growerId: 'person-004', // Maria Santos
    batchName: 'Cagayan-Q4-2024',
    startDate: new Date('2024-10-15'),
    expectedEndDate: new Date('2024-12-30'),
    birdCount: 19500,
    status: 'completed',
    mortalityRate: 0.98,
    feedConsumed: 41000,
    currentFeedStock: 0,
    fcr: 2.05,
    averageWeight: 2100,
  },
  {
    id: 'cycle-008',
    farmId: 'farm-003',
    growerId: 'person-006', // Ana Reyes
    batchName: 'Tarlac-Q4-2024',
    startDate: new Date('2024-11-01'),
    expectedEndDate: new Date('2025-01-15'),
    birdCount: 16800,
    status: 'completed',
    mortalityRate: 0.89,
    feedConsumed: 35000,
    currentFeedStock: 0,
    fcr: 1.98,
    averageWeight: 2080,
  },
];

// Helper functions
export function getCycleById(id: string): ProductionCycle | undefined {
  return productionCycles.find(cycle => cycle.id === id);
}

export function getCyclesByFarmId(farmId: string): ProductionCycle[] {
  return productionCycles.filter(cycle => cycle.farmId === farmId);
}

export function getCyclesByGrowerId(growerId: string): ProductionCycle[] {
  return productionCycles.filter(cycle => cycle.growerId === growerId);
}

export function getActiveCycles(): ProductionCycle[] {
  return productionCycles.filter(cycle => cycle.status === 'active');
}

export function getCompletedCycles(): ProductionCycle[] {
  return productionCycles.filter(cycle => cycle.status === 'completed');
}

export function getPendingCycles(): ProductionCycle[] {
  return productionCycles.filter(cycle => cycle.status === 'pending');
}

export function getActiveCyclesCount(): number {
  return productionCycles.filter(c => c.status === 'active').length;
}

export function getCompletedCyclesCount(): number {
  return productionCycles.filter(c => c.status === 'completed').length;
}

export function getTotalActiveBirds(): number {
  return productionCycles
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + c.birdCount, 0);
}

export function getTotalFeedConsumed(): number {
  return productionCycles.reduce((sum, c) => sum + c.feedConsumed, 0);
}

export function getAverageMortalityRate(): number {
  const active = getActiveCycles();
  if (active.length === 0) return 0;
  return active.reduce((sum, c) => sum + c.mortalityRate, 0) / active.length;
}

export function getAverageFCR(): number {
  const cyclesWithFCR = productionCycles.filter(c => c.fcr !== undefined);
  if (cyclesWithFCR.length === 0) return 0;
  return cyclesWithFCR.reduce((sum, c) => sum + (c.fcr || 0), 0) / cyclesWithFCR.length;
}

export function getCycleProgress(cycle: ProductionCycle): number {
  const now = new Date();
  const total = cycle.expectedEndDate.getTime() - cycle.startDate.getTime();
  const elapsed = now.getTime() - cycle.startDate.getTime();
  
  if (cycle.status === 'completed') return 100;
  if (elapsed <= 0) return 0;
  if (elapsed >= total) return 100;
  
  return Math.round((elapsed / total) * 100);
}

export function getDaysRemaining(cycle: ProductionCycle): number {
  if (cycle.status !== 'active') return 0;
  
  const now = new Date();
  const diff = cycle.expectedEndDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
