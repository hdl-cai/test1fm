/**
 * HealthReportSheet Component
 * 
 * Re-designed with the "Emerald Command Center" theme.
 * High-fidelity form for recording health activities and security incidents.
 */

import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icon, type IconName } from '@/hooks/useIcon';
import { getPersonnelByRole } from '@/data/personnel';
import { farms } from '@/data/farms';
import { getCyclesByFarmId } from '@/data/production-cycles';
import { cn } from '@/lib/utils';
import type { HealthRecord } from '@/types';

interface HealthReportSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const HEALTH_TYPES: { value: HealthRecord['type']; label: string; icon: IconName }[] = [
  { value: 'vaccination', label: 'Vaccination', icon: 'MedicineIcon' },
  { value: 'treatment', label: 'Treatment', icon: 'FirstAidKitIcon' },
  { value: 'inspection', label: 'Inspection', icon: 'SearchIcon' },
];

export function HealthReportSheet({ isOpen, onClose }: HealthReportSheetProps) {
  const vets = getPersonnelByRole('vet');
  const [selectedFarmId, setSelectedFarmId] = React.useState('');
  const [formData, setFormData] = React.useState({
    type: 'vaccination' as HealthRecord['type'],
    description: '',
    date: new Date().toISOString().split('T')[0],
    vetId: '',
    notes: '',
    farmId: '',
    cycleId: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploads, setUploads] = React.useState<string[]>([]);

  const farmCycles = selectedFarmId ? getCyclesByFarmId(selectedFarmId) : [];
  const activeCycles = farmCycles.filter(c => c.status === 'active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.description || !formData.date || !formData.vetId || !formData.farmId) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log('Finalizing report:', { ...formData, photos: uploads });
    setIsSubmitting(false);
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      type: 'vaccination',
      description: '',
      date: new Date().toISOString().split('T')[0],
      vetId: '',
      notes: '',
      farmId: '',
      cycleId: '',
    });
    setSelectedFarmId('');
    setUploads([]);
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleCancel}
      title="Create Health Record"
      description="Enter health record details"
      width="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-8 py-4">
        {/* Activity Type Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-micro font-bold text-text-dim uppercase tracking-[2px]">Activity Type</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {HEALTH_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value as HealthRecord['type'] })}
                className={cn(
                  "relative flex flex-col items-center justify-center p-4 rounded-xl border transition-colors duration-300 group",
                  formData.type === type.value
                    ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "bg-surface-dark border-border-dark hover:border-text-dim/30 hover:bg-white/[0.02]"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-transform duration-300 group-active:scale-95",
                  formData.type === type.value ? "text-primary" : "text-text-dim"
                )}>
                  <Icon name={type.icon} size={24} />
                </div>
                <span className={cn(
                  "text-micro font-bold uppercase tracking-wider",
                  formData.type === type.value ? "text-white" : "text-text-dim"
                )}>
                  {type.label}
                </span>
                {formData.type === type.value && (
                  <div className="absolute top-1.5 right-1.5">
                    <Icon name="CheckmarkBadge01Icon" size={12} className="text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Farm Selection */}
          <div className="space-y-2.5">
            <Label className="text-micro font-bold text-text-dim uppercase tracking-widest pl-1">Farm</Label>
            <div className="relative group">
              <select
                value={formData.farmId}
                onChange={(e) => {
                  setFormData({ ...formData, farmId: e.target.value, cycleId: '' });
                  setSelectedFarmId(e.target.value);
                }}
                className="w-full h-[46px] bg-surface-dark border border-border-dark rounded-xl pl-4 pr-10 text-sm font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors transition-[width] transition-[height] cursor-pointer appearance-none"
                required
              >
                <option value="" disabled>SELECT FARM</option>
                {farms.filter(f => f.status === 'active').map((farm) => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
              <Icon name="ArrowDown01Icon" size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim group-hover:text-primary transition-colors pointer-events-none" />
            </div>
          </div>

          {/* Cycle Selection */}
          <div className="space-y-2.5">
            <Label className="text-micro font-bold text-text-dim uppercase tracking-widest pl-1">Batch</Label>
            <div className="relative group">
              <select
                value={formData.cycleId}
                onChange={(e) => setFormData({ ...formData, cycleId: e.target.value })}
                disabled={!formData.farmId}
                className="w-full h-[46px] bg-surface-dark border border-border-dark rounded-xl pl-4 pr-10 text-sm font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors transition-opacity transition-[width] transition-[height] cursor-pointer appearance-none disabled:opacity-40"
                required
              >
                <option value="" disabled>SELECT BATCH</option>
                {activeCycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>{cycle.batchName}</option>
                ))}
              </select>
              <Icon name="ArrowDown01Icon" size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim group-hover:text-primary transition-colors pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2.5">
          <Label className="text-micro font-bold text-text-dim uppercase tracking-widest pl-1">Subject / Activity</Label>
          <Input
            placeholder="e.g. Day 5 Vaccination"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="h-[46px] bg-surface-dark border-border-dark text-white font-bold placeholder:text-white/10 rounded-xl focus:border-primary focus:ring-primary/20"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Date */}
          <div className="space-y-2.5">
            <Label className="text-micro font-bold text-text-dim uppercase tracking-widest pl-1">Date</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="h-[46px] bg-surface-dark border-border-dark text-white font-bold rounded-xl focus:border-primary focus:ring-primary/20"
              required
            />
          </div>

          {/* Veterinarian */}
          <div className="space-y-2.5">
            <Label className="text-micro font-bold text-text-dim uppercase tracking-widest pl-1">Veterinarian</Label>
            <div className="relative group">
              <select
                value={formData.vetId}
                onChange={(e) => setFormData({ ...formData, vetId: e.target.value })}
                className="w-full h-[46px] bg-surface-dark border border-border-dark rounded-xl pl-4 pr-10 text-sm font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors transition-[width] transition-[height] cursor-pointer appearance-none"
                required
              >
                <option value="" disabled>SELECT DR.</option>
                {vets.map((vet) => (
                  <option key={vet.id} value={vet.id}>Dr. {vet.name.split(' ').pop()}</option>
                ))}
              </select>
              <Icon name="ArrowDown01Icon" size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim group-hover:text-primary transition-colors pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Photos Upload */}
        <div className="space-y-3">
          <Label className="text-micro font-bold text-text-dim uppercase tracking-widest pl-1">Photos</Label>
          <div className="grid grid-cols-4 gap-3">
            <button
              type="button"
              className="aspect-square rounded-xl border-2 border-dashed border-border-dark flex flex-col items-center justify-center gap-2 text-text-dim hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Icon name="CameraIcon" size={18} />
              </div>
              <span className="text-micro font-bold uppercase tracking-widest">ADD PHOTO</span>
            </button>
            {/* Mock placeholders */}
            {[1, 2].map((i) => (
              <div key={i} className="aspect-square rounded-xl border border-border-dark bg-white/5 overflow-hidden group relative">
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Icon name="Delete02Icon" size={16} className="text-white cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2.5">
          <Label className="text-micro font-bold text-text-dim uppercase tracking-widest pl-1">Additional Notes</Label>
          <Textarea
            placeholder="Enter any additional notes here..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="min-h-[100px] bg-surface-dark border-border-dark text-white font-medium placeholder:text-white/10 rounded-xl focus:border-primary focus:ring-primary/20 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-6 mt-4 flex items-center justify-between border-t border-border-dark">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="text-xs font-bold text-text-dim uppercase tracking-[2px] hover:text-white hover:bg-white/5 px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-[46px] px-8 bg-primary hover:bg-primary-dark text-black font-bold text-sm rounded-xl transition-colors transition-opacity transition-shadow transition-[width] transition-[height] shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Icon name="CycleIcon" size={18} className="animate-spin" />
            ) : (
              <span className="flex items-center gap-2 uppercase tracking-widest">
                <Icon name="CheckmarkBadge01Icon" size={18} />
                Save Record
              </span>
            )}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

export default HealthReportSheet;
