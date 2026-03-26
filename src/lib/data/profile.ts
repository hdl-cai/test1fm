import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { toDataLayerError } from './errors';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type OrgSettings = Database['public']['Tables']['org_settings']['Row'];

export interface ProfileContext {
  profile: Profile;
  orgSettings: OrgSettings | null;
  isSingleUser: boolean;
}

export async function fetchProfileById(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw error ?? new Error('Profile not found.');
    }

    return data as Profile;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch profile.', 'profile.fetchProfileById');
  }
}

export async function loadProfileContext(userId: string, initialProfile?: Profile | null): Promise<ProfileContext> {
  try {
    const profile = initialProfile ?? await fetchProfileById(userId);
    let orgSettings: OrgSettings | null = null;
    let isSingleUser = false;

    if (profile.org_id) {
      const [{ data: settings }, { count, error: membersError }] = await Promise.all([
        supabase
          .from('org_settings')
          .select('*')
          .eq('org_id', profile.org_id)
          .single(),
        supabase
          .from('org_members')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', profile.org_id),
      ]);

      if (membersError) {
        throw membersError;
      }

      orgSettings = settings as OrgSettings | null;
      isSingleUser = (count ?? 0) <= 1;
    }

    return {
      profile,
      orgSettings,
      isSingleUser,
    };
  } catch (error) {
    throw toDataLayerError(error, 'Failed to load profile context.', 'profile.loadProfileContext');
  }
}

export async function saveProfileUpdates(userId: string, updates: Partial<Profile>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) {
      throw error ?? new Error('Profile update failed.');
    }

    return data as Profile;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to update profile.', 'profile.saveProfileUpdates');
  }
}
