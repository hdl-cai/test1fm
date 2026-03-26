import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
type OrgSettings = Database['public']['Tables']['org_settings']['Row'];

let profileLoadPromise: Promise<void> | null = null;

interface ProfileState {
  profile: Profile | null;
  orgSettings: OrgSettings | null;
  isSingleUser: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProfile: (userId: string, initialProfile?: Profile | null) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  orgSettings: null,
  isSingleUser: false,
  isLoading: false,
  error: null,

  loadProfile: async (userId: string, initialProfile = null) => {
    const currentProfile = get().profile;
    if (currentProfile?.id === userId && !get().error) {
      return;
    }

    if (profileLoadPromise) {
      return profileLoadPromise;
    }

    set({ isLoading: true, error: null });

    profileLoadPromise = (async () => {
      try {
        let profile = initialProfile;
        if (!profile) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) {
            throw error;
          }

          profile = data;
        }

        if (!profile) {
          throw new Error('Profile not found.');
        }

        let orgSettings: OrgSettings | null = null;
        let isSingleUser = false;

        if (profile.org_id) {
          const [{ data: settings }, { count }] = await Promise.all([
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

          orgSettings = settings;
          isSingleUser = (count ?? 0) <= 1;
        }

        set({
          profile,
          orgSettings,
          isSingleUser,
          isLoading: false
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load profile context.';
        set({ error: message, isLoading: false });
        console.error('Error loading profile context:', err);
      } finally {
        profileLoadPromise = null;
      }
    })();

    return profileLoadPromise;
  },

  updateProfile: async (updates) => {
    const profile = get().profile;
    if (!profile) return;

    set({ isLoading: true });
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single();

    if (error) {
      set({ error: error.message, isLoading: false });
    } else {
      set({ profile: data, isLoading: false });
    }
  },

  clearProfile: () => set({ profile: null, orgSettings: null, isSingleUser: false, error: null }),
}));
