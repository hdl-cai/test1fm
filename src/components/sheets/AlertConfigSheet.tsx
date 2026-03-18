/**
 * AlertConfigSheet Component
 * 
 * Sheet for configuring sensor alert thresholds.
 * Allows setting min/max thresholds for temperature, humidity, and ammonia.
 */

import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon, type IconName } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';

interface AlertConfigSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AlertThreshold {
  min: number;
  max: number;
  enabled: boolean;
}

const defaultThresholds: Record<string, AlertThreshold> = {
  temperature: { min: 20, max: 30, enabled: true },
  humidity: { min: 50, max: 80, enabled: true },
  ammonia: { min: 0, max: 25, enabled: true },
};

export function AlertConfigSheet({ isOpen, onClose }: AlertConfigSheetProps) {
  const [thresholds, setThresholds] = React.useState<Record<string, AlertThreshold>>(defaultThresholds);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    onClose();
  };

  const handleCancel = () => {
    setThresholds(defaultThresholds);
    onClose();
  };

  const updateThreshold = (type: string, field: 'min' | 'max' | 'enabled', value: number | boolean) => {
    setThresholds((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const getTypeInfo = (type: string): { label: string; icon: IconName; unit: string; color: string; bg: string } => {
    switch (type) {
      case 'temperature':
        return { label: 'Temperature', icon: 'TemperatureIcon', unit: '°C', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' };
      case 'humidity':
        return { label: 'Humidity', icon: 'WaterDropIcon', unit: '%', color: 'text-[#1DB954]', bg: 'bg-[#1DB954]/10' };
      case 'ammonia':
        return { label: 'Ammonia', icon: 'WindIcon', unit: 'ppm', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' };
      default:
        return { label: type, icon: 'SensorIcon', unit: '', color: 'text-white', bg: 'bg-gray-500/10' };
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleCancel}
      title="Environmental Alerts"
      description="Configure alert limits for sensor monitoring"
      width="lg"
    >
      <div className="p-6 space-y-6 bg-surface-dark min-h-full">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-2">
          <p className="text-xs text-text-dim leading-relaxed">
            <span className="text-primary font-bold">ALERT SETTINGS:</span> Set the high and low limits for your sensors. The system will send alerts when sensor data goes outside these limits.
          </p>
        </div>

        {/* Threshold Modules */}
        <div className="space-y-4">
          {Object.entries(thresholds).map(([type, threshold]) => {
            const info = getTypeInfo(type);
            return (
              <div
                key={type}
                className={cn(
                  "border rounded-xl p-5 transition-colors duration-300",
                  threshold.enabled ? "bg-[#1A1C1B] border-border-dark shadow-lg" : "bg-black/20 border-border-dark/50 opacity-60"
                )}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center border transition-[width] transition-[height]',
                      threshold.enabled ? info.bg + " " + info.color.replace('text-', 'border-').replace(']', ']/30') : "bg-white/5 border-white/10 text-text-dim"
                    )}>
                      <Icon name={info.icon} size={24} className={threshold.enabled ? info.color : "text-text-dim"} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight">{info.label} Settings</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn("text-micro font-bold uppercase tracking-widest", threshold.enabled ? "text-primary" : "text-text-dim")}>
                          {threshold.enabled ? "ACTIVE" : "DISABLED"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateThreshold(type, 'enabled', !threshold.enabled)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-[width] transition-[height] duration-300',
                      threshold.enabled ? 'bg-primary shadow-[0_0_10px_rgba(54,226,120,0.3)]' : 'bg-[#27272A]'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-colors transition-[width] transition-[height] duration-300',
                        threshold.enabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor={`${type}-min`} className="text-micro font-bold text-text-dim uppercase tracking-widest">
                      Lower Limit ({info.unit})
                    </Label>
                    <div className="relative">
                      <Input
                        id={`${type}-min`}
                        type="number"
                        value={threshold.min}
                        onChange={(e) => updateThreshold(type, 'min', parseFloat(e.target.value) || 0)}
                        disabled={!threshold.enabled}
                        className="h-11 bg-black/40 border-border-dark text-white font-bold text-lg tabular-nums focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors transition-[height] rounded-lg"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-micro font-bold text-text-dim/40 uppercase">MIN</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${type}-max`} className="text-micro font-bold text-text-dim uppercase tracking-widest">
                      Upper Limit ({info.unit})
                    </Label>
                    <div className="relative">
                      <Input
                        id={`${type}-max`}
                        type="number"
                        value={threshold.max}
                        onChange={(e) => updateThreshold(type, 'max', parseFloat(e.target.value) || 0)}
                        disabled={!threshold.enabled}
                        className="h-11 bg-black/40 border-border-dark text-white font-bold text-lg tabular-nums focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors transition-[height] rounded-lg"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-micro font-bold text-text-dim/40 uppercase">MAX</div>
                    </div>
                  </div>
                </div>

                {/* Range Visualizer */}
                <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                  <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "absolute h-full transition-[height] duration-500 rounded-full",
                        threshold.enabled ? "bg-primary shadow-[0_0_8px_rgba(54,226,120,0.5)]" : "bg-text-dim/30"
                      )}
                      style={{
                        left: `${(threshold.min / (threshold.max * 1.5)) * 100}%`,
                        width: `${((threshold.max - threshold.min) / (threshold.max * 1.5)) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-micro font-bold text-text-dim/40 tabular-nums">0.0</span>
                    <span className="text-micro font-bold text-primary/60 uppercase tracking-widest">Safe Operating Range</span>
                    <span className="text-micro font-bold text-text-dim/40 tabular-nums">{(threshold.max * 1.5).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notification Settings */}
        <div className="bg-[#1A1C1B] border border-border-dark rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Icon name="Notification01Icon" size={18} className="text-primary" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-tight">Notification Settings</h4>
          </div>

          <div className="space-y-4">
            {[
              { id: 'push', label: 'Push Notifications', icon: 'SettingsIcon', desc: 'Instant desktop & mobile alerts' },
              { id: 'email', label: 'Email Notifications', icon: 'MailIcon', desc: 'Detailed alert reports' },
              { id: 'sms', label: 'SMS Alerts', icon: 'MessageIcon', desc: 'Critical priority notifications' },
            ].map((method) => (
              <label key={method.id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-text-dim group-hover:text-primary transition-colors">
                    <Icon name={method.icon as IconName} size={18} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-text-light group-hover:text-white transition-colors">{method.label}</span>
                    <p className="text-micro text-text-dim/60 mt-0.5">{method.desc}</p>
                  </div>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={method.id !== 'sms'}
                    className="appearance-none w-6 h-6 rounded-lg bg-black/40 border border-border-dark checked:bg-primary checked:border-primary transition-colors transition-[width] transition-[height] cursor-pointer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-[&:has(:checked)]:opacity-100">
                    <Icon name="CheckmarkIcon" size={12} className="text-black font-bold" />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Command Actions */}
        <div className="pt-8 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="h-12 px-6 text-sm font-bold text-text-dim hover:text-white hover:bg-white/5 transition-colors transition-[height]"
          >
            DISCARD
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-12 px-10 bg-primary hover:bg-primary-dark text-black font-bold text-sm rounded-lg transition-colors transition-opacity transition-shadow transition-[width] transition-[height] shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Icon name="CycleIcon" size={16} className="mr-2 animate-spin" />
                UPDATING...
              </>
            ) : (
              <>
                <Icon name="Save01Icon" size={16} className="mr-2" />
                SAVE SETTINGS
              </>
            )}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

export default AlertConfigSheet;
