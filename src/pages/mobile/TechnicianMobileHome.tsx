/**
 * TechnicianMobileHome — role-specific mobile home screen for Technician role.
 *
 * Features:
 * - Assigned farms quick status list
 * - Daily report shortcut
 * - Low stock alerts
 * - Notification bell
 */

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/hooks/useIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useCyclesStore } from '@/stores/useCyclesStore';
import { DeliveryLogSheet } from '@/components/sheets/DeliveryLogSheet';
import { HarvestLogSheet } from '@/components/sheets/HarvestLogSheet';
import { HealthReportSheet } from '@/components/sheets/HealthReportSheet';

export function TechnicianMobileHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { flockSummary, stats, isLoading } = useDashboardData();
  const { notifications } = useNotificationStore();
  const { cycles } = useCyclesStore();

  const [activeSheet, setActiveSheet] = useState<'delivery' | 'harvest' | 'health' | null>(null);

  const activeCycle = cycles.find(c => c.status === 'active') ?? null;

  // Low stock alerts (inventory-related notifications)
  const stockAlerts = notifications
    .filter(
      (n) =>
        !n.isRead &&
        (n.eventType?.includes('stock') ||
          n.eventType?.includes('inventory') ||
          n.message?.toLowerCase().includes('stock') ||
          n.message?.toLowerCase().includes('inventory')),
    )
    .slice(0, 3);

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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Active Cycles
          </p>
          <p className="text-2xl font-bold text-foreground">
            {isLoading ? '—' : stats.activeCyclesCount}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Total Birds
          </p>
          <p className="text-2xl font-bold text-foreground">
            {isLoading ? '—' : stats.totalBirds.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Primary CTA */}
      <Button
        size="lg"
        className="w-full h-14 text-base font-semibold gap-2"
        onClick={() => navigate('/production-cycles')}
      >
        <Icon name="FileEditIcon" size={20} />
        Submit Daily Report
      </Button>

      {/* Low Stock Alerts */}
      {stockAlerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Stock Alerts
          </p>
          {stockAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => navigate('/inventory')}
              role="button"
              className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 cursor-pointer hover:bg-red-100 transition-colors dark:border-red-800 dark:bg-red-950/30"
            >
              <Icon name="InventoryIcon" size={16} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Assigned Farms */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Active Batches
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
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3 animate-pulse h-16" />
            ))}
          </div>
        ) : flockSummary.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">No active batches found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {flockSummary.slice(0, 4).map((cycle) => (
              <button
                key={cycle.id}
                onClick={() => navigate('/production-cycles')}
                className={cn(
                  'w-full rounded-xl border border-border bg-card p-3',
                  'flex items-center justify-between',
                  'hover:bg-accent transition-colors text-left',
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{cycle.farmName}</p>
                  <p className="text-xs text-muted-foreground truncate">{cycle.batchName}</p>
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

            {flockSummary.length > 4 && (
              <button
                onClick={() => navigate('/production-cycles')}
                className="w-full text-xs text-primary font-medium py-1 hover:underline"
              >
                +{flockSummary.length - 4} more batches
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Quick Actions
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveSheet('delivery')}
            className="rounded-xl border border-border bg-card p-3 flex flex-col items-center gap-1 hover:bg-accent transition-colors"
          >
            <Icon name="TruckIcon" size={20} className="text-primary" />
            <span className="text-xs font-medium text-foreground text-center leading-tight">Log Delivery</span>
          </button>
          <button
            onClick={() => setActiveSheet('harvest')}
            className="rounded-xl border border-border bg-card p-3 flex flex-col items-center gap-1 hover:bg-accent transition-colors"
          >
            <Icon name="FarmIcon" size={20} className="text-primary" />
            <span className="text-xs font-medium text-foreground text-center leading-tight">Log Harvest</span>
          </button>
          <button
            onClick={() => setActiveSheet('health')}
            className="rounded-xl border border-border bg-card p-3 flex flex-col items-center gap-1 hover:bg-accent transition-colors"
          >
            <Icon name="MedicalFileIcon" size={20} className="text-primary" />
            <span className="text-xs font-medium text-foreground text-center leading-tight">Log Health Event</span>
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { label: 'Farms', icon: 'FarmIcon', path: '/farms' },
          { label: 'Inventory', icon: 'InventoryIcon', path: '/inventory' },
          { label: 'Notifications', icon: 'Notification01Icon', path: '/notifications' },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="rounded-xl border border-border bg-card p-3 flex flex-col items-center gap-1 hover:bg-accent transition-colors"
          >
            <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={20} className="text-primary" />
            <span className="text-xs font-medium text-foreground">{item.label}</span>
          </button>
        ))}
      </div>
      {/* Sheet Modals */}
      {activeCycle && (
        <>
          <DeliveryLogSheet
            isOpen={activeSheet === 'delivery'}
            onClose={() => setActiveSheet(null)}
            cycleId={activeCycle.id}
            farmId={activeCycle.farmId}
            orgId={user?.orgId ?? ''}
          />
          <HarvestLogSheet
            isOpen={activeSheet === 'harvest'}
            onClose={() => setActiveSheet(null)}
            cycleId={activeCycle.id}
            orgId={user?.orgId ?? ''}
          />
        </>
      )}
      <HealthReportSheet
        isOpen={activeSheet === 'health'}
        onClose={() => setActiveSheet(null)}
      />
    </div>
  );
}
