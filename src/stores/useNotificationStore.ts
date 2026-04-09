import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  archiveNotification,
  fetchNotificationsForRecipient,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/data/notifications';
import { getErrorMessage } from '@/lib/data/errors';
import type { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  _channel: RealtimeChannel | null;
  _channelRecipientId: string | null;

  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  archive: (id: string) => Promise<void>;
  subscribeRealtime: () => void;
  unsubscribeRealtime: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  _channel: null,
  _channelRecipientId: null,

  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.id) {
        set({ notifications: [], unreadCount: 0, isLoading: false });
        return;
      }

      const notifications = await fetchNotificationsForRecipient(user.id, user.orgId, 50);
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load notifications'), isLoading: false });
    }
  },

  markRead: async (id: string) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.id) return;

      await markNotificationRead(id, user.id, user.orgId);
      set((state) => {
        const notifications = state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date() } : n
        );
        return { notifications, unreadCount: notifications.filter((n) => !n.isRead).length };
      });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to mark notification as read') });
    }
  },

  markAllRead: async () => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.id) return;

      await markAllNotificationsRead(user.id, user.orgId);
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          isRead: true,
          readAt: n.readAt ?? new Date(),
        })),
        unreadCount: 0,
      }));
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to mark all as read') });
    }
  },

  archive: async (id: string) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.id) return;

      await archiveNotification(id, user.id, user.orgId);
      set((state) => {
        const notifications = state.notifications.filter((n) => n.id !== id);
        return { notifications, unreadCount: notifications.filter((n) => !n.isRead).length };
      });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to archive notification') });
    }
  },

  subscribeRealtime: () => {
    const user = useAuthStore.getState().user;
    if (!user?.id) return;

    const existing = get()._channel;
    const existingRecipientId = get()._channelRecipientId;
    if (existing && existingRecipientId === user.id) return;
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase
      .channel(`notifications-live:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          if (row.recipient_id !== user.id) {
            return;
          }

          const notification: Notification = {
            id: row.id as string,
            orgId: row.org_id as string,
            recipientId: row.recipient_id as string,
            type: row.type as string,
            eventType: (row.event_type as string | null) ?? null,
            urgency: (row.urgency as Notification['urgency']) ?? null,
            title: row.title as string,
            message: row.message as string,
            link: (row.link as string | null) ?? null,
            isRead: false,
            isArchived: false,
            farmId: (row.farm_id as string | null) ?? null,
            cycleId: (row.cycle_id as string | null) ?? null,
            readAt: null,
            expiresAt: row.expires_at ? new Date(row.expires_at as string) : null,
            createdAt: new Date(row.created_at as string),
          };

          set((state) => {
            if (state.notifications.some((item) => item.id === notification.id)) {
              return state;
            }

            return {
              notifications: [notification, ...state.notifications],
              unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
            };
          });
        }
      )
      .subscribe();

    set({ _channel: channel, _channelRecipientId: user.id });
  },

  unsubscribeRealtime: () => {
    const channel = get()._channel;
    if (channel) {
      supabase.removeChannel(channel);
      set({ _channel: null, _channelRecipientId: null });
    }
  },
}));
