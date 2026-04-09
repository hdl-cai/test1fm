import { supabase } from '@/lib/supabase';
import { requireUserId } from './context';
import { toDataLayerError } from './errors';
import type { Notification } from '@/types';

function mapRow(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    orgId: row.org_id as string,
    recipientId: row.recipient_id as string,
    type: row.type as string,
    eventType: (row.event_type as string | null) ?? null,
    urgency: (row.urgency as Notification['urgency']) ?? null,
    title: row.title as string,
    message: row.message as string,
    link: (row.link as string | null) ?? null,
    isRead: (row.is_read as boolean) ?? false,
    isArchived: (row.is_archived as boolean) ?? false,
    farmId: (row.farm_id as string | null) ?? null,
    cycleId: (row.cycle_id as string | null) ?? null,
    readAt: row.read_at ? new Date(row.read_at as string) : null,
    expiresAt: row.expires_at ? new Date(row.expires_at as string) : null,
    createdAt: new Date(row.created_at as string),
  };
}

export async function fetchNotifications(limit = 50): Promise<Notification[]> {
  try {
    const resolvedUserId = requireUserId();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', resolvedUserId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw toDataLayerError(error, 'Failed to fetch notifications.', 'notifications.fetchNotifications');
    return (data ?? []).map(mapRow);
  } catch (err) {
    throw toDataLayerError(err, 'Failed to fetch notifications.', 'notifications.fetchNotifications');
  }
}

export async function fetchNotificationsForRecipient(userId: string, orgId?: string | null, limit = 50): Promise<Notification[]> {
  try {
    const resolvedUserId = requireUserId(userId);
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', resolvedUserId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    const { data, error } = await query;

    if (error) throw toDataLayerError(error, 'Failed to fetch notifications.', 'notifications.fetchNotificationsForRecipient');
    return (data ?? []).map(mapRow);
  } catch (err) {
    throw toDataLayerError(err, 'Failed to fetch notifications.', 'notifications.fetchNotificationsForRecipient');
  }
}

export async function fetchArchivedNotifications(userId: string, orgId?: string | null, limit = 50, offset = 0): Promise<Notification[]> {
  try {
    const resolvedUserId = requireUserId(userId);
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', resolvedUserId)
      .eq('is_archived', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    const { data, error } = await query;

    if (error) throw toDataLayerError(error, 'Failed to fetch archived notifications.', 'notifications.fetchArchivedNotifications');
    return (data ?? []).map(mapRow);
  } catch (err) {
    throw toDataLayerError(err, 'Failed to fetch archived notifications.', 'notifications.fetchArchivedNotifications');
  }
}

export async function markNotificationRead(id: string, userId: string, orgId?: string | null): Promise<void> {
  try {
    const resolvedUserId = requireUserId(userId);
    let query = supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('recipient_id', resolvedUserId);

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    const { error } = await query;

    if (error) throw toDataLayerError(error, 'Failed to mark notification as read.', 'notifications.markNotificationRead');
  } catch (err) {
    throw toDataLayerError(err, 'Failed to mark notification as read.', 'notifications.markNotificationRead');
  }
}

export async function markAllNotificationsRead(userId: string, orgId?: string | null): Promise<void> {
  try {
    const resolvedUserId = requireUserId(userId);
    let query = supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', resolvedUserId)
      .eq('is_archived', false)
      .eq('is_read', false);

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    const { error } = await query;

    if (error) throw toDataLayerError(error, 'Failed to mark all notifications as read.', 'notifications.markAllNotificationsRead');
  } catch (err) {
    throw toDataLayerError(err, 'Failed to mark all notifications as read.', 'notifications.markAllNotificationsRead');
  }
}

export async function archiveNotification(id: string, userId: string, orgId?: string | null): Promise<void> {
  try {
    const resolvedUserId = requireUserId(userId);
    let query = supabase
      .from('notifications')
      .update({ is_archived: true, is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('recipient_id', resolvedUserId);

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    const { error } = await query;

    if (error) throw toDataLayerError(error, 'Failed to archive notification.', 'notifications.archiveNotification');
  } catch (err) {
    throw toDataLayerError(err, 'Failed to archive notification.', 'notifications.archiveNotification');
  }
}
