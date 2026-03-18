/**
 * Health Store
 * Zustand store for health and vaccination management
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
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
  schedules: any[];
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
      // 1. Fetch Health Records
      const { data: recordsData, error: recordsError } = await supabase
        .from('health_records')
        .select(`
          *,
          veterinarian:profiles!health_records_veterinarian_id_fkey(first_name, last_name)
        `)
        .eq('org_id', orgId)
        .order('record_date', { ascending: false });

      if (recordsError) throw recordsError;

      // 2. Fetch Medication Logs (for active medications count)
      const { data: medLogs, error: medError } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('org_id', orgId);
      
      if (medError) throw medError;

      // 3. Fetch Vaccination Schedules
      const { data: vaxData, error: vaxError } = await supabase
        .from('vaccination_schedules')
        .select('*')
        .eq('org_id', orgId);

      if (vaxError) throw vaxError;

      // 4. Map records to internal type
      const mappedRecords: HealthRecord[] = (recordsData || []).map(row => ({
        id: row.id,
        type: row.record_type as any,
        description: row.subject,
        date: new Date(row.record_date),
        vetId: row.veterinarian_id || '',
        status: (row.is_gahp_compliant ? 'completed' : 'pending') as any, // Simplified mapping
        medication: row.notes?.split('\n')[0], // Extract first line of notes as medication (hacky but matches UI for now)
        dosage: 'As prescribed',
        cycleId: row.cycle_id,
      }));

      // Calculate Metrics
      // Active medications: recent logs in last 7 days (simplified)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeMedications = medLogs?.filter(log => new Date(log.created_at) > sevenDaysAgo).length || 0;

      // Quarantined birds: based on subject line in logs (since there's no explicit quarantine table)
      const quarantineRecords = recordsData?.filter(r => r.subject.toLowerCase().includes('quarantine')) || [];
      const quarantinedCount = quarantineRecords.length > 0 ? 45 : 0; // Mocking specific number if records exist for now

      // Vaccination Coverage
      const completedVax = vaxData?.filter(v => v.status === 'completed').length || 0;
      const totalVax = vaxData?.length || 1;
      const coverage = Math.round((completedVax / totalVax) * 100);

      set({ 
        records: mappedRecords, 
        schedules: vaxData || [],
        activeMedicationsCount: activeMedications || 0,
        quarantinedBirdsCount: quarantinedCount,
        vaccinationCoverage: coverage,
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addRecord: async (recordData) => {
    // Implementation for adding records via Supabase
  },

  updateRecord: async (id, updates) => {
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

        let status: 'completed' | 'overdue' | 'scheduled' = s.status as any;
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
