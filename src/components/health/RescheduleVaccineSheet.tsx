/**
 * RescheduleVaccineSheet
 * Sheet form for rescheduling a vaccination with mandatory reason note.
 */

import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/hooks/useIcon';
import { toast } from 'sonner';
import { rescheduleVaccination } from '@/lib/data/health';
import type { VaccinationScheduleWithProfile } from '@/lib/data-adapters';

interface RescheduleVaccineSheetProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: VaccinationScheduleWithProfile | null;
  initialDate?: string;
  onSaved: () => void;
}

export function RescheduleVaccineSheet({
  isOpen,
  onClose,
  schedule,
  initialDate,
  onSaved,
}: RescheduleVaccineSheetProps) {
  const [formData, setFormData] = React.useState({
    newDate: '',
    rescheduleNote: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && schedule) {
      setFormData({
        newDate: initialDate ?? schedule.scheduled_date,
        rescheduleNote: '',
      });
    }
  }, [initialDate, isOpen, schedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule || !formData.rescheduleNote.trim()) return;

    setIsSubmitting(true);
    try {
      await rescheduleVaccination({
        scheduleId: schedule.id,
        newDate: formData.newDate,
        rescheduleNote: formData.rescheduleNote.trim(),
      });
      toast.success(`${schedule.vaccine_name} rescheduled.`);
      onSaved();
      onClose();
    } catch {
      toast.error('Failed to reschedule vaccination. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!schedule) return null;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Vaccination"
      description={`${schedule.vaccine_name} — currently scheduled ${new Date(schedule.scheduled_date).toLocaleDateString()}`}
      width="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6 py-2">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            New Date <span className="text-destructive">*</span>
          </Label>
          <Input
            type="date"
            value={formData.newDate}
            onChange={(e) => setFormData({ ...formData, newDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Reason for Rescheduling <span className="text-destructive">*</span>
          </Label>
          <Textarea
            placeholder="Required — explain why this vaccination is being rescheduled..."
            value={formData.rescheduleNote}
            onChange={(e) => setFormData({ ...formData, rescheduleNote: e.target.value })}
            className="resize-none min-h-25"
            required
          />
          <p className="text-xs text-muted-foreground">This note will be logged for compliance records.</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !formData.rescheduleNote.trim()}
            variant="outline"
          >
            {isSubmitting ? (
              <Icon name="CycleIcon" size={16} className="animate-spin mr-2" />
            ) : (
              <Icon name="CalendarIcon" size={16} className="mr-2" />
            )}
            Confirm Reschedule
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
