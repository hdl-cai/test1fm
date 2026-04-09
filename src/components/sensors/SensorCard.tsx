import type { Sensor } from '@/types';
import { Card } from '@/components/ui/card';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';

interface SensorCardProps {
  sensor: Sensor;
}

function getSensorIcon(type: Sensor['type']) {
  switch (type) {
    case 'temperature':
      return 'TemperatureIcon' as const;
    case 'humidity':
      return 'WaterDropIcon' as const;
    default:
      return 'WindIcon' as const;
  }
}

function getReadingState(sensor: Sensor) {
  if (sensor.status === 'offline') return 'Offline';
  if (sensor.status === 'alert') return 'Critical';
  if (sensor.reading == null) return 'No Data';
  if (sensor.thresholdMin != null && sensor.reading < sensor.thresholdMin) return 'Warning';
  if (sensor.thresholdMax != null && sensor.reading > sensor.thresholdMax) return 'Warning';
  return 'Normal';
}

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export function SensorCard({ sensor }: SensorCardProps) {
  const readingState = getReadingState(sensor);
  const isStale =
    sensor.status !== 'offline' &&
    sensor.lastReading != null &&
    Date.now() - sensor.lastReading.getTime() > FIFTEEN_MINUTES_MS;

  return (
    <Card className="rounded-xl border border-border p-4 bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{sensor.location}</p>
          <p className="text-sm font-bold text-foreground mt-1">{sensor.nodeIdCode ?? sensor.id}</p>
          <p className="text-xs text-muted-foreground mt-1">{sensor.firmwareVersion}</p>
        </div>
        <div className="w-10 h-10 rounded-xl border border-border bg-muted/20 flex items-center justify-center text-primary">
          <Icon name={getSensorIcon(sensor.type)} size={18} />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Current Reading</p>
          <p className="text-2xl font-black text-foreground tabular-nums mt-1">
            {sensor.reading != null ? sensor.reading.toFixed(1) : '--'}
            <span className="text-sm ml-1 text-muted-foreground">{sensor.unit}</span>
          </p>
        </div>
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-bold uppercase border',
          sensor.status === 'offline'
            ? 'bg-muted/40 text-muted-foreground border-border/50'
            : isStale
            ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
            : sensor.status === 'alert'
            ? 'bg-destructive/10 text-destructive border-destructive/20'
            : readingState === 'Warning'
            ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
            : 'bg-primary/10 text-primary border-primary/20'
        )}>
          {isStale ? 'No Signal (15+ min)' : readingState}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-muted-foreground uppercase tracking-widest">Battery</p>
          <p className="font-bold text-foreground mt-1">{sensor.battery}%</p>
        </div>
        <div>
          <p className="text-muted-foreground uppercase tracking-widest">Last Reading</p>
          <p className="font-bold text-foreground mt-1">
            {sensor.lastReading ? sensor.lastReading.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </p>
        </div>
      </div>

      {sensor.alertMessage && (
        <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {sensor.alertMessage}
        </div>
      )}
    </Card>
  );
}