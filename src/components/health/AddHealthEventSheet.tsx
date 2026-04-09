/**
 * AddHealthEventSheet
 * Sheet form for adding a health event to a cycle.
 */

import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/hooks/useIcon';
import { toast } from 'sonner';
import { addHealthRecord } from '@/lib/data/health';
import { cn } from '@/lib/utils';

const RECORD_TYPES = [
  { value: 'vaccination', label: 'Vaccination', icon: 'MedicineIcon' },
  { value: 'treatment', label: 'Treatment', icon: 'FirstAidKitIcon' },
  { value: 'inspection', label: 'Inspection', icon: 'SearchIcon' },
  { value: 'disease_observation', label: 'Disease Obs.', icon: 'AlertCircleIcon' },
  { value: 'vet_visit', label: 'Vet Visit', icon: 'FirstAidKitIcon' },
  { value: 'other', label: 'Other', icon: 'ClipboardIcon' },
] as const;

const OUTCOMES = [
  { value: 'resolved', label: 'Resolved', color: 'text-primary' },
  { value: 'ongoing', label: 'Ongoing', color: 'text-amber-500' },
  { value: 'escalated', label: 'Escalated', color: 'text-destructive' },
] as const;

interface AddHealthEventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cycleId: string;
  orgId: string;
  userId: string;
  onSaved: () => void;
}

export function AddHealthEventSheet({
  isOpen,
  onClose,
  cycleId,
  orgId,
  userId,
  onSaved,
}: AddHealthEventSheetProps) {
  const [formData, setFormData] = React.useState({
    recordType: 'inspection' as string,
    recordDate: new Date().toISOString().split('T')[0],
    subject: '',
    notes: '',
    medicationName: '',
    dosage: '',
    birdsAffected: '',
    outcome: '' as '' | 'resolved' | 'ongoing' | 'escalated',
    isGahpCompliant: false,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        recordType: 'inspection',
        recordDate: new Date().toISOString().split('T')[0],
        subject: '',
        notes: '',
        medicationName: '',
        dosage: '',
        birdsAffected: '',
        outcome: '',
        isGahpCompliant: false,
      });
    }
  }, [isOpen]);

  const needsMedication = ['treatment', 'disease_observation'].includes(formData.recordType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim()) return;

    setIsSubmitting(true);
    try {
      await addHealthRecord({
        cycleId,
        orgId,
        userId,
        recordDate: formData.recordDate,
        recordType: formData.recordType,
        subject: formData.subject.trim(),
        notes: formData.notes || undefined,
        medicationName: formData.medicationName || undefined,
        dosage: formData.dosage || undefined,
        birdsAffected: formData.birdsAffected ? parseInt(formData.birdsAffected) : undefined,
        outcome: formData.outcome || undefined,
        isGahpCompliant: formData.isGahpCompliant,
      });
      toast.success('Health event recorded.');
      onSaved();
      onClose();
    } catch {
      toast.error('Failed to save health event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Add Health Event"
      description="Record a health observation, treatment, or inspection"
      width="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 py-2">
        {/* Event Type */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Event Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {RECORD_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, recordType: type.value })}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-colors',
                  formData.recordType === type.value
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/20'
                )}
              >
              <Icon name={type.icon as Parameters<typeof Icon>[0]['name']} size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Date */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Event Date <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              value={formData.recordDate}
              onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
              required
            />
          </div>

          {/* Birds Affected */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Birds Affected</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={formData.birdsAffected}
              onChange={(e) => setFormData({ ...formData, birdsAffected: e.target.value })}
            />
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Subject / Activity <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="e.g. Day 14 IBD Vaccination, Suspected Newcastle, Routine GAHP inspection"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
        </div>

        {/* Medication fields — shown for treatment / disease_observation */}
        {needsMedication && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Medication Name</Label>
              <Input
                placeholder="e.g. Enrofloxacin"
                value={formData.medicationName}
                onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Dosage</Label>
              <Input
                placeholder="e.g. 10mg/kg for 3 days"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Outcome */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Outcome</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, outcome: '' })}
              className={cn(
                'flex-1 py-2 rounded-lg border text-xs font-bold transition-colors',
                !formData.outcome ? 'bg-muted border-primary/40' : 'bg-card border-border text-muted-foreground hover:border-muted-foreground/30'
              )}
            >
              N/A
            </button>
            {OUTCOMES.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setFormData({ ...formData, outcome: o.value })}
                className={cn(
                  'flex-1 py-2 rounded-lg border text-xs font-bold transition-colors',
                  formData.outcome === o.value
                    ? `bg-card border-primary/40 ${o.color}`
                    : 'bg-card border-border text-muted-foreground hover:border-muted-foreground/30'
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Notes</Label>
          <Textarea
            placeholder="Detailed observations, follow-up actions, etc."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="resize-none min-h-[80px]"
          />
        </div>

        {/* GAHP toggle */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.isGahpCompliant}
            onChange={(e) => setFormData({ ...formData, isGahpCompliant: e.target.checked })}
            className="w-4 h-4 rounded border-border accent-primary"
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            GAHP Compliant
          </span>
        </label>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || !formData.subject.trim()}>
            {isSubmitting ? (
              <Icon name="CycleIcon" size={16} className="animate-spin mr-2" />
            ) : (
              <Icon name="PlusSignIcon" size={16} className="mr-2" />
            )}
            Save Event
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
