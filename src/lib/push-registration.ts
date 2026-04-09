/**
 * Push Registration — subscribes the current browser to Web Push notifications
 * and saves the subscription endpoint to the `push_subscriptions` Supabase table.
 *
 * Requirements:
 *  - VITE_VAPID_PUBLIC_KEY must be set in the environment.
 *  - Service Worker must be registered (handled by vite-plugin-pwa).
 *  - User must be authenticated (userId passed by caller).
 *
 * iOS limitations:
 *  - Web Push is only available on iOS 16.4+ when the app is installed to the
 *    home screen. A detection helper is exported so the UI can prompt accordingly.
 */

import { supabase } from '@/lib/supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PushRegistrationResult {
  status: 'subscribed' | 'already_subscribed' | 'denied' | 'unsupported' | 'error';
  message?: string;
}

// ─── Platform Detection ───────────────────────────────────────────────────────

/** True when running in a browser that supports Web Push. */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * True when running on iOS (Safari or iOS Chrome/Firefox which use WebKit).
 * Web Push on iOS requires home-screen install + iOS 16.4+.
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * True when the app is running as an installed PWA (standalone or fullscreen display mode).
 */
export function isInstalledPWA(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari on iOS uses this non-standard property
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// ─── URL-safe Base64 → Uint8Array ─────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ─── Core Registration ────────────────────────────────────────────────────────

/**
 * Request push permission, subscribe via the Service Worker, and persist the
 * subscription in `push_subscriptions` for the authenticated user.
 */
export async function registerPushSubscription(
  userId: string,
  deviceLabel?: string,
): Promise<PushRegistrationResult> {
  if (!isPushSupported()) {
    return { status: 'unsupported', message: 'Push notifications are not supported in this browser.' };
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('[push-registration] VITE_VAPID_PUBLIC_KEY is not set. Push disabled.');
    return { status: 'error', message: 'Push key not configured.' };
  }

  // iOS: must be installed to home screen first
  if (isIOS() && !isInstalledPWA()) {
    return {
      status: 'unsupported',
      message: 'On iOS, add FlockMate to your home screen first, then enable notifications.',
    };
  }

  // Check current permission state
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { status: 'denied', message: 'Notification permission was denied.' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      // Ensure it is saved in the DB (idempotent upsert)
      await upsertSubscription(userId, existing, deviceLabel);
      return { status: 'already_subscribed' };
    }

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
    });

    await upsertSubscription(userId, subscription, deviceLabel);
    return { status: 'subscribed' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[push-registration] Subscription failed:', message);
    return { status: 'error', message };
  }
}

// ─── Unregister ───────────────────────────────────────────────────────────────

/**
 * Unsubscribe the current browser from push and remove from DB.
 */
export async function unregisterPushSubscription(): Promise<void> {
  if (!isPushSupported()) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    // Remove from Supabase
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
  } catch (err) {
    console.error('[push-registration] Unsubscribe failed:', err);
  }
}

// ─── Supabase Persistence ─────────────────────────────────────────────────────

async function upsertSubscription(
  userId: string,
  subscription: PushSubscription,
  deviceLabel?: string,
): Promise<void> {
  const json = subscription.toJSON();
  const keys = json.keys as { p256dh: string; auth: string } | undefined;

  if (!keys?.p256dh || !keys?.auth) return;

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      device_label: deviceLabel ?? null,
      last_used_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  );

  if (error) {
    console.error('[push-registration] Failed to save subscription to DB:', error.message);
  }
}
