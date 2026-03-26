import { supabase } from '@/lib/supabase';
import { mapProfileRowToAuthUser, type ProfileRow } from '@/lib/data-adapters';
import { toDataLayerError } from './errors';

export async function fetchAuthProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw error ?? new Error('Profile not found.');
    }

    return data as ProfileRow;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch auth profile.', 'auth.fetchAuthProfile');
  }
}

export async function loadAuthUser(userId: string) {
  const profile = await fetchAuthProfile(userId);
  return mapProfileRowToAuthUser(profile);
}

export async function signInWithPassword(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to sign in.', 'auth.signInWithPassword');
  }
}

export async function signOutCurrentUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to sign out.', 'auth.signOutCurrentUser');
  }
}

export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }

    return data.session;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to get current session.', 'auth.getCurrentSession');
  }
}

export function subscribeToAuthChanges(
  callback: (event: string, session: Awaited<ReturnType<typeof getCurrentSession>>) => void | Promise<void>
) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    void callback(event, session);
  });

  return data.subscription;
}

export async function getAccessToken() {
  const session = await getCurrentSession();
  return session?.access_token ?? null;
}

export async function sendUserInvite(input: { email: string; role: string; orgId: string }) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email: input.email,
        role: input.role,
        org_id: input.orgId,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to invite user');
    }

    return data;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to invite user.', 'auth.sendUserInvite');
  }
}
