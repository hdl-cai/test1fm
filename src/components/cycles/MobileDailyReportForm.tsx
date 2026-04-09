/**
 * MobileDailyReportForm — simplified daily log submission form for mobile/PWA.
 *
 * Offline-aware: when navigator.onLine is false, the form data is enqueued to
 * IndexedDB via the offline-queue utility and submitted automatically when the
 * connection is restored.
 *
 * Usage:
 *   Rendered inline on a cycle detail page or inside a modal/sheet on mobile.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/hooks/useIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addDailyLogRecord } from '@/lib/data/cycles';
import { enqueueAction } from '@/lib/offline-queue';
import { getErrorMessage } from '@/lib/data/errors';
import { toast } from 'sonner';

interface MobileDailyReportFormProps {
  cycleId: string;
  orgId: string;
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormState {
  feedUsedKg: string;
  mortalityCount: string;
  culledCount: string;
  avgTempC: string;
  avgHumidityPct: string;
}

const INITIAL_FORM: FormState = {
  feedUsedKg: '',
  mortalityCount: '',
  culledCount: '',
  avgTempC: '',
  avgHumidityPct: '',
};

export function MobileDailyReportForm({
  cycleId,
  orgId,
  userId,
  onSuccess,
  onCancel,
}: MobileDailyReportFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.feedUsedKg) {
      toast.error('Feed used is required.');
      return;
    }

    const payload = {
      orgId,
      userId,
      cycleId,
      logDate: today,
      feedUsedKg: parseFloat(form.feedUsedKg),
      mortalityCount: parseInt(form.mortalityCount) || 0,
      culledCount: parseInt(form.culledCount) || 0,
      avgTempC: form.avgTempC ? parseFloat(form.avgTempC) : null,
      avgHumidityPct: form.avgHumidityPct ? parseFloat(form.avgHumidityPct) : null,
    };

    setIsSubmitting(true);
    try {
      if (!navigator.onLine) {
        // Queue for deferred submission
        await enqueueAction('daily_report', payload as Record<string, unknown>);
        toast.success("Report queued — it'll sync when you're back online.");
        setForm(INITIAL_FORM);
        onSuccess?.();
        return;
      }

      await addDailyLogRecord(payload);
      toast.success('Daily report submitted.');
      setForm(INITIAL_FORM);
      onSuccess?.();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to submit report.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-1">
      {/* Offline indicator */}
      {typeof navigator !== 'undefined' && !navigator.onLine && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
          <Icon name="WifiError01Icon" size={14} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            You&apos;re offline — this report will be queued and submitted when your connection is restored.
          </p>
        </div>
      )}

      {/* Date */}
      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Report Date</span>
        <span className="text-sm font-medium text-foreground">
          {new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Required Fields */}
      <div className="space-y-1.5">
        <Label htmlFor="feedUsedKg" className="text-sm font-medium">
          Feed Used (kg) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="feedUsedKg"
          type="number"
          inputMode="decimal"
          placeholder="e.g. 120.5"
          value={form.feedUsedKg}
          onChange={handleChange('feedUsedKg')}
          className="h-12 text-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="mortalityCount" className="text-sm font-medium">
            Mortality
          </Label>
          <Input
            id="mortalityCount"
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={form.mortalityCount}
            onChange={handleChange('mortalityCount')}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="culledCount" className="text-sm font-medium">
            Culled
          </Label>
          <Input
            id="culledCount"
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={form.culledCount}
            onChange={handleChange('culledCount')}
            className="h-12 text-base"
          />
        </div>
      </div>

      {/* Optional Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="avgTempC" className="text-sm font-medium">
            Avg Temp (°C)
          </Label>
          <Input
            id="avgTempC"
            type="number"
            inputMode="decimal"
            placeholder="e.g. 28"
            value={form.avgTempC}
            onChange={handleChange('avgTempC')}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="avgHumidityPct" className="text-sm font-medium">
            Avg Humidity (%)
          </Label>
          <Input
            id="avgHumidityPct"
            type="number"
            inputMode="decimal"
            placeholder="e.g. 70"
            value={form.avgHumidityPct}
            onChange={handleChange('avgHumidityPct')}
            className="h-12 text-base"
          />
        </div>
      </div>

      {/* Actions */}
      <div className={cn('flex gap-3 pt-1', onCancel ? 'flex-row' : 'flex-col')}>
        {onCancel && (
          <Button variant="outline" className="flex-1 h-12" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button
          className="flex-1 h-12 text-base font-semibold"
          onClick={handleSubmit}
          disabled={isSubmitting || !form.feedUsedKg}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Icon name="Loading03Icon" size={16} className="animate-spin" />
              Submitting…
            </span>
          ) : navigator.onLine ? (
            'Submit Report'
          ) : (
            'Queue Report'
          )}
        </Button>
      </div>
    </div>
  );
}
