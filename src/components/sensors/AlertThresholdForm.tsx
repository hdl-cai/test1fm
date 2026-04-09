import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Sensor } from '@/types';
import type { Tables } from '@/types/supabase';

type AlertThresholdRow = Tables<'alert_thresholds'>;

interface AlertThresholdFormProps {
  metricType: Sensor['type'];
  threshold: AlertThresholdRow | null;
  onSave: (input: { metricType: Sensor['type']; minValue?: number | null; maxValue?: number | null }) => Promise<void>;
  isSaving?: boolean;
}

export function AlertThresholdForm({ metricType, threshold, onSave, isSaving }: AlertThresholdFormProps) {
  const [minValue, setMinValue] = React.useState(threshold?.min_value?.toString() ?? '');
  const [maxValue, setMaxValue] = React.useState(threshold?.max_value?.toString() ?? '');

  React.useEffect(() => {
    setMinValue(threshold?.min_value?.toString() ?? '');
    setMaxValue(threshold?.max_value?.toString() ?? '');
  }, [threshold]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{metricType}</p>
        <p className="text-sm text-muted-foreground mt-1">Farm-level alert thresholds for this metric.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Min</Label>
          <Input type="number" value={minValue} onChange={(event) => setMinValue(event.target.value)} placeholder="Optional" />
        </div>
        <div className="space-y-2">
          <Label>Max</Label>
          <Input type="number" value={maxValue} onChange={(event) => setMaxValue(event.target.value)} placeholder="Optional" />
        </div>
      </div>
      <Button
        size="sm"
        disabled={isSaving}
        onClick={() => onSave({
          metricType,
          minValue: minValue === '' ? null : Number(minValue),
          maxValue: maxValue === '' ? null : Number(maxValue),
        })}
      >
        Save Threshold
      </Button>
    </div>
  );
}