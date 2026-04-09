/**
 * MarkVaccineDoneSheet
 * Sheet form for marking a vaccination as administered.
 */

import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/hooks/useIcon';
import { toast } from 'sonner';
import { markVaccinationDone } from '@/lib/data/health';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import type { VaccinationScheduleWithProfile } from '@/lib/data-adapters';

interface MarkVaccineDoneSheetProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: VaccinationScheduleWithProfile | null;
  userId: string;
  onSaved: () => void;
}

export function MarkVaccineDoneSheet({
  isOpen,
  onClose,
  schedule,
  userId,
  onSaved,
}: MarkVaccineDoneSheetProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = React.useState({
    completedDate: new Date().toISOString().split('T')[0],
    vaccineBrandBatch: '',
    notes: '',
    administeredBy: userId,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [orgMembers, setOrgMembers] = React.useState<{ id: string; name: string }[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        completedDate: new Date().toISOString().split('T')[0],
        vaccineBrandBatch: '',
        notes: '',
        administeredBy: userId,
      });
    }
  }, [isOpen, userId]);

  React.useEffect(() => {
    if (!isOpen || !user?.orgId) return;
    supabase
      .from('org_members')
      .select('user_id, profiles(first_name, last_name)')
      .eq('org_id', user.orgId)
      .eq('status', 'active')
      .then(({ data }) => {
        if (!data) return;
        setOrgMembers(
          data.map((m: any) => ({
            id: m.user_id as string,
            name: `${(m.profiles as any)?.first_name ?? ''} ${(m.profiles as any)?.last_name ?? ''}`.trim() || m.user_id,
          }))
        );
      });
  }, [isOpen, user?.orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule) return;

    setIsSubmitting(true);
    try {
      await markVaccinationDone({
        scheduleId: schedule.id,
        completedDate: formData.completedDate,
        vaccineBrandBatch: formData.vaccineBrandBatch || undefined,
        notes: formData.notes || undefined,
        verifiedByTechId: formData.administeredBy || undefined,
      });
      toast.success(`${schedule.vaccine_name} marked as administered.`);
      onSaved();
      onClose();
    } catch {
      toast.error('Failed to mark vaccination as done. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!schedule) return null;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Vaccination Done"
      description={`${schedule.vaccine_name} — DOL ${schedule.target_age_days}`}
      width="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6 py-2">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Vaccine</p>
          <p className="text-sm font-bold text-foreground">{schedule.vaccine_name}</p>
          {schedule.admin_method && (
            <p className="text-xs text-muted-foreground mt-0.5">Method: {schedule.admin_method}</p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            Scheduled: {new Date(schedule.scheduled_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Date Administered <span className="text-destructive">*</span>
          </Label>
          <Input
            type="date"
            value={formData.completedDate}
            onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Vaccine Brand / Batch No.
          </Label>
          <Input
            placeholder="e.g. INNOVAX-ND B23041"
            value={formData.vaccineBrandBatch}
            onChange={(e) => setFormData({ ...formData, vaccineBrandBatch: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Administered By
          </Label>
          <select
            value={formData.administeredBy}
            onChange={(e) => setFormData({ ...formData, administeredBy: e.target.value })}
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
          >
            {orgMembers.length === 0 ? (
              <option value={userId}>{userId}</option>
            ) : (
              orgMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Notes</Label>
          <Textarea
            placeholder="Any observations or notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="resize-none min-h-[80px]"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Icon name="CycleIcon" size={16} className="animate-spin mr-2" />
            ) : (
              <Icon name="CheckmarkBadge01Icon" size={16} className="mr-2" />
            )}
            Confirm Administration
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
