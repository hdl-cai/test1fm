import { supabase } from '@/lib/supabase';

/**
 * Fetch all farms for an organization
 */
export async function getFarms(orgId: string) {
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('org_id', orgId)
    .order('name');

  if (error) throw error;
  return data;
}

/**
 * Fetch a single farm by ID with its basic info
 */
export async function getFarmById(farmId: string) {
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('id', farmId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch active cycles for a set of farm IDs
 * Useful for calculating live bird counts in the farm list
 */
export async function getActiveCyclesByFarms(orgId: string, farmIds: string[]) {
  const { data, error } = await supabase
    .from('production_cycles')
    .select(`
      id, 
      farm_id, 
      initial_birds,
      performance_metrics (fcr_to_date, livability_pct)
    `)
    .eq('org_id', orgId)
    .eq('status', 'active')
    .in('farm_id', farmIds);

  if (error) throw error;
  return data;
}

/**
 * Fetch personnel assignments for a specific farm
 */
export async function getFarmPersonnel(farmId: string) {
  const { data, error } = await supabase
    .from('farm_assignments')
    .select(`
      role,
      status,
      profiles (
        id,
        first_name,
        last_name,
        email,
        contact_number
      )
    `)
    .eq('farm_id', farmId);

  if (error) throw error;
  return data;
}

/**
 * Fetch inventory stock levels for a specific farm
 */
export async function getFarmInventoryStock(farmId: string) {
  const { data, error } = await supabase
    .from('inventory_stock')
    .select(`
      current_qty,
      inventory_items (name, unit, category:inventory_categories(name))
    `)
    .eq('farm_id', farmId);

  if (error) throw error;
  return data;
}
