import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert } from '@/types/supabase';
import { requireOrgId } from './context';
import { toDataLayerError } from './errors';

export type SupplierRow = Tables<'suppliers'>;

export interface SaveSupplierInput {
  id?: string;
  orgId?: string | null;
  name: string;
  contactPerson?: string | null;
  contactNumber?: string | null;
  email?: string | null;
  address?: string | null;
  supplyCategories?: string[];
  notes?: string | null;
}

export async function fetchSuppliers(orgId: string, includeArchived = false): Promise<SupplierRow[]> {
  try {
    let query = supabase
      .from('suppliers')
      .select('*')
      .eq('org_id', requireOrgId(orgId))
      .is('deleted_at', null)
      .order('name');

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as SupplierRow[];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch suppliers.', 'suppliers.fetchSuppliers');
  }
}

export async function saveSupplier(input: SaveSupplierInput): Promise<SupplierRow> {
  try {
    const payload: TablesInsert<'suppliers'> = {
      org_id: requireOrgId(input.orgId),
      name: input.name,
      contact_person: input.contactPerson ?? null,
      contact_number: input.contactNumber ?? null,
      email: input.email ?? null,
      address: input.address ?? null,
      supply_categories: input.supplyCategories ?? [],
      notes: input.notes ?? null,
    };

    if (input.id) {
      const { data, error } = await supabase
        .from('suppliers')
        .update(payload)
        .eq('id', input.id)
        .select()
        .single();
      if (error) throw error;
      return data as SupplierRow;
    }

    const { data, error } = await supabase
      .from('suppliers')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as SupplierRow;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to save supplier.', 'suppliers.saveSupplier');
  }
}

export async function archiveSupplier(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('suppliers')
      .update({ is_archived: true })
      .eq('id', id);
    if (error) throw error;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to archive supplier.', 'suppliers.archiveSupplier');
  }
}

export async function restoreSupplier(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('suppliers')
      .update({ is_archived: false })
      .eq('id', id);
    if (error) throw error;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to restore supplier.', 'suppliers.restoreSupplier');
  }
}
