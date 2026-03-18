import { supabase } from '@/lib/supabase';

/**
 * Fetch all profiles (personnel) for an organization
 */
export async function getOrgProfiles(orgId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('org_id', orgId)
    .order('last_name');

  if (error) throw error;
  return data;
}

/**
 * Fetch all farm assignments for an organization
 * Useful for joining with profiles to see who is working where
 */
export async function getOrgAssignments(orgId: string) {
  const { data, error } = await supabase
    .from('farm_assignments')
    .select(`
      *,
      farms (name),
      profiles (first_name, last_name, role)
    `)
    .eq('org_id', orgId);

  if (error) throw error;
  return data;
}
