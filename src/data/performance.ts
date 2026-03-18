/**
 * Performance Data
 * 
 * Performance metrics for production cycles and grower rankings
 */

import type { PerformanceMetrics, GrowerPerformance } from '@/types';

export const performanceMetrics: PerformanceMetrics[] = [
  // Active Cycles
  {
    cycleId: 'cycle-001',
    farmId: 'farm-001',
    fcr: 1.94,
    mortalityRate: 0.82,
    averageWeight: 1850,
    revenue: 0, // Not yet harvested
    cost: 485000,
    profit: -485000,
    recordedAt: new Date('2026-02-03'),
  },
  {
    cycleId: 'cycle-002',
    farmId: 'farm-001',
    fcr: 1.85,
    mortalityRate: 0.65,
    averageWeight: 1200,
    revenue: 0,
    cost: 280000,
    profit: -280000,
    recordedAt: new Date('2026-02-03'),
  },
  {
    cycleId: 'cycle-003',
    farmId: 'farm-002',
    fcr: 2.00,
    mortalityRate: 0.91,
    averageWeight: 1450,
    revenue: 0,
    cost: 320000,
    profit: -320000,
    recordedAt: new Date('2026-02-03'),
  },
  {
    cycleId: 'cycle-004',
    farmId: 'farm-002',
    fcr: 1.78,
    mortalityRate: 0.45,
    averageWeight: 950,
    revenue: 0,
    cost: 180000,
    profit: -180000,
    recordedAt: new Date('2026-02-03'),
  },
  {
    cycleId: 'cycle-005',
    farmId: 'farm-003',
    fcr: 1.92,
    mortalityRate: 0.73,
    averageWeight: 1350,
    revenue: 0,
    cost: 240000,
    profit: -240000,
    recordedAt: new Date('2026-02-03'),
  },

  // Completed Cycles
  {
    cycleId: 'cycle-006',
    farmId: 'farm-001',
    fcr: 2.12,
    mortalityRate: 1.12,
    averageWeight: 2200,
    revenue: 450000,
    cost: 380000,
    profit: 70000,
    recordedAt: new Date('2024-11-15'),
  },
  {
    cycleId: 'cycle-007',
    farmId: 'farm-002',
    fcr: 2.05,
    mortalityRate: 0.98,
    averageWeight: 2100,
    revenue: 380000,
    cost: 320000,
    profit: 60000,
    recordedAt: new Date('2024-12-30'),
  },
  {
    cycleId: 'cycle-008',
    farmId: 'farm-003',
    fcr: 1.98,
    mortalityRate: 0.89,
    averageWeight: 2080,
    revenue: 320000,
    cost: 280000,
    profit: 40000,
    recordedAt: new Date('2025-01-15'),
  },
];

// Grower Performance Rankings
export const growerPerformance: (GrowerPerformance & { epef: number; points: number })[] = [
  {
    growerId: 'person-003', // Bob Smith
    totalCycles: 12,
    activeCycles: 2,
    averageFCR: 1.68,
    averageMortality: 0.72,
    totalRevenue: 2450000,
    ranking: 1,
    epef: 412,
    points: 850
  },
  {
    growerId: 'person-004', // Maria Santos
    totalCycles: 8,
    activeCycles: 1,
    averageFCR: 1.75,
    averageMortality: 0.95,
    totalRevenue: 1850000,
    ranking: 2,
    epef: 385,
    points: 720
  },
  {
    growerId: 'person-005', // Juan Cruz
    totalCycles: 15,
    activeCycles: 1,
    averageFCR: 1.72,
    averageMortality: 0.85,
    totalRevenue: 3200000,
    ranking: 3,
    epef: 372,
    points: 680
  },
  {
    growerId: 'person-006', // Ana Reyes
    totalCycles: 5,
    activeCycles: 1,
    averageFCR: 1.82,
    averageMortality: 1.12,
    totalRevenue: 950000,
    ranking: 4,
    epef: 345,
    points: 540
  },
  {
    growerId: 'person-007', // Carlos Mendoza
    totalCycles: 3,
    activeCycles: 0,
    averageFCR: 1.95,
    averageMortality: 1.45,
    totalRevenue: 450000,
    ranking: 5,
    epef: 310,
    points: 420
  },
];

// Historical performance data for charts
export interface HistoricalMetrics {
  date: Date;
  farmId: string;
  fcr: number;
  mortalityRate: number;
  averageWeight: number;
}

