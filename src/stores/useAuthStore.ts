import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useProfileStore } from './useProfileStore';

// Module-level subscription reference — outside the Zustand store
// so it persists across renders and can be cleaned up properly.
let authSubscription: { unsubscribe: () => void } | null = null;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  orgId: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

/**
 * Reusable function to fetch profile data for a given user ID.
 */
async function fetchUserProfile(userId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, role, org_id')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    name: `${data.first_name} ${data.last_name}`.trim(),
    role: data.role,
    orgId: data.org_id,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // starts true until initialize() resolves
  error: null,

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    if (data?.user) {
      const profile = await fetchUserProfile(data.user.id);
      
      if (profile) {
        // Load detailed context (org settings etc)
        await useProfileStore.getState().loadProfile(data.user.id);

        set({
          user: profile,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({ isLoading: false, error: 'Could not load user profile.' });
      }
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    useProfileStore.getState().clearProfile();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  initialize: async () => {
    // Guard: prevent duplicate initializations
    if (!get().isLoading && get().user !== null) return;

    set({ isLoading: true });

    // 1. Check current session
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const profile = await fetchUserProfile(session.user.id);
      if (profile) {
        // Load detailed context (org settings etc)
        await useProfileStore.getState().loadProfile(session.user.id);

        set({
          user: profile,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }

    // 2. Clean up any existing subscription before registering a new one
    if (authSubscription) {
      authSubscription.unsubscribe();
      authSubscription = null;
    }

    // 3. Listen for auth changes (SIGNED_IN, SIGNED_OUT, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // If user is already set, we might not need to re-fetch profile/load context,
        // but it's safer to ensure profile context is loaded.
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          await useProfileStore.getState().loadProfile(session.user.id);
          set({
            user: profile,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        useProfileStore.getState().clearProfile();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });
    authSubscription = subscription;
  },

  clearError: () => set({ error: null }),
}));
