import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type OrgSettings = Database['public']['Tables']['org_settings']['Row'];

interface ProfileState {
  profile: Profile | null;
  orgSettings: OrgSettings | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  orgSettings: null,
  isLoading: false,
  error: null,

  loadProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // 1. Fetch Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // 2. Fetch Org Settings if org_id exists
      let orgSettings = null;
      if (profile.org_id) {
        const { data: settings, error: settingsError } = await supabase
          .from('org_settings')
          .select('*')
          .eq('org_id', profile.org_id)
          .single();
        
        if (!settingsError) {
          orgSettings = settings;
        }
      }

      set({ 
        profile, 
        orgSettings, 
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      console.error('Error loading profile context:', err);
    }
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

  clearProfile: () => set({ profile: null, orgSettings: null, error: null }),
}));
