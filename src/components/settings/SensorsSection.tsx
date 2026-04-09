import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFarmsStore } from '@/stores/useFarmsStore';
import { useSensorsStore } from '@/stores/useSensorsStore';
import { Icon } from '@/hooks/useIcon';
import { toast } from 'sonner';

export function SensorsSection() {
  const { user } = useAuthStore();
  const { farms, fetchFarms } = useFarmsStore();
  const { toggleFarmSensors } = useSensorsStore();
  const [loadingFarmId, setLoadingFarmId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.orgId) {
      fetchFarms(user.orgId);
    }
  }, [user?.orgId, fetchFarms]);

  async function handleToggle(farmId: string, currentEnabled: boolean) {
    setLoadingFarmId(farmId);
    try {
      await toggleFarmSensors(farmId, !currentEnabled);
      await fetchFarms(user!.orgId!);
      toast.success(`Sensor monitoring ${!currentEnabled ? 'enabled' : 'disabled'} for farm.`);
    } catch {
      toast.error('Failed to update sensor status. Please try again.');
    } finally {
      setLoadingFarmId(null);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">IoT Sensor Configuration</h2>
        <p className="text-muted-foreground text-sm">
          Enable or disable sensor monitoring per farm. Sensor data ingestion and alert thresholds are configured per-farm once sensors are deployed.
        </p>
      </div>

      {/* Phase notice */}
      <div className="flex items-start gap-4 p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-amber-800 dark:text-amber-300">
        <Icon name="SensorIcon" size={20} className="mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold text-sm">IoT Sensors — Phase 2D Feature</p>
          <p className="text-xs leading-relaxed">
            Detailed sensor node registration and alert threshold configuration will be available in a future update.
            Use the toggles below to enable or disable sensor data ingestion per farm.
          </p>
        </div>
      </div>

      {/* Farm list with sensor toggle stubs */}
      <div className="p-6 bg-muted/20 border border-border/50 rounded-3xl space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="SensorIcon" size={20} className="text-primary" />
          <h3 className="font-bold">Farms</h3>
        </div>

        {farms.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground italic text-sm">
            No farms registered for this organization.
          </div>
        ) : (
          <div className="space-y-2">
            {farms.map((farm) => (
              <div
                key={farm.id}
                className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/40 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon name="FarmIcon" size={16} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{farm.name}</span>
                    {farm.region && (
                      <span className="text-[10px] text-muted-foreground">{farm.region}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {loadingFarmId === farm.id ? (
                    <span className="text-[10px] text-muted-foreground italic">Updating…</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic">
                      {farm.sensorsEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!farm.sensorsEnabled}
                    disabled={loadingFarmId === farm.id}
                    onClick={() => handleToggle(farm.id, !!farm.sensorsEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      farm.sensorsEnabled ? 'bg-primary' : 'bg-muted'
                    } ${loadingFarmId === farm.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                        farm.sensorsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-6 bg-muted/20 border border-border/50 rounded-3xl space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <Icon name="RouterIcon" size={20} className="text-muted-foreground" />
          <h3 className="font-bold text-muted-foreground">How Sensors Work</h3>
        </div>
        <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
          <li>Each farm can have one or more sensor nodes reporting via HTTP push.</li>
          <li>Supported sensor types: Temperature, Humidity, CO₂, Ammonia, Water Level.</li>
          <li>Alerts fire when readings cross the thresholds configured in Org Settings → General (heat stress temperatures).</li>
          <li>Alert threshold fine-tuning per sensor type is available from the Farm Detail page once sensors are enabled.</li>
          <li>Raw readings are aggregated daily; 90+ day old raw data is archived to hourly summaries.</li>
        </ul>
      </div>
    </div>
  );
}
