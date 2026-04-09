/**
 * AdminMobileHome — role-specific mobile home screen for Admin/Owner role.
 *
 * Read-only dashboard summary, optimised for a quick glance on mobile.
 *
 * Features:
 * - Summary cards: total live birds, active cycles, farms with alerts
 * - Farm status list (tap → navigate to farms)
 * - Sensor alert feed
 * - Cash advance pending count → tap to approve/reject
 * - Notification feed (last 5)
 */

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/hooks/useIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { updateCashAdvanceStatus } from '@/lib/data/finance';
import { toast } from 'sonner';

export function AdminMobileHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { stats, flockSummary, pendingApprovals, isLoading } = useDashboardData();
  const { notifications, unreadCount } = useNotificationStore();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  async function handleCAAction(id: string, action: 'approved' | 'rejected') {
    setProcessingId(id);
    try {
      await updateCashAdvanceStatus({ id, status: action });
      setDismissedIds(prev => new Set(prev).add(id));
      toast.success(action === 'approved' ? 'Cash advance approved.' : 'Cash advance rejected.');
    } catch {
      toast.error('Failed to update cash advance. Please try again.');
    } finally {
      setProcessingId(null);
    }
  }

  // Sensor alerts
  const sensorAlerts = notifications
    .filter(
      (n) =>
        !n.isRead &&
        (n.eventType?.includes('sensor') || n.message?.toLowerCase().includes('sensor')),
    )
    .slice(0, 3);

  // Cash advance pending (exclude dismissed)
  const pendingCashAdvances = pendingApprovals
    .filter((p) => p.type === 'cash_advance' && !dismissedIds.has(p.id));

  // Recent notifications
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="flex flex-col gap-4 px-4 py-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'FlockMate'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-PH', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <NotificationBell />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: 'Live Birds',
            value: isLoading ? '—' : stats.totalBirds.toLocaleString(),
            icon: 'FarmIcon',
          },
          {
            label: 'Active Cycles',
            value: isLoading ? '—' : String(stats.activeCyclesCount),
            icon: 'CycleIcon',
          },
          {
            label: 'Unread Alerts',
            value: String(unreadCount),
            icon: 'Alert02Icon',
          },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-3 space-y-1">
            <Icon name={card.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-muted-foreground" />
            <p className="text-xl font-bold text-foreground leading-none">{card.value}</p>
            <p className="text-xs text-muted-foreground leading-tight">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Cash Advance Approvals */}
      {pendingCashAdvances.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Pending Cash Advances
            </p>
            <button
              onClick={() => navigate('/finance')}
              className="text-xs text-primary font-medium hover:underline"
            >
              View all
            </button>
          </div>
          {pendingCashAdvances.map((ca) => (
            <div
              key={ca.id}
              className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-300 truncate">
                    {ca.requestedBy}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 truncate">{ca.description}</p>
                </div>
                <span className="text-sm font-bold text-amber-900 dark:text-amber-200 whitespace-nowrap">
                  ₱{ca.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={processingId === ca.id}
                  onClick={() => handleCAAction(ca.id, 'rejected')}
                  className="flex-1 h-8 text-xs border-red-400 text-red-600 hover:bg-red-50"
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  disabled={processingId === ca.id}
                  onClick={() => handleCAAction(ca.id, 'approved')}
                  className="flex-1 h-8 text-xs bg-amber-600 hover:bg-amber-500 text-white"
                >
                  {processingId === ca.id ? '…' : 'Approve'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sensor Alerts */}
      {sensorAlerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Sensor Alerts
          </p>
          {sensorAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => navigate('/sensors')}
              role="button"
              className={cn(
                'flex items-start gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors',
                alert.urgency === 'critical'
                  ? 'border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30'
                  : 'border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30',
              )}
            >
              <Icon
                name="SensorIcon"
                size={16}
                className={cn(
                  'shrink-0 mt-0.5',
                  alert.urgency === 'critical' ? 'text-red-600' : 'text-amber-600',
                )}
              />
              <p
                className={cn(
                  'text-sm',
                  alert.urgency === 'critical'
                    ? 'text-red-800 dark:text-red-300'
                    : 'text-amber-800 dark:text-amber-300',
                )}
              >
                {alert.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Farm Status List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Farm Status
          </p>
          <button
            onClick={() => navigate('/farms')}
            className="text-xs text-primary font-medium hover:underline"
          >
            View all
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3 animate-pulse h-12" />
            ))}
          </div>
        ) : flockSummary.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">No active cycles.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {flockSummary.slice(0, 5).map((cycle) => (
              <button
                key={cycle.id}
                onClick={() => navigate('/farms')}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 flex items-center justify-between hover:bg-accent transition-colors text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{cycle.farmName}</p>
                  <p className="text-xs text-muted-foreground truncate">{cycle.growerName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-sm font-semibold text-foreground">
                    {cycle.birdCount.toLocaleString()}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      cycle.status === 'active'
                        ? 'border-green-500 text-green-600'
                        : 'border-muted text-muted-foreground',
                    )}
                  >
                    {cycle.status}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recent Notifications */}
      {recentNotifications.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Recent Alerts
            </p>
            <button
              onClick={() => navigate('/notifications')}
              className="text-xs text-primary font-medium hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-1.5">
            {recentNotifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm',
                  n.isRead ? 'text-muted-foreground' : 'font-medium text-foreground',
                  'border border-border bg-card',
                )}
              >
                {n.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
