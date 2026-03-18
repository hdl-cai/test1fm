/**
 * Health Records Data
 * 
 * 30+ Health Records across production cycles
 * Mix of vaccinations, treatments, and inspections
 */

import type { HealthRecord } from '@/types';

export const healthRecords: HealthRecord[] = [
  // Cycle 001 - Bukidnon Highlands, Batch #2024-A (Active)
  {
    id: 'health-001',
    cycleId: 'cycle-001',
    farmId: 'farm-001',
    date: new Date('2024-12-05'),
    type: 'vaccination',
    description: 'Initial Newcastle Disease vaccination - Day 5',
    vetId: 'person-008',
    status: 'completed',
    notes: 'All birds vaccinated successfully',
    medication: 'ND-V4 (Live)',
    dosage: 'Eye Drop / 0.05ml',
  },
  {
    id: 'health-002',
    cycleId: 'cycle-001',
    farmId: 'farm-001',
    date: new Date('2024-12-12'),
    type: 'vaccination',
    description: 'Gumboro (IBD) vaccination - Day 12',
    vetId: 'person-008',
    status: 'completed',
  },
  {
    id: 'health-003',
    cycleId: 'cycle-001',
    farmId: 'farm-001',
    date: new Date('2024-12-28'),
    type: 'treatment',
    description: 'Respiratory infection treatment',
    vetId: 'person-008',
    status: 'completed',
    notes: 'Treated 150 birds with antibiotics',
    medication: 'Enrofloxacin 10%',
    dosage: '1ml per 2L water',
  },
  {
    id: 'health-004',
    cycleId: 'cycle-001',
    farmId: 'farm-001',
    date: new Date('2025-01-15'),
    type: 'inspection',
    description: 'Monthly health inspection',
    vetId: 'person-008',
    status: 'completed',
    notes: 'Flock in good condition, mortality rate acceptable',
  },
  {
    id: 'health-005',
    cycleId: 'cycle-001',
    farmId: 'farm-001',
    date: new Date('2025-02-10'),
    type: 'inspection',
    description: 'Pre-harvest health check',
    vetId: 'person-008',
    status: 'scheduled',
  },

  // Cycle 002 - Bukidnon Highlands, Batch #2024-B (Active)
  {
    id: 'health-006',
    cycleId: 'cycle-002',
    farmId: 'farm-001',
    date: new Date('2025-01-15'),
    type: 'vaccination',
    description: 'Newcastle Disease vaccination - Day 5',
    vetId: 'person-008',
    status: 'completed',
  },
  {
    id: 'health-007',
    cycleId: 'cycle-002',
    farmId: 'farm-001',
    date: new Date('2025-01-22'),
    type: 'vaccination',
    description: 'Gumboro (IBD) vaccination - Day 12',
    vetId: 'person-008',
    status: 'completed',
  },
  {
    id: 'health-008',
    cycleId: 'cycle-002',
    farmId: 'farm-001',
    date: new Date('2025-02-10'),
    type: 'inspection',
    description: 'Routine health inspection',
    vetId: 'person-008',
    status: 'completed',
  },

  // Cycle 003 - Cagayan Valley, Cagayan-2025-01 (Active)
  {
    id: 'health-009',
    cycleId: 'cycle-003',
    farmId: 'farm-002',
    date: new Date('2025-01-20'),
    type: 'vaccination',
    description: 'Newcastle Disease vaccination',
    vetId: 'person-008',
    status: 'completed',
  },
  {
    id: 'health-010',
    cycleId: 'cycle-003',
    farmId: 'farm-002',
    date: new Date('2025-01-27'),
    type: 'vaccination',
    description: 'Gumboro (IBD) vaccination',
    vetId: 'person-008',
    status: 'completed',
  },
  {
    id: 'health-011',
    cycleId: 'cycle-003',
    farmId: 'farm-002',
    date: new Date('2025-02-01'),
    type: 'inspection',
    description: 'Health and biosecurity inspection',
    vetId: 'person-008',
    status: 'completed',
  },
  {
    id: 'health-012',
    cycleId: 'cycle-003',
    farmId: 'farm-002',
    date: new Date('2025-02-15'),
    type: 'treatment',
    description: 'Coccidiosis prevention treatment',
    vetId: 'person-008',
    status: 'completed',
  },
  {
    id: 'health-013',
    cycleId: 'cycle-003',
    farmId: 'farm-002',
    date: new Date('2025-02-20'),
    type: 'inspection',
    description: 'Weight and health assessment',
    vetId: 'person-008',
    status: 'scheduled',
  },

  // Cycle 004 - Cagayan Valley, Cagayan-2025-02 (Active)
  {
    id: 'health-014',
    cycleId: 'cycle-004',
    farmId: 'farm-002',
    date: new Date('2025-02-06'),
    type: 'vaccination',
    description: 'Newcastle Disease vaccination',
    vetId: 'person-008',
    status: 'completed',
  },
  {
    id: 'health-015',
    cycleId: 'cycle-004',
    farmId: 'farm-002',
    date: new Date('2025-02-13'),
    type: 'vaccination',
    description: 'Gumboro (IBD) vaccination',
    vetId: 'person-008',
    status: 'completed',
  },

  // Cycle 005 - Tarlac Plains, Tarlac-Winter-2025 (Active)
  {
    id: 'health-016',
    cycleId: 'cycle-005',
    farmId: 'farm-003',
    date: new Date('2025-01-25'),
    type: 'vaccination',
    description: 'Newcastle Disease vaccination',
    vetId: 'person-009',
    status: 'completed',
  },
  {
    id: 'health-017',
    cycleId: 'cycle-005',
    farmId: 'farm-003',
    date: new Date('2025-02-01'),
    type: 'vaccination',
    description: 'Gumboro (IBD) vaccination',
    vetId: 'person-009',
    status: 'completed',
  },
  {
    id: 'health-018',
    cycleId: 'cycle-005',
    farmId: 'farm-003',
    date: new Date('2025-02-08'),
    type: 'inspection',
    description: 'Biosecurity compliance check',
    vetId: 'person-009',
    status: 'completed',
  },
  {
    id: 'health-019',
    cycleId: 'cycle-005',
    farmId: 'farm-003',
    date: new Date('2025-02-18'),
    type: 'treatment',
    description: 'Vitamin supplementation',
    vetId: 'person-009',
    status: 'completed',
  },

  // Cycle 006 - Completed cycles have historical records
  {
    id: 'health-020',
    cycleId: 'cycle-006',
    farmId: 'farm-001',
    date: new Date('2024-09-05'),
    type: 'vaccination',
    description: 'Newcastle Disease vaccination',
    vetId: 'person-008',
    status: 'completed',
  },
  {
    id: 'health-021',
    cycleId: 'cycle-006',
    farmId: 'farm-001',
    date: new Date('2024-09-12'),
    type: 'vaccination',
    description: 'Gumboro (IBD) vaccination',
    vetId: 'person-008',
    status: 'completed',
  },
  {
    id: 'health-022',
    cycleId: 'cycle-006',
    farmId: 'farm-001',
    date: new Date('2024-10-01'),
    type: 'inspection',
    description: 'Mid-cycle health assessment',
    vetId: 'person-008',
    status: 'completed',
  },
  {
    id: 'health-023',
    cycleId: 'cycle-006',
    farmId: 'farm-001',
    date: new Date('2024-11-10'),
    type: 'inspection',
    description: 'Pre-harvest final inspection',
    vetId: 'person-008',
    status: 'completed',
  },

  // Cycle 007 - Completed
  {
    id: 'health-024',
    cycleId: 'cycle-007',
    farmId: 'farm-002',
    date: new Date('2024-10-20'),
    type: 'vaccination',
    description: 'Newcastle Disease vaccination',
    vetId: 'person-008',
    status: 'completed',
  },
  {
    id: 'health-025',
    cycleId: 'cycle-007',
    farmId: 'farm-002',
    date: new Date('2024-10-27'),
    type: 'vaccination',
    description: 'Gumboro (IBD) vaccination',
    vetId: 'person-008',
    status: 'completed',
  },
  {
    id: 'health-026',
    cycleId: 'cycle-007',
    farmId: 'farm-002',
    date: new Date('2024-11-15'),
    type: 'inspection',
    description: 'Health inspection before harvest',
    vetId: 'person-008',
    status: 'completed',
  },

  // Cycle 008 - Completed
  {
    id: 'health-027',
    cycleId: 'cycle-008',
    farmId: 'farm-003',
    date: new Date('2024-11-06'),
    type: 'vaccination',
    description: 'Newcastle Disease vaccination',
    vetId: 'person-009',
    status: 'completed',
  },
  {
    id: 'health-028',
    cycleId: 'cycle-008',
    farmId: 'farm-003',
    date: new Date('2024-11-13'),
    type: 'vaccination',
    description: 'Gumboro (IBD) vaccination',
    vetId: 'person-009',
    status: 'completed',
  },
  {
    id: 'health-029',
    cycleId: 'cycle-008',
    farmId: 'farm-003',
    date: new Date('2024-12-20'),
    type: 'treatment',
    description: 'Vitamin and electrolyte treatment',
    vetId: 'person-009',
    status: 'completed',
  },
  {
    id: 'health-030',
    cycleId: 'cycle-008',
    farmId: 'farm-003',
    date: new Date('2025-01-10'),
    type: 'inspection',
    description: 'Final pre-harvest inspection',
    vetId: 'person-009',
    status: 'completed',
  },

  // Additional scheduled/upcoming for active cycles
  {
    id: 'health-031',
    cycleId: 'cycle-002',
    farmId: 'farm-001',
    date: new Date('2025-02-25'),
    type: 'inspection',
    description: 'Week 6 health assessment',
    vetId: 'person-008',
    status: 'scheduled',
  },
  {
    id: 'health-032',
    cycleId: 'cycle-004',
    farmId: 'farm-002',
    date: new Date('2025-02-18'),
    type: 'vaccination',
    description: 'Avian Influenza booster',
    vetId: 'person-008',
    status: 'scheduled',
  },
  {
    id: 'health-033',
    cycleId: 'cycle-005',
    farmId: 'farm-003',
    date: new Date('2025-02-22'),
    type: 'inspection',
    description: 'Week 5 health check',
    vetId: 'person-009',
    status: 'scheduled',
  },
];

