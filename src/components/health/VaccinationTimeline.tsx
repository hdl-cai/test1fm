/**
 * VaccinationTimeline
 * Timeline view of vaccination schedules for a cycle.
 * Shows status badges, scheduled vs actual dates, and admin actions.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icon } from '@/hooks/useIcon';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MarkVaccineDoneSheet } from './MarkVaccineDoneSheet';
import { RescheduleVaccineSheet } from './RescheduleVaccineSheet';
import type { VaccinationScheduleWithProfile } from '@/lib/data-adapters';

interface VaccinationTimelineProps {
  schedules: VaccinationScheduleWithProfile[];
  cycleId: string;
  userId: string;
  isAdmin: boolean;
  onRefetch: () => void;
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'completed':
      return { label: 'Done', type: 'success' as const, dotClass: 'bg-primary text-primary-foreground' };
    case 'overdue':
      return { label: 'Overdue', type: 'danger' as const, dotClass: 'bg-destructive text-destructive-foreground' };
    default:
      return { label: 'Scheduled', type: 'warning' as const, dotClass: 'bg-muted text-muted-foreground' };
  }
}

export function VaccinationTimeline({
  schedules,
  userId,
  isAdmin,
  onRefetch,
}: VaccinationTimelineProps) {
  const [markDoneSchedule, setMarkDoneSchedule] = React.useState<VaccinationScheduleWithProfile | null>(null);
  const [rescheduleSchedule, setRescheduleSchedule] = React.useState<VaccinationScheduleWithProfile | null>(null);

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="MedicineIcon" size={24} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No vaccination schedule</p>
        <p className="text-xs text-muted-foreground mt-1">Schedules are auto-generated when a cycle is created.</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative pl-8 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/60">
        {schedules.map((schedule) => {
          const statusConfig = getStatusConfig(schedule.status);
          const adminByName = schedule.verified_by
            ? `${schedule.verified_by.first_name ?? ''} ${schedule.verified_by.last_name ?? ''}`.trim()
            : null;

          return (
            <div key={schedule.id} className="relative group">
              {/* Timeline dot */}
              <div className={cn(
                'absolute -left-8 top-2 w-7 h-7 rounded-full border-4 border-background flex items-center justify-center transition-all',
                statusConfig.dotClass
              )}>
                {schedule.status === 'completed'
                  ? <Icon name="CheckmarkIcon" size={12} />
                  : schedule.status === 'overdue'
                  ? <Icon name="AlertCircleIcon" size={12} />
                  : <div className="w-1.5 h-1.5 rounded-full bg-current" />
                }
              </div>

              {/* Card */}
              <div className={cn(
                'p-4 rounded-xl border transition-colors',
                schedule.status === 'overdue'
                  ? 'bg-destructive/5 border-destructive/20 group-hover:border-destructive/40'
                  : schedule.status === 'completed'
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-card border-border group-hover:border-primary/30'
              )}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground uppercase tracking-tight">
                        {schedule.vaccine_name}
                      </p>
                      <StatusBadge status={statusConfig.type} label={statusConfig.label} size="sm" />
                      {schedule.reschedule_note && (
                        <span className="text-xs bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded px-1.5 py-0.5 font-medium">
                          Rescheduled
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                      <span>DOL {schedule.target_age_days}</span>
                      {schedule.admin_method && <span>Method: {schedule.admin_method}</span>}
                      <span>
                        Scheduled: {new Date(schedule.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {schedule.completed_date && (
                        <span className="text-primary">
                          Done: {new Date(schedule.completed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {schedule.vaccine_brand_batch && (
                      <p className="text-xs text-muted-foreground mt-1">Batch: {schedule.vaccine_brand_batch}</p>
                    )}
                    {adminByName && (
                      <p className="text-xs text-muted-foreground mt-0.5">Administered by: {adminByName}</p>
                    )}
                    {schedule.reschedule_note && (
                      <p className="text-xs text-amber-600/80 mt-1 italic">
                        Reschedule note: {schedule.reschedule_note}
                      </p>
                    )}
                    {schedule.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{schedule.notes}</p>
                    )}
                  </div>

                  {/* Admin actions */}
                  {isAdmin && schedule.status !== 'completed' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRescheduleSchedule(schedule)}
                        className="h-7 text-xs"
                      >
                        <Icon name="CalendarIcon" size={12} className="mr-1" />
                        Reschedule
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setMarkDoneSchedule(schedule)}
                        className="h-7 text-xs"
                      >
                        <Icon name="CheckmarkIcon" size={12} className="mr-1" />
                        Mark Done
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MarkVaccineDoneSheet
        isOpen={!!markDoneSchedule}
        onClose={() => setMarkDoneSchedule(null)}
        schedule={markDoneSchedule}
        userId={userId}
        onSaved={onRefetch}
      />
      <RescheduleVaccineSheet
        isOpen={!!rescheduleSchedule}
        onClose={() => setRescheduleSchedule(null)}
        schedule={rescheduleSchedule}
        onSaved={onRefetch}
      />
    </>
  );
}
