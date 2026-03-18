/**
 * AddSensorSheet Component
 * 
 * Sheet for adding a new sensor to the system.
 * Includes form fields for sensor ID, location, type, and farm assignment.
 */

import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/hooks/useIcon';
import { useSensorsStore } from '@/stores/useSensorsStore';
import { useFarmsStore } from '@/stores/useFarmsStore';
import { cn } from '@/lib/utils';
import type { Sensor } from '@/types';

interface AddSensorSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

import type { IconName } from '@/hooks/useIcon';

const SENSOR_TYPES: { value: Sensor['type']; label: string; unit: string; icon: IconName }[] = [
  { value: 'temperature', label: 'Temperature', unit: '°C', icon: 'TemperatureIcon' },
  { value: 'humidity', label: 'Humidity', unit: '%', icon: 'WaterDropIcon' },
  { value: 'ammonia', label: 'Ammonia', unit: 'ppm', icon: 'WindIcon' },
];

const getNextSensorId = () => {
  const existingIds = useSensorsStore.getState().sensors.map((s) => s.id);
  let counter = 1;
  while (existingIds.includes(`sen-${String(counter).padStart(3, '0')}`)) {
    counter++;
  }
  return `sen-${String(counter).padStart(3, '0')}`;
};

export function AddSensorSheet({ isOpen, onClose }: AddSensorSheetProps) {
  const addSensor = useSensorsStore((state) => state.addSensor);
  const farms = useFarmsStore((state) => state.farms);

  const [formData, setFormData] = React.useState({
    sensorId: '',
    farmId: '',
    location: '',
    type: 'temperature' as Sensor['type'],
    firmwareVersion: '2.1.0',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && !formData.sensorId) {
      setFormData((prev) => ({ ...prev, sensorId: getNextSensorId() }));
    }
  }, [isOpen, formData.sensorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sensorId || !formData.farmId || !formData.location) {
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const selectedType = SENSOR_TYPES.find((t) => t.value === formData.type);

    addSensor({
      ...formData,
      reading: null,
      unit: selectedType?.unit || '',
      battery: 100,
      status: 'offline',
    });

    setFormData({
      sensorId: getNextSensorId(),
      farmId: '',
      location: '',
      type: 'temperature',
      firmwareVersion: '2.1.0',
    });

    setIsSubmitting(false);
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      sensorId: '',
      farmId: '',
      location: '',
      type: 'temperature',
      firmwareVersion: '2.1.0',
    });
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleCancel}
      title="Add New Sensor"
      description="Register and configure a new IoT environmental module"
      width="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-surface-dark min-h-full">
        {/* Hardware Module Header */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Icon name="RouterIcon" size={24} className="text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-tight">IoT Hardware Module</h4>
            <p className="text-micro text-primary font-medium tracking-widest uppercase">Status: Ready for registration</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Sensor ID */}
          <div className="space-y-2">
            <Label htmlFor="sensor-id" className="text-xs font-bold text-text-dim uppercase tracking-wider">
              System Identifier
            </Label>
            <div className="relative">
              <Icon name="SearchIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
              <Input
                id="sensor-id"
                type="text"
                placeholder="sen-000"
                value={formData.sensorId}
                onChange={(e) => setFormData({ ...formData, sensorId: e.target.value })}
                className="w-full pl-9 h-11 bg-[#1A1C1B] border-border-dark text-white placeholder:text-text-dim/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors transition-[width] transition-[height] rounded-lg"
                required
              />
            </div>
          </div>

          {/* Firmware Version */}
          <div className="space-y-2">
            <Label htmlFor="firmware" className="text-xs font-bold text-text-dim uppercase tracking-wider">
              Firmware Revision
            </Label>
            <div className="relative">
              <Icon name="CpuIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
              <Input
                id="firmware"
                type="text"
                placeholder="2.1.0"
                value={formData.firmwareVersion}
                onChange={(e) => setFormData({ ...formData, firmwareVersion: e.target.value })}
                className="w-full pl-9 h-11 bg-[#1A1C1B] border-border-dark text-white placeholder:text-text-dim/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors transition-[width] transition-[height] rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Farm Assignment */}
        <div className="space-y-2">
          <Label htmlFor="farm" className="text-xs font-bold text-text-dim uppercase tracking-wider">
            Facility Assignment
          </Label>
          <div className="relative">
            <Icon name="FarmIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <select
              id="farm"
              value={formData.farmId}
              onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
              className="w-full h-11 bg-[#1A1C1B] border border-border-dark rounded-lg pl-9 pr-10 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none appearance-none cursor-pointer hover:bg-[#222524] transition-colors"
              required
            >
              <option value="" disabled>Select target facility...</option>
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-dim">
              <Icon name="ArrowDown01Icon" size={14} />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-xs font-bold text-text-dim uppercase tracking-wider">
            Internal Placement
          </Label>
          <div className="relative">
            <Icon name="Location01Icon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <Input
              id="location"
              type="text"
              placeholder="e.g. Broiler House Section B"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full pl-9 h-11 bg-[#1A1C1B] border-border-dark text-white placeholder:text-text-dim/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors transition-[width] transition-[height] rounded-lg"
              required
            />
          </div>
        </div>

        {/* Sensor Type */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-text-dim uppercase tracking-wider">
            Detection Parameter Type
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {SENSOR_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value as Sensor['type'] })}
                className={cn(
                  'flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-colors duration-300',
                  formData.type === type.value
                    ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(54,226,120,0.1)]'
                    : 'border-border-dark bg-[#1A1C1B] hover:border-text-dim/50'
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  formData.type === type.value ? 'bg-primary text-black' : 'bg-white/5 text-text-dim'
                )}>
                  <Icon name={type.icon} size={20} />
                </div>
                <div className="text-center">
                  <span className={cn('text-xs font-bold uppercase tracking-tight', formData.type === type.value ? 'text-white' : 'text-text-dim')}>
                    {type.label}
                  </span>
                  <p className="text-micro text-text-dim/60 mt-0.5">{type.unit}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-8 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="h-11 px-6 text-sm font-bold text-text-dim hover:text-white hover:bg-white/5 transition-colors transition-[height]"
          >
            DISCARD
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-8 bg-primary hover:bg-primary-dark text-black font-bold text-sm rounded-lg transition-colors transition-opacity transition-shadow transition-[width] transition-[height] shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Icon name="CycleIcon" size={16} className="mr-2 animate-spin" />
                REGISTERING...
              </>
            ) : (
              <>
                <Icon name="CheckmarkCircle01Icon" size={16} className="mr-2" />
                ACTIVATE SENSOR
              </>
            )}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

export default AddSensorSheet;