export const historicalMetrics: HistoricalMetrics[] = [
  // Farm 001 - Weekly data points
  { date: new Date('2024-12-01'), farmId: 'farm-001', fcr: 1.20, mortalityRate: 0.10, averageWeight: 150 },
  { date: new Date('2024-12-08'), farmId: 'farm-001', fcr: 1.35, mortalityRate: 0.25, averageWeight: 320 },
  { date: new Date('2024-12-15'), farmId: 'farm-001', fcr: 1.55, mortalityRate: 0.45, averageWeight: 580 },
  { date: new Date('2024-12-22'), farmId: 'farm-001', fcr: 1.72, mortalityRate: 0.62, averageWeight: 920 },
  { date: new Date('2024-12-29'), farmId: 'farm-001', fcr: 1.85, mortalityRate: 0.72, averageWeight: 1250 },
  { date: new Date('2025-01-05'), farmId: 'farm-001', fcr: 1.94, mortalityRate: 0.78, averageWeight: 1520 },
  { date: new Date('2025-01-12'), farmId: 'farm-001', fcr: 2.05, mortalityRate: 0.85, averageWeight: 1780 },
  { date: new Date('2025-01-19'), farmId: 'farm-001', fcr: 2.12, mortalityRate: 1.12, averageWeight: 2200 },

  // Farm 002 - Weekly data points
  { date: new Date('2024-12-01'), farmId: 'farm-002', fcr: 1.25, mortalityRate: 0.15, averageWeight: 160 },
  { date: new Date('2024-12-08'), farmId: 'farm-002', fcr: 1.42, mortalityRate: 0.32, averageWeight: 350 },
  { date: new Date('2024-12-15'), farmId: 'farm-002', fcr: 1.62, mortalityRate: 0.52, averageWeight: 610 },
  { date: new Date('2024-12-22'), farmId: 'farm-002', fcr: 1.78, mortalityRate: 0.68, averageWeight: 940 },
  { date: new Date('2024-12-29'), farmId: 'farm-002', fcr: 1.92, mortalityRate: 0.82, averageWeight: 1280 },
  { date: new Date('2025-01-05'), farmId: 'farm-002', fcr: 2.05, mortalityRate: 0.98, averageWeight: 2100 },

  // Farm 003 - Weekly data points
  { date: new Date('2024-12-01'), farmId: 'farm-003', fcr: 1.22, mortalityRate: 0.12, averageWeight: 155 },
  { date: new Date('2024-12-08'), farmId: 'farm-003', fcr: 1.38, mortalityRate: 0.28, averageWeight: 335 },
  { date: new Date('2024-12-15'), farmId: 'farm-003', fcr: 1.58, mortalityRate: 0.48, averageWeight: 595 },
  { date: new Date('2024-12-22'), farmId: 'farm-003', fcr: 1.75, mortalityRate: 0.65, averageWeight: 925 },
  { date: new Date('2024-12-29'), farmId: 'farm-003', fcr: 1.88, mortalityRate: 0.78, averageWeight: 1260 },
  { date: new Date('2025-01-05'), farmId: 'farm-003', fcr: 1.98, mortalityRate: 0.89, averageWeight: 2080 },

  // Recent data for active cycles (last 30 days)
  { date: new Date('2026-01-05'), farmId: 'farm-001', fcr: 1.45, mortalityRate: 0.35, averageWeight: 450 },
  { date: new Date('2026-01-12'), farmId: 'farm-001', fcr: 1.62, mortalityRate: 0.52, averageWeight: 780 },
  { date: new Date('2026-01-19'), farmId: 'farm-001', fcr: 1.78, mortalityRate: 0.68, averageWeight: 1120 },
  { date: new Date('2026-01-26'), farmId: 'farm-001', fcr: 1.85, mortalityRate: 0.65, averageWeight: 1200 },
  { date: new Date('2026-02-02'), farmId: 'farm-001', fcr: 1.94, mortalityRate: 0.82, averageWeight: 1850 },

  { date: new Date('2026-01-05'), farmId: 'farm-002', fcr: 1.48, mortalityRate: 0.38, averageWeight: 460 },
  { date: new Date('2026-01-12'), farmId: 'farm-002', fcr: 1.65, mortalityRate: 0.55, averageWeight: 790 },
  { date: new Date('2026-01-19'), farmId: 'farm-002', fcr: 1.80, mortalityRate: 0.70, averageWeight: 1150 },
  { date: new Date('2026-01-26'), farmId: 'farm-002', fcr: 1.92, mortalityRate: 0.82, averageWeight: 1420 },
  { date: new Date('2026-02-02'), farmId: 'farm-002', fcr: 2.00, mortalityRate: 0.91, averageWeight: 1450 },
];

// Helper functions
export function getPerformanceByCycleId(cycleId: string): PerformanceMetrics | undefined {
  return performanceMetrics.find(p => p.cycleId === cycleId);
}

export function getPerformanceByFarmId(farmId: string): PerformanceMetrics[] {
  return performanceMetrics.filter(p => p.farmId === farmId);
}

export function getGrowerPerformanceById(growerId: string): GrowerPerformance | undefined {
  return growerPerformance.find(p => p.growerId === growerId);
}

export function getAllGrowerPerformance(): GrowerPerformance[] {
  return [...growerPerformance].sort((a, b) => a.ranking - b.ranking);
}

export function getHistoricalMetricsByFarmId(farmId: string): HistoricalMetrics[] {
  return historicalMetrics.filter(m => m.farmId === farmId);
}

export function getAverageFCR(): number {
  const active = performanceMetrics.filter(p => p.revenue === 0);
  if (active.length === 0) return 0;
  return active.reduce((sum, p) => sum + p.fcr, 0) / active.length;
}

export function getAverageMortality(): number {
  const active = performanceMetrics.filter(p => p.revenue === 0);
  if (active.length === 0) return 0;
  return active.reduce((sum, p) => sum + p.mortalityRate, 0) / active.length;
}

export function getTotalRevenue(): number {
  return performanceMetrics.reduce((sum, p) => sum + p.revenue, 0);
}

export function getTotalCost(): number {
  return performanceMetrics.reduce((sum, p) => sum + p.cost, 0);
}

export function getTotalProfit(): number {
  return performanceMetrics.reduce((sum, p) => sum + p.profit, 0);
}

export function getCompletedCyclesProfit(): number {
  return performanceMetrics
    .filter(p => p.revenue > 0)
    .reduce((sum, p) => sum + p.profit, 0);
}

export function getActiveCyclesInvestment(): number {
  return performanceMetrics
    .filter(p => p.revenue === 0)
    .reduce((sum, p) => sum + Math.abs(p.profit), 0);
}
