import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Farm } from '@/types';
import { useSensorsStore } from '@/stores/useSensorsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Icon } from '@/hooks/useIcon';

interface GlobalSensorSummaryProps {
  farms: Farm[];
}

export function GlobalSensorSummary({ farms }: GlobalSensorSummaryProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { summary, sensors, fetchSensors, fetchSummary, isLoading } = useSensorsStore();

  React.useEffect(() => {
    if (user?.orgId && farms.length > 0) {
      void fetchSensors(user.orgId);
      void fetchSummary(user.orgId, farms.map((farm) => ({ id: farm.id, name: farm.name })));
    }
  }, [fetchSensors, fetchSummary, farms, user?.orgId]);

  return (
    <Card className="bg-card border-border rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Global Sensor Summary</h3>
          <p className="text-sm text-muted-foreground mt-1">Current visibility across all farms with sensor activity.</p>
        </div>
        <div className="w-10 h-10 rounded-xl border border-border bg-muted/20 flex items-center justify-center text-primary">
          <Icon name="SensorIcon" size={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-muted/10 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Farms With Sensors</p>
          <p className="text-2xl font-black text-foreground mt-2">{summary?.farmsWithActiveSensors ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/10 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Farms With Alerts</p>
          <p className="text-2xl font-black text-foreground mt-2">{summary?.farmsWithAlerts ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/10 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Sensor Metrics</p>
          <p className="text-2xl font-black text-foreground mt-2">{sensors.filter((sensor) => sensor.isActive !== false).length}</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Warning / Critical Farms</p>
        {!summary?.farmsInAlertState.length && !isLoading ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No farms are currently in a warning or critical sensor state.
          </div>
        ) : (
          <div className="space-y-2">
            {(summary?.farmsInAlertState ?? []).map((farm) => (
              <div key={farm.farmId} className="rounded-lg border border-border px-4 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-foreground">{farm.farmName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{farm.alertCount} active sensor alert{farm.alertCount === 1 ? '' : 's'}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate(`/farms/${farm.farmId}?tab=environment`)}>
                  Open Environment
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}