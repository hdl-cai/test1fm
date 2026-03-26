import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { mapProfileRowToAuthUser } from '@/lib/data-adapters';
import type { UserRole } from '@/types';
import { useProfileStore, type Profile } from './useProfileStore';

// Module-level subscription reference — outside the Zustand store
// so it persists across renders and can be cleaned up properly.
let authSubscription: { unsubscribe: () => void } | null = null;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgId: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

/**
 * Reusable function to fetch profile data for a given user ID.
 */
async function fetchUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

async function loadAuthContext(userId: string) {
  const profile = await fetchUserProfile(userId);
  if (!profile) {
    return null;
  }

  await useProfileStore.getState().loadProfile(userId, profile);
  return mapProfileRowToAuthUser(profile);
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
      return false;
    }

    if (data?.user) {
      const profile = await loadAuthContext(data.user.id);
      
      if (profile) {
        set({
          user: profile,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({ isLoading: false, error: 'Could not load user profile.' });
        return false;
      }
    }

    set({ isLoading: false, error: 'Sign in did not return a user session.' });
    return false;
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
      const profile = await loadAuthContext(session.user.id);
      if (profile) {
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
        const existingUser = get().user;
        const loadedProfile = useProfileStore.getState().profile;
        if (existingUser?.id === session.user.id && loadedProfile?.id === session.user.id) {
          set({ isAuthenticated: true, isLoading: false });
          return;
        }

        const profile = await loadAuthContext(session.user.id);
        if (profile) {
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
