import * as React from 'react';
import { MetricCard } from '@/components/shared';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { VaccinationTimeline } from '@/components/health/VaccinationTimeline';
import { VaccinationCalendar } from '@/components/health/VaccinationCalendar';
import { HealthEventsTable } from '@/components/health/HealthEventsTable';
import { AddHealthEventSheet } from '@/components/health/AddHealthEventSheet';
import { RescheduleVaccineSheet } from '@/components/health/RescheduleVaccineSheet';
import type { HealthRecordWithVeterinarianRow, VaccinationScheduleWithProfile } from '@/lib/data-adapters';

type HealthSubTab = 'vaccination' | 'health-events';
type VaxView = 'timeline' | 'calendar';

interface HealthTabProps {
  healthRecords?: HealthRecordWithVeterinarianRow[];
  vaccinationSchedules?: VaccinationScheduleWithProfile[];
  cycleId: string;
  orgId: string;
  userId: string;
  userRole: string;
  cycleStartDate?: Date | null;
  onRefetch: () => void;
}

export function HealthTab({
  healthRecords = [],
  vaccinationSchedules = [],
  cycleId,
  orgId,
  userId,
  userRole,
  cycleStartDate,
  onRefetch,
}: HealthTabProps) {
  const [subTab, setSubTab] = React.useState<HealthSubTab>('vaccination');
  const [vaxView, setVaxView] = React.useState<VaxView>('timeline');
  const [isAddEventOpen, setIsAddEventOpen] = React.useState(false);
  const [calendarReschedule, setCalendarReschedule] = React.useState<{
    schedule: VaccinationScheduleWithProfile;
    newDate: string;
  } | null>(null);

  const isAdmin = ['owner', 'admin'].includes(userRole);

  const completedVax = vaccinationSchedules.filter(v => v.status === 'completed').length;
  const overdueVax = vaccinationSchedules.filter(v => v.status === 'overdue').length;
  const vaccinationCoverage = vaccinationSchedules.length > 0
    ? Math.round((completedVax / vaccinationSchedules.length) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Vaccination Progress"
          value={`${completedVax}/${vaccinationSchedules.length}`}
          subtitle="Doses administered"
          icon="ActivityIcon"
          iconColor="hsl(var(--primary))"
          variant="gauge"
          gaugeValue={vaccinationCoverage}
          statusBadge={
            overdueVax > 0
              ? { label: `${overdueVax} Overdue`, type: 'danger' }
              : completedVax === vaccinationSchedules.length && vaccinationSchedules.length > 0
              ? { label: 'Fully Vaccinated', type: 'success' }
              : { label: 'In Progress', type: 'warning' }
          }
        />
        <MetricCard
          title="Health Events"
          value={healthRecords.length.toString()}
          subtitle="Recorded this cycle"
          icon="MedicalFileIcon"
          iconColor="hsl(var(--danger))"
        />
        <MetricCard
          title="Last Health Event"
          value={
            healthRecords[0]
              ? new Date(healthRecords[0].record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'N/A'
          }
          subtitle="Most recent observation"
          icon="CalendarIcon"
          iconColor="hsl(var(--warning))"
        />
        <MetricCard
          title="Overdue Vaccines"
          value={overdueVax.toString()}
          subtitle="Need immediate attention"
          icon="AlertCircleIcon"
          iconColor={overdueVax > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'}
          statusBadge={overdueVax > 0 ? { label: 'Action Required', type: 'danger' } : undefined}
        />
      </div>

      {/* Sub-tab nav */}
      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl w-fit">
        {([
          { key: 'vaccination', label: 'Vaccination Schedule', icon: 'MedicineIcon' },
          { key: 'health-events', label: 'Health Events', icon: 'MedicalFileIcon' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all',
              subTab === tab.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon name={tab.icon} size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {subTab === 'vaccination' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {/* View toggle */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Immunization Schedule</h3>
              <p className="text-lg font-bold text-foreground">Vaccination Schedule</p>
            </div>
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg">
              <button
                onClick={() => setVaxView('timeline')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all',
                  vaxView === 'timeline' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon name="ListIcon" size={12} />
                Timeline
              </button>
              <button
                onClick={() => setVaxView('calendar')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all',
                  vaxView === 'calendar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon name="CalendarIcon" size={12} />
                Calendar
              </button>
            </div>
          </div>

          {vaxView === 'timeline' ? (
            <VaccinationTimeline
              schedules={vaccinationSchedules}
              cycleId={cycleId}
              userId={userId}
              isAdmin={isAdmin}
              onRefetch={onRefetch}
            />
          ) : (
            <VaccinationCalendar
              schedules={vaccinationSchedules}
              cycleStartDate={cycleStartDate ?? null}
              isAdmin={isAdmin}
              onScheduleDrop={(schedule, newDate) => setCalendarReschedule({ schedule, newDate })}
            />
          )}
        </div>
      )}

      {subTab === 'health-events' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Clinical Records</h3>
              <p className="text-lg font-bold text-foreground">Health Events Log</p>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsAddEventOpen(true)}>
                <Icon name="PlusSignIcon" size={14} className="mr-2" />
                Add Health Event
              </Button>
            )}
          </div>

          <HealthEventsTable
            records={healthRecords}
            onAddEvent={() => setIsAddEventOpen(true)}
            isAdmin={isAdmin}
          />
        </div>
      )}

      <AddHealthEventSheet
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        cycleId={cycleId}
        orgId={orgId}
        userId={userId}
        onSaved={onRefetch}
      />

      <RescheduleVaccineSheet
        isOpen={!!calendarReschedule}
        onClose={() => setCalendarReschedule(null)}
        schedule={calendarReschedule?.schedule ?? null}
        initialDate={calendarReschedule?.newDate}
        onSaved={onRefetch}
      />
    </div>
  );
}
