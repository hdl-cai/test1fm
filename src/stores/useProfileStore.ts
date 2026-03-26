import { create } from 'zustand';
import {
  fetchProfileById,
  loadProfileContext as loadProfileContextFromDataLayer,
  saveProfileUpdates,
  type Profile,
  type OrgSettings,
} from '@/lib/data/profile';
import { getErrorMessage } from '@/lib/data/errors';

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
          profile = await fetchProfileById(userId);
        }

        if (!profile) {
          throw new Error('Profile not found.');
        }

        const { orgSettings, isSingleUser } = await loadProfileContextFromDataLayer(userId, profile);

        set({
          profile,
          orgSettings,
          isSingleUser,
          isLoading: false
        });
      } catch (err) {
        const message = getErrorMessage(err, 'Failed to load profile context.');
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
    try {
      const data = await saveProfileUpdates(profile.id, updates);
      set({ profile: data, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to update profile.'), isLoading: false });
    }
  },

  clearProfile: () => set({ profile: null, orgSettings: null, isSingleUser: false, error: null }),
}));
