/**
 * Personnel Store
 * Zustand store for personnel management with Supabase integration
 */

import { create } from 'zustand';
import {
  assignPersonToFarm,
  fetchPersonnel,
  unassignPersonFromFarm,
  updatePersonRecord,
} from '@/lib/data/personnel';
import { getErrorMessage } from '@/lib/data/errors';
import type { Person, UserRole } from '@/types';

export interface PersonnelState {
  // Data
  personnel: Person[];
  selectedPersonId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPersonnelData: (orgId: string) => Promise<void>;
  selectPerson: (personId: string | null) => void;
  updatePerson: (personId: string, updates: Partial<Person>) => Promise<void>;
  addPerson: (person: Omit<Person, 'id' | 'assignedFarms'>) => Promise<void>;
  assignFarm: (personId: string, farmId: string, role: UserRole) => Promise<void>;
  unassignFarm: (personId: string, farmId: string) => Promise<void>;

  // Selectors
  getPersonById: (personId: string) => Person | undefined;
  getPersonnelByRole: (role: Person['role']) => Person[];
  getPersonnelByFarmId: (farmId: string) => Person[];
  getGrowerById: (growerId: string) => Person | undefined;
}

export const usePersonnelStore = create<PersonnelState>((set, get) => ({
  personnel: [],
  selectedPersonId: null,
  isLoading: false,
  error: null,

  fetchPersonnelData: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const personnel = await fetchPersonnel(orgId);
      set({ personnel, isLoading: false });
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to fetch personnel.');
      set({ error: message, isLoading: false });
    }
  },

    selectPerson: (personId) => set({ selectedPersonId: personId }),

  updatePerson: async (personId, updates) => {
    try {
      await updatePersonRecord(personId, updates);
      set(state => ({
        personnel: state.personnel.map(p => p.id === personId ? { ...p, ...updates } : p)
      }));
    } catch (err) {
      console.error('Error updating person:', err);
    }
  },

  addPerson: async (_personData) => {
    void _personData;
    console.warn('addPerson requires strategic implementation (invite vs create)');
  },

  assignFarm: async (personId, farmId, role) => {
    try {
      const targetUser = get().personnel.find(p => p.id === personId);
      if (!targetUser) return;
      await assignPersonToFarm({ personId, farmId, role });

      set(state => ({
        personnel: state.personnel.map(p => 
          p.id === personId 
            ? { ...p, assignedFarms: [...p.assignedFarms, farmId] } 
            : p
        )
      }));
    } catch (err) {
      console.error('Error assigning farm:', err);
    }
  },

  unassignFarm: async (personId, farmId) => {
    try {
      await unassignPersonFromFarm(personId, farmId);

      set(state => ({
        personnel: state.personnel.map(p => 
          p.id === personId 
            ? { ...p, assignedFarms: p.assignedFarms.filter(id => id !== farmId) } 
            : p
        )
      }));
    } catch (err) {
      console.error('Error unassigning farm:', err);
    }
  },

  // Selectors
  getPersonById: (personId) => get().personnel.find(p => p.id === personId),
  getPersonnelByRole: (role) => get().personnel.filter(p => p.role === role),
  getPersonnelByFarmId: (farmId) => get().personnel.filter(p => p.assignedFarms.includes(farmId)),
  getGrowerById: (growerId) => get().personnel.find(p => p.id === growerId && p.role === 'grower'),
}));
