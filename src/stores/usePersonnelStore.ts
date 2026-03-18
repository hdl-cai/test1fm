/**
 * Personnel Store
 * Zustand store for personnel management with Supabase integration
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Person } from '@/types';

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
  assignFarm: (personId: string, farmId: string, role: string) => Promise<void>;
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
        .eq('status', 'active');

      if (profileError) throw profileError;

      const mappedPersonnel: Person[] = (profiles || []).map(p => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        email: p.email,
        phone: p.contact_number || '',
        role: p.role as any,
        status: p.status as any,
        avatar: p.avatar_url || undefined,
        assignedFarms: (p.assignments as any[] || []).map(a => a.farm_id),
      }));

      set({ personnel: mappedPersonnel, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  selectPerson: (personId) => set({ selectedPersonId: personId }),

  updatePerson: async (personId, updates) => {
    try {
      const dbUpdates: any = {};
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
    } catch (err: any) {
      console.error('Error updating person:', err);
    }
  },

  addPerson: async (_personData) => {
    console.warn('addPerson requires strategic implementation (invite vs create)');
  },

  assignFarm: async (personId, farmId, role) => {
    try {
      // Find the org_id from existing personnel profile
      const targetUser = get().personnel.find(p => p.id === personId);
      if (!targetUser) return;

      // We need org_id from the original profile record which is not in our Person type.
      // Fetch it or assume from auth.
      const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', personId).single();
      
      const { error } = await supabase
        .from('farm_assignments')
        .insert({
          user_id: personId,
          farm_id: farmId,
          role: role,
          org_id: profile?.org_id || '' 
        });

      if (error) throw error;

      set(state => ({
        personnel: state.personnel.map(p => 
          p.id === personId 
            ? { ...p, assignedFarms: [...p.assignedFarms, farmId] } 
            : p
        )
      }));
    } catch (err: any) {
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
    } catch (err: any) {
      console.error('Error unassigning farm:', err);
    }
  },

  // Selectors
  getPersonById: (personId) => get().personnel.find(p => p.id === personId),
  getPersonnelByRole: (role) => get().personnel.filter(p => p.role === role),
  getPersonnelByFarmId: (farmId) => get().personnel.filter(p => p.assignedFarms.includes(farmId)),
  getGrowerById: (growerId) => get().personnel.find(p => p.id === growerId && p.role === 'grower'),
}));
