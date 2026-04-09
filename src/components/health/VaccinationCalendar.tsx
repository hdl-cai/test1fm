/**
 * VaccinationCalendar
 * Monthly calendar view showing vaccination events by date.
 * DOL markers per day; click event to see details.
 */

import * as React from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
  differenceInDays,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icon } from '@/hooks/useIcon';
import type { VaccinationScheduleWithProfile } from '@/lib/data-adapters';

interface VaccinationCalendarProps {
  schedules: VaccinationScheduleWithProfile[];
  cycleStartDate: Date | null;
  isAdmin?: boolean;
  onScheduleDrop?: (schedule: VaccinationScheduleWithProfile, newDate: string) => void;
}

const STATUS_COLORS = {
  completed: 'bg-primary text-primary-foreground',
  overdue: 'bg-destructive text-destructive-foreground',
  scheduled: 'bg-amber-500 text-white',
};

export function VaccinationCalendar({ schedules, cycleStartDate, isAdmin = false, onScheduleDrop }: VaccinationCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    // Start on the month of the first scheduled vaccination, or current month
    const firstSchedule = schedules.find(s => s.scheduled_date);
    return firstSchedule ? new Date(firstSchedule.scheduled_date) : new Date();
  });
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [dragScheduleId, setDragScheduleId] = React.useState<string | null>(null);
  const [dropTargetDate, setDropTargetDate] = React.useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const schedulesOnDate = (date: Date) =>
    schedules.filter(s => isSameDay(new Date(s.scheduled_date), date));

  const selectedSchedules = selectedDate ? schedulesOnDate(selectedDate) : [];

  const handleDrop = (date: Date) => {
    if (!dragScheduleId || !onScheduleDrop) return;
    const schedule = schedules.find((item) => item.id === dragScheduleId);
    const newDate = format(date, 'yyyy-MM-dd');

    setDropTargetDate(null);
    setDragScheduleId(null);

    if (!schedule || schedule.status === 'completed' || schedule.scheduled_date === newDate) {
      return;
    }

    setSelectedDate(date);
    onScheduleDrop(schedule, newDate);
  };

  const getDOL = (date: Date) => {
    if (!cycleStartDate) return null;
    const dol = differenceInDays(date, cycleStartDate) + 1;
    return dol > 0 ? dol : null;
  };

  return (
    <div className="space-y-4">
      {isAdmin && onScheduleDrop && (
        <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
          Open a scheduled date below, then drag a vaccine card onto another day to reschedule it. A reschedule note is still required before saving.
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(m => subMonths(m, 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Icon name="ArrowLeft01Icon" size={16} />
        </button>
        <h3 className="text-sm font-bold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(m => addMonths(m, 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Icon name="ArrowRight01Icon" size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {calDays.map((day) => {
          const daySchedules = schedulesOnDate(day);
          const dol = isSameMonth(day, currentMonth) ? getDOL(day) : null;
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const dayKey = format(day, 'yyyy-MM-dd');
          const isDropTarget = dropTargetDate === dayKey;

          return (
            <button
              key={day.toISOString()}
              onDragOver={(event) => {
                if (!isAdmin || !dragScheduleId || !onScheduleDrop) return;
                event.preventDefault();
                setDropTargetDate(dayKey);
              }}
              onDragLeave={() => {
                if (dropTargetDate === dayKey) {
                  setDropTargetDate(null);
                }
              }}
              onDrop={(event) => {
                if (!isAdmin || !dragScheduleId || !onScheduleDrop) return;
                event.preventDefault();
                handleDrop(day);
              }}
              onClick={() => {
                if (daySchedules.length > 0) {
                  setSelectedDate(isSelected ? null : day);
                }
              }}
              className={cn(
                'relative min-h-16 p-1.5 rounded-lg border text-left transition-colors',
                isSameMonth(day, currentMonth)
                  ? 'bg-card border-border'
                  : 'bg-transparent border-transparent',
                isToday && 'ring-1 ring-primary/50',
                isSelected && 'bg-primary/10 border-primary/40',
                daySchedules.length > 0 && 'cursor-pointer hover:bg-muted/50',
                isDropTarget && 'border-primary border-dashed bg-primary/10',
                !isSameMonth(day, currentMonth) && 'opacity-30'
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn(
                  'text-xs font-bold',
                  isToday ? 'text-primary' : 'text-foreground',
                  !isSameMonth(day, currentMonth) && 'text-muted-foreground'
                )}>
                  {format(day, 'd')}
                </span>
                {dol && isSameMonth(day, currentMonth) && (
                  <span className="text-[9px] font-bold text-muted-foreground">
                    D{dol}
                  </span>
                )}
              </div>

              {/* Vaccination dots */}
              <div className="mt-1 flex flex-wrap gap-0.5">
                {daySchedules.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      STATUS_COLORS[s.status as keyof typeof STATUS_COLORS] ?? STATUS_COLORS.scheduled
                    )}
                    title={s.vaccine_name}
                  />
                ))}
                {daySchedules.length > 3 && (
                  <span className="text-[8px] text-muted-foreground">+{daySchedules.length - 3}</span>
                )}
              </div>

              {/* First vaccine label on hover */}
              {daySchedules.length === 1 && (
                <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight line-clamp-1">
                  {daySchedules[0].vaccine_name}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground font-medium">Legend:</span>
        {Object.entries({ completed: 'Done', overdue: 'Overdue', scheduled: 'Scheduled' }).map(([status, label]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={cn('w-2 h-2 rounded-full', STATUS_COLORS[status as keyof typeof STATUS_COLORS])} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Selected date detail */}
      {selectedDate && selectedSchedules.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {format(selectedDate, 'EEEE, MMMM d')}
              {getDOL(selectedDate) && ` — DOL ${getDOL(selectedDate)}`}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(null)}
              className="h-6 w-6 p-0"
            >
              <Icon name="CancelIcon" size={12} />
            </Button>
          </div>
          {selectedSchedules.map((s) => (
            <div
              key={s.id}
              draggable={isAdmin && s.status !== 'completed' && Boolean(onScheduleDrop)}
              onDragStart={(event) => {
                if (!isAdmin || s.status === 'completed' || !onScheduleDrop) return;
                setDragScheduleId(s.id);
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', s.id);
              }}
              onDragEnd={() => {
                setDragScheduleId(null);
                setDropTargetDate(null);
              }}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg border border-transparent px-2 py-1.5',
                isAdmin && s.status !== 'completed' && onScheduleDrop && 'cursor-grab active:cursor-grabbing hover:border-primary/20 hover:bg-muted/20',
                dragScheduleId === s.id && 'opacity-50'
              )}
            >
              <div>
                <p className="text-sm font-bold text-foreground">{s.vaccine_name}</p>
                <p className="text-xs text-muted-foreground">{s.admin_method ?? 'Standard method'}</p>
                {s.vaccine_brand_batch && (
                  <p className="text-xs text-muted-foreground">Batch: {s.vaccine_brand_batch}</p>
                )}
                {isAdmin && s.status !== 'completed' && onScheduleDrop && (
                  <p className="text-[11px] text-primary mt-1">Drag onto another date to reschedule</p>
                )}
              </div>
              <span className={cn(
                'text-xs font-bold px-2 py-1 rounded-full',
                s.status === 'completed' ? 'bg-primary/10 text-primary' :
                s.status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                'bg-amber-500/10 text-amber-600'
              )}>
                {s.status === 'completed' ? 'Done' : s.status === 'overdue' ? 'Overdue' : 'Scheduled'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
