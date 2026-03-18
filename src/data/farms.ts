/**
 * Farms Data
 * 
 * 5 Farms: 3 active, 1 empty, 1 maintenance
 * Realistic Philippine poultry farm locations
 */

import type { Farm } from '@/types';

export const farms: Farm[] = [
  {
    id: 'farm-001',
    name: 'Bukidnon Highlands',
    region: 'Mindanao',
    status: 'active',
    capacity: 50000,
    currentBirdCount: 48750,
    activeCycles: 14,
    avgFCR: 1.48,
    avgLiveWeight: 2.15,
    bpi: 385,
    coordinates: { lat: 8.1456, lng: 125.1234 },
    lastUpdated: new Date('2026-02-02T14:30:00'),
  },
  {
    id: 'farm-002',
    name: 'Cagayan Valley',
    region: 'Luzon',
    status: 'active',
    capacity: 40000,
    currentBirdCount: 38920,
    activeCycles: 11,
    avgFCR: 1.52,
    avgLiveWeight: 2.08,
    bpi: 368,
    coordinates: { lat: 17.6132, lng: 121.7167 },
    lastUpdated: new Date('2026-02-02T15:15:00'),
  },
  {
    id: 'farm-003',
    name: 'Tarlac Plains',
    region: 'Luzon',
    status: 'active',
    capacity: 35000,
    currentBirdCount: 34200,
    activeCycles: 9,
    avgFCR: 1.45,
    avgLiveWeight: 2.22,
    bpi: 392,
    coordinates: { lat: 15.4755, lng: 120.5960 },
    lastUpdated: new Date('2026-02-02T13:45:00'),
  },
  {
    id: 'farm-004',
    name: 'Pampanga Fields',
    region: 'Luzon',
    status: 'empty',
    capacity: 30000,
    currentBirdCount: 0,
    activeCycles: 18,
    avgFCR: 1.55,
    avgLiveWeight: 1.95,
    bpi: 345,
    coordinates: { lat: 15.0951, lng: 120.7625 },
    lastUpdated: new Date('2026-01-28T09:00:00'),
  },
  {
    id: 'farm-005',
    name: 'Davao Del Sur',
    region: 'Mindanao',
    status: 'maintenance',
    capacity: 45000,
    currentBirdCount: 0,
    activeCycles: 12,
    avgFCR: 1.50,
    avgLiveWeight: 2.10,
    bpi: 372,
    coordinates: { lat: 6.8142, lng: 125.4213 },
    lastUpdated: new Date('2026-02-01T10:20:00'),
  },
];

// Helper functions
export function getFarmById(id: string): Farm | undefined {
  return farms.find(farm => farm.id === id);
}

export function getActiveFarms(): Farm[] {
  return farms.filter(farm => farm.status === 'active');
}

export function getTotalBirdCount(): number {
  return farms.reduce((total, farm) => total + farm.currentBirdCount, 0);
}

export function getTotalCapacity(): number {
  return farms.reduce((total, farm) => total + farm.capacity, 0);
}

export function getOccupancyRate(): number {
  const totalCapacity = getTotalCapacity();
  const totalBirds = getTotalBirdCount();
  return totalCapacity > 0 ? (totalBirds / totalCapacity) * 100 : 0;
}
