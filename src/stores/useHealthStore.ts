/**
 * Health Store
 * Zustand store for health and vaccination management
 */

import { create } from 'zustand';
import {
  toVaccinationStepStatus,
  type VaccinationScheduleRow,
} from '@/lib/data-adapters';
import { fetchHealthData as fetchHealthDataFromDataLayer } from '@/lib/data/health';
import { getErrorMessage } from '@/lib/data/errors';
import type { HealthRecord } from '@/types';

export interface VaccinationStep {
  id: string;
  name: string;
  dol: number;
  medication: string;
  status: 'completed' | 'overdue' | 'scheduled';
}

export interface HealthState {
  // Data
  records: HealthRecord[];
  schedules: VaccinationScheduleRow[];
  isLoading: boolean;
  error: string | null;
  
  // Metrics
  activeMedicationsCount: number;
  quarantinedBirdsCount: number;
  vaccinationCoverage: number;
  
  // Actions
  fetchHealthData: (orgId: string) => Promise<void>;
  addRecord: (record: Omit<HealthRecord, 'id'>) => Promise<void>;
  updateRecord: (id: string, updates: Partial<HealthRecord>) => Promise<void>;
  
  // Selectors
  getRecordsByCycleId: (cycleId: string) => HealthRecord[];
  getVaccinationSteps: (cycleId: string, startDate: Date) => VaccinationStep[];
}

export const useHealthStore = create<HealthState>((set, get) => ({
  records: [],
  schedules: [],
  isLoading: false,
  error: null,
  activeMedicationsCount: 0,
  quarantinedBirdsCount: 0,
  vaccinationCoverage: 0,

  fetchHealthData: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchHealthDataFromDataLayer(orgId);
      set({ 
        records: data.records, 
        schedules: data.schedules,
        activeMedicationsCount: data.activeMedicationsCount,
        quarantinedBirdsCount: data.quarantinedBirdsCount,
        vaccinationCoverage: data.vaccinationCoverage,
        isLoading: false 
      });
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to fetch health data.');
      set({ error: message, isLoading: false });
    }
  },

  addRecord: async (_recordData) => {
    void _recordData;
    // Implementation for adding records via Supabase
  },

  updateRecord: async (_id, _updates) => {
    void _id;
    void _updates;
    // Implementation for updating records via Supabase
  },

  getRecordsByCycleId: (cycleId) => {
    return get().records.filter(r => r.cycleId === cycleId);
  },

  getVaccinationSteps: (cycleId, startDate) => {
    const cycleVax = get().schedules.filter(s => s.cycle_id === cycleId);
    
    // Core BAI Steps if no database records exist
    const defaultSteps: VaccinationStep[] = [
      { id: '1', name: 'Hatchery Plan', dol: 1, medication: 'HVT/ND', status: 'scheduled' },
      { id: '2', name: 'Maternal Guard', dol: 7, medication: 'ND/IB (Live)', status: 'scheduled' },
      { id: '3', name: 'IBD Health Guard', dol: 14, medication: 'IBD-Intermediate', status: 'scheduled' },
      { id: '4', name: 'ND Booster Prime', dol: 21, medication: 'ND-LaSota', status: 'scheduled' },
      { id: '5', name: 'Pre-Harvest Final', dol: 28, medication: 'Clinical Clearance', status: 'scheduled' },
    ];

    if (cycleVax.length === 0) return defaultSteps;

    return cycleVax.map(s => {
        const today = new Date();
        const stepDate = new Date(startDate);
        stepDate.setDate(stepDate.getDate() + s.target_age_days);

        let status = toVaccinationStepStatus(s.status);
        if (status !== 'completed' && today > stepDate) {
            status = 'overdue';
        }

        return {
          id: s.id,
          name: s.vaccine_name,
          dol: s.target_age_days,
          medication: s.vaccine_name,
          status
        };
    });
  }
}));
