import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Sensor } from '@/types';
import type { Tables } from '@/types/supabase';
import { AlertThresholdForm } from './AlertThresholdForm';

type AlertThresholdRow = Tables<'alert_thresholds'>;

interface FarmSensorSettingsProps {
  isEnabled: boolean;
  sensors: Sensor[];
  thresholds: AlertThresholdRow[];
  isSaving?: boolean;
  onToggleEnabled: (enabled: boolean) => Promise<void>;
  onSaveThreshold: (input: { metricType: Sensor['type']; minValue?: number | null; maxValue?: number | null }) => Promise<void>;
  onAddSensor: (input: { metricType: Sensor['type']; locationTag: string; deviceModel?: string | null }) => Promise<void>;
  onDeactivateSensor: (nodeId: string) => Promise<void>;
}

export function FarmSensorSettings({
  isEnabled,
  sensors,
  thresholds,
  isSaving,
  onToggleEnabled,
  onSaveThreshold,
  onAddSensor,
  onDeactivateSensor,
}: FarmSensorSettingsProps) {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [metricType, setMetricType] = React.useState<Sensor['type']>('temperature');
  const [locationTag, setLocationTag] = React.useState('');
  const [deviceModel, setDeviceModel] = React.useState('');

  const uniqueSensors = React.useMemo(() => {
    const seen = new Set<string>();
    return sensors.filter((sensor) => {
      if (!sensor.nodeId || seen.has(sensor.nodeId)) return false;
      seen.add(sensor.nodeId);
      return true;
    });
  }, [sensors]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sensor Enablement</p>
          <p className="text-sm text-muted-foreground mt-1">Controls whether this farm exposes live environment monitoring and alerts.</p>
        </div>
        <Button variant={isEnabled ? 'outline' : 'default'} onClick={() => onToggleEnabled(!isEnabled)} disabled={isSaving}>
          {isEnabled ? 'Disable Sensors' : 'Enable Sensors'}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Registered Sensor Nodes</p>
            <p className="text-sm text-muted-foreground mt-1">Each v2 node currently tracks a single metric type.</p>
          </div>
          <Button size="sm" onClick={() => setIsSheetOpen(true)} disabled={!isEnabled}>Add Sensor</Button>
        </div>

        <div className="space-y-2">
          {uniqueSensors.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No sensor nodes registered for this farm yet.
            </div>
          ) : (
            uniqueSensors.map((sensor) => (
              <div key={sensor.nodeId} className="rounded-lg border border-border px-4 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">{sensor.nodeIdCode ?? sensor.id}</p>
                  <p className="text-xs text-muted-foreground mt-1">{sensor.location} • {sensor.type} • {sensor.battery}% battery</p>
                </div>
                <Button size="sm" variant="outline" disabled={isSaving || !sensor.nodeId} onClick={() => sensor.nodeId && onDeactivateSensor(sensor.nodeId)}>
                  Deactivate
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {(['temperature', 'humidity', 'ammonia'] as Sensor['type'][]).map((type) => (
          <AlertThresholdForm
            key={type}
            metricType={type}
            threshold={thresholds.find((item) => item.metric_type === type) ?? null}
            onSave={onSaveThreshold}
            isSaving={isSaving}
          />
        ))}
      </div>

      <Sheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="Add Sensor" description="Register a new sensor node for this farm" width="md">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await onAddSensor({ metricType, locationTag, deviceModel: deviceModel || null });
            setLocationTag('');
            setDeviceModel('');
            setMetricType('temperature');
            setIsSheetOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Metric Type</Label>
            <select value={metricType} onChange={(event) => setMetricType(event.target.value as Sensor['type'])} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground">
              <option value="temperature">Temperature</option>
              <option value="humidity">Humidity</option>
              <option value="ammonia">Ammonia</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Location Description</Label>
            <Input value={locationTag} onChange={(event) => setLocationTag(event.target.value)} placeholder="House A - Center" required />
          </div>
          <div className="space-y-2">
            <Label>Device Model</Label>
            <Input value={deviceModel} onChange={(event) => setDeviceModel(event.target.value)} placeholder="Optional device model" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>Add Sensor</Button>
          </div>
        </form>
      </Sheet>
    </div>
  );
}