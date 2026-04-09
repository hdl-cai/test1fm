/**
 * GrowerMobileHome — role-specific mobile home screen for Grower role.
 *
 * Shown on Dashboard when viewport < 768 px and role === 'grower'.
 *
 * Features:
 * - Cycle status card (farm name, DOL, live bird count, last report date)
 * - Large "Submit Daily Report" CTA
 * - Upcoming vaccination alert
 * - Rank + career tier badge
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
import { usePerformanceStore } from '@/stores/usePerformanceStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useCyclesStore } from '@/stores/useCyclesStore';
import { useHealthStore } from '@/stores/useHealthStore';
import { Sheet } from '@/components/ui/sheet';
import { VaccinationCalendar } from '@/components/health/VaccinationCalendar';
import type { VaccinationScheduleWithProfile } from '@/lib/data-adapters';

const TIER_STYLES: Record<string, string> = {
  elite: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  senior: 'bg-blue-100 text-blue-800 border-blue-300',
  junior: 'bg-green-100 text-green-800 border-green-300',
  training: 'bg-gray-100 text-gray-700 border-gray-300',
};

export function GrowerMobileHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { flockSummary, isLoading } = useDashboardData();
  const { leaderboard } = usePerformanceStore();
  const { notifications } = useNotificationStore();
  const { cycles } = useCyclesStore();
  const { schedules } = useHealthStore();
  const [showVaxCalendar, setShowVaxCalendar] = useState(false);

  // Find this grower's active cycle (first in summary since growers see their own)
  const activeCycle = flockSummary[0] ?? null;

  // Find grower rank from leaderboard
  const myEntry = leaderboard.find(
    (e) => e.growerName.toLowerCase() === (user?.name ?? '').toLowerCase(),
  );
  const careerTier = myEntry?.careerTier ?? 'training';

  // Find upcoming vaccination notifications
  const vaccinationAlerts = notifications
    .filter(
      (n) =>
        !n.isRead &&
        (n.eventType?.includes('vaccination') || n.message?.toLowerCase().includes('vaccination')),
    )
    .slice(0, 2);

  // Last report date from cycle (approximation from batch name / status)
  const hasCycle = !!activeCycle;

  // Active cycle from cycles store for calendar context
  const activeCycleRecord = cycles.find(c => c.id === activeCycle?.id) ?? null;

  // Vaccination schedules for active cycle (cast as WithProfile since verified_by may be null)
  const activeVaxSchedules = (schedules as VaccinationScheduleWithProfile[]).filter(
    s => activeCycle && (s as { cycle_id?: string }).cycle_id === activeCycle.id
  );

  return (
    <div className="flex flex-col gap-4 px-4 py-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'FlockMate'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <NotificationBell />
      </div>

      {/* Career Tier Badge */}
      {myEntry && (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn('text-xs font-semibold capitalize border', TIER_STYLES[careerTier])}
          >
            {careerTier} Grower
          </Badge>
          {myEntry.rank && (
            <span className="text-xs text-muted-foreground">
              Rank #{myEntry.rank} · EPEF {myEntry.epef.toFixed(0)}
            </span>
          )}
        </div>
      )}

      {/* Active Cycle Card */}
      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2 animate-pulse">
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/2" />
          <div className="h-3 bg-muted rounded w-3/4" />
        </div>
      ) : hasCycle ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Active Batch
              </p>
              <h2 className="text-base font-semibold text-foreground mt-0.5">
                {activeCycle.batchName}
              </h2>
              <p className="text-sm text-muted-foreground">{activeCycle.farmName}</p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                activeCycle.status === 'active'
                  ? 'border-green-500 text-green-600'
                  : 'border-muted text-muted-foreground',
              )}
            >
              {activeCycle.status}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">
                {activeCycle.birdCount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Live Birds</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">
                {(activeCycle.mortalityRate * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Mortality</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">
                {activeCycle.fcr > 0 ? activeCycle.fcr.toFixed(2) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">FCR</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 text-center space-y-2">
          <Icon name="FarmIcon" size={32} className="text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">No active cycle assigned.</p>
        </div>
      )}

      {/* Primary CTA — Submit Daily Report */}
      <Button
        size="lg"
        className="w-full h-14 text-base font-semibold gap-2"
        onClick={() => navigate('/production-cycles')}
        disabled={!hasCycle}
      >
        <Icon name="FileEditIcon" size={20} />
        Submit Daily Report
      </Button>

      {/* Vaccination Schedule Shortcut */}
      {hasCycle && (
        <button
          onClick={() => setShowVaxCalendar(true)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 flex items-center justify-between gap-3 hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon name="MedicalFileIcon" size={18} className="text-primary shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Vaccination Schedule</p>
              <p className="text-xs text-muted-foreground">
                {activeVaxSchedules.length > 0
                  ? `${activeVaxSchedules.filter(s => s.status === 'completed').length}/${activeVaxSchedules.length} completed`
                  : 'View schedule'}
              </p>
            </div>
          </div>
          <Icon name="ArrowRight01Icon" size={16} className="text-muted-foreground shrink-0" />
        </button>
      )}

      {/* Vaccination Alerts */}
      {vaccinationAlerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Vaccination Alerts
          </p>
          {vaccinationAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30"
            >
              <Icon
                name="Alert02Icon"
                size={16}
                className="text-amber-600 shrink-0 mt-0.5"
              />
              <p className="text-sm text-amber-800 dark:text-amber-300">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => navigate('/production-cycles')}
          className="rounded-xl border border-border bg-card p-3 flex flex-col items-start gap-1 hover:bg-accent transition-colors text-left"
        >
          <Icon name="Calendar01Icon" size={20} className="text-primary" />
          <span className="text-sm font-medium text-foreground">My Cycles</span>
          <span className="text-xs text-muted-foreground">View all batches</span>
        </button>
        <button
          onClick={() => navigate('/notifications')}
          className="rounded-xl border border-border bg-card p-3 flex flex-col items-start gap-1 hover:bg-accent transition-colors text-left"
        >
          <Icon name="Notification01Icon" size={20} className="text-primary" />
          <span className="text-sm font-medium text-foreground">Notifications</span>
          <span className="text-xs text-muted-foreground">View all alerts</span>
        </button>
      </div>
      {/* Vaccination Calendar Sheet */}
      <Sheet
        isOpen={showVaxCalendar}
        onClose={() => setShowVaxCalendar(false)}
        title="Vaccination Schedule"
        description="Read-only view of your cycle's vaccination calendar"
        width="lg"
      >
        <VaccinationCalendar
          schedules={activeVaxSchedules}
          cycleStartDate={activeCycleRecord ? new Date(activeCycleRecord.startDate) : null}
          isAdmin={false}
        />
      </Sheet>
    </div>
  );
}