// Helper functions
export function getHealthRecordById(id: string): HealthRecord | undefined {
  return healthRecords.find(record => record.id === id);
}

export function getHealthRecordsByCycleId(cycleId: string): HealthRecord[] {
  return healthRecords.filter(record => record.cycleId === cycleId);
}

export function getHealthRecordsByFarmId(farmId: string): HealthRecord[] {
  return healthRecords.filter(record => record.farmId === farmId);
}

export function getHealthRecordsByVetId(vetId: string): HealthRecord[] {
  return healthRecords.filter(record => record.vetId === vetId);
}

export function getHealthRecordsByType(type: HealthRecord['type']): HealthRecord[] {
  return healthRecords.filter(record => record.type === type);
}

export function getScheduledHealthRecords(): HealthRecord[] {
  return healthRecords.filter(record => record.status === 'scheduled');
}

export function getOverdueHealthRecords(): HealthRecord[] {
  return healthRecords.filter(record => record.status === 'overdue');
}

export function getCompletedHealthRecords(): HealthRecord[] {
  return healthRecords.filter(record => record.status === 'completed');
}

export function getVaccinationCount(cycleId?: string): number {
  const records = cycleId
    ? healthRecords.filter(r => r.cycleId === cycleId && r.type === 'vaccination')
    : healthRecords.filter(r => r.type === 'vaccination');
  return records.length;
}

export function getTreatmentCount(cycleId?: string): number {
  const records = cycleId
    ? healthRecords.filter(r => r.cycleId === cycleId && r.type === 'treatment')
    : healthRecords.filter(r => r.type === 'treatment');
  return records.length;
}

export function getUpcomingVaccinations(days: number = 7): HealthRecord[] {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return healthRecords.filter(
    r => r.type === 'vaccination' &&
      r.status === 'scheduled' &&
      r.date >= now &&
      r.date <= future
  );
}
