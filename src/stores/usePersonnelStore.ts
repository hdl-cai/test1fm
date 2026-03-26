/**
 * Personnel Store
 * Zustand store for personnel management with Supabase integration
 */

import { create } from 'zustand';
import {
  mapProfileRowToPerson,
  type PersonnelProfileRow,
  type ProfileUpdate,
} from '@/lib/data-adapters';
import { supabase } from '@/lib/supabase';
import type { Person, UserRole } from '@/types';
import { useAuthStore } from './useAuthStore';

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
      // Fetch profiles for the organization
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          assignments:farm_assignments!farm_assignments_user_id_fkey(farm_id, role)
        `)
        .eq('org_id', orgId)
        .eq('status', 'active')
        .range(0, 199);

      if (profileError) throw profileError;

      const mappedPersonnel: Person[] = ((profiles || []) as PersonnelProfileRow[]).map(mapProfileRowToPerson);

      set({ personnel: mappedPersonnel, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch personnel.';
      set({ error: message, isLoading: false });
    }
  },

    selectPerson: (personId) => set({ selectedPersonId: personId }),

  updatePerson: async (personId, updates) => {
    try {
      const dbUpdates: ProfileUpdate = {};
      if (updates.name) {
        const parts = updates.name.split(' ');
        dbUpdates.first_name = parts[0];
        dbUpdates.last_name = parts.slice(1).join(' ');
      }
      if (updates.phone) dbUpdates.contact_number = updates.phone;
      if (updates.status) dbUpdates.status = updates.status;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', personId);

      if (error) throw error;

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

      const orgId = useAuthStore.getState().user?.orgId;
      if (!orgId) {
        throw new Error('Organization context is required to assign a farm.');
      }
      
      const { error } = await supabase
        .from('farm_assignments')
        .insert({
          user_id: personId,
          farm_id: farmId,
          role,
          org_id: orgId,
        });

      if (error) throw error;

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
      const { error } = await supabase
        .from('farm_assignments')
        .delete()
        .eq('user_id', personId)
        .eq('farm_id', farmId);

      if (error) throw error;

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
