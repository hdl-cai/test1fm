import { supabase } from '@/lib/supabase';
import {
  mapProfileRowToPerson,
  type PersonnelProfileRow,
  type ProfileUpdate,
} from '@/lib/data-adapters';
import type { Person, UserRole } from '@/types';
import { requireOrgId } from './context';
import { toDataLayerError } from './errors';

export async function fetchPersonnel(orgId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        assignments:farm_assignments!farm_assignments_user_id_fkey(farm_id, role)
      `)
      .eq('org_id', requireOrgId(orgId))
      .eq('status', 'active')
      .range(0, 199);

    if (error) {
      throw error;
    }

    return ((data || []) as PersonnelProfileRow[]).map(mapProfileRowToPerson);
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch personnel.', 'personnel.fetchPersonnel');
  }
}

export async function updatePersonRecord(personId: string, updates: Partial<Person>) {
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

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to update person.', 'personnel.updatePersonRecord');
  }
}

export async function assignPersonToFarm(input: {
  personId: string;
  farmId: string;
  role: UserRole;
  orgId?: string | null;
}) {
  try {
    const { error } = await supabase
      .from('farm_assignments')
      .insert({
        user_id: input.personId,
        farm_id: input.farmId,
        role: input.role,
        org_id: requireOrgId(input.orgId),
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to assign farm.', 'personnel.assignPersonToFarm');
  }
}

export async function unassignPersonFromFarm(personId: string, farmId: string) {
  try {
    const { error } = await supabase
      .from('farm_assignments')
      .delete()
      .eq('user_id', personId)
      .eq('farm_id', farmId);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to unassign farm.', 'personnel.unassignPersonFromFarm');
  }
}
