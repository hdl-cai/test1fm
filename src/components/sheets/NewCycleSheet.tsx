/**
 * NewCycleSheet Component
 * 
 * Sheet for creating a new production cycle.
 * Includes form fields for batch name, farm, grower, bird count, and dates.
 */

import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/hooks/useIcon';
import { useFarmsStore } from '@/stores/useFarmsStore';
import { usePersonnelStore } from '@/stores/usePersonnelStore';
import { useCyclesStore } from '@/stores/useCyclesStore';
import type { ProductionCycle } from '@/types';

interface NewCycleSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const calculateEndDate = (startDate: string) => {
  const start = new Date(startDate);
  start.setDate(start.getDate() + 45);
  return start.toISOString().split('T')[0];
};

export function NewCycleSheet({ isOpen, onClose }: NewCycleSheetProps) {
  const addCycle = useCyclesStore((state) => state.addCycle);
  const farms = useFarmsStore((state) => state.farms);
  const allPersonnel = usePersonnelStore((state) => state.personnel);
  const growers = React.useMemo(() =>
    allPersonnel.filter(p => p.role === 'grower'),
    [allPersonnel]
  );

  const [formData, setFormData] = React.useState({
    batchName: '',
    farmId: '',
    growerId: '',
    birdCount: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: '',
    initialFeedStock: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (formData.startDate && !formData.expectedEndDate) {
      setFormData(prev => ({ ...prev, expectedEndDate: calculateEndDate(prev.startDate) }));
    }
  }, [formData.startDate, formData.expectedEndDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.batchName || !formData.farmId || !formData.growerId || !formData.birdCount) {
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const newCycleData: Omit<ProductionCycle, 'id'> = {
      batchName: formData.batchName,
      farmId: formData.farmId,
      growerId: formData.growerId,
      birdCount: parseInt(formData.birdCount, 10),
      startDate: new Date(formData.startDate),
      expectedEndDate: new Date(formData.expectedEndDate),
      status: 'active',
      mortalityRate: 0,
      feedConsumed: 0,
      currentFeedStock: parseInt(formData.initialFeedStock, 10) || 0,
    };

    addCycle(newCycleData);

    setFormData({
      batchName: '',
      farmId: '',
      growerId: '',
      birdCount: '',
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: '',
      initialFeedStock: '',
    });

    setIsSubmitting(false);
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      batchName: '',
      farmId: '',
      growerId: '',
      birdCount: '',
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: '',
      initialFeedStock: '',
    });
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleCancel}
      title="Start New Production Cycle"
      description="Configure details for a new flock cycle"
      width="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Batch Name */}
        <div className="space-y-2">
          <Label htmlFor="batch-name" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Batch Name
          </Label>
          <Input
            id="batch-name"
            type="text"
            placeholder="e.g. Batch #2024-A"
            value={formData.batchName}
            onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
            className="w-full bg-muted/20 border-border text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:ring-0 transition-colors h-11"
            required
          />
        </div>

        {/* Farm Selection */}
        <div className="space-y-2">
          <Label htmlFor="farm" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Farm
          </Label>
          <div className="relative">
            <select
              id="farm"
              value={formData.farmId}
              onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
              className="w-full bg-muted/20 border border-border rounded-md py-2.5 pl-3 pr-10 text-sm text-foreground focus:border-primary focus:ring-0 focus:outline-none appearance-none transition-colors h-11"
              required
            >
              <option value="" disabled>Select a farm...</option>
              {farms.filter(f => f.status === 'active' || f.status === 'empty').map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name} ({farm.region})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Icon name="ArrowDown01Icon" size={16} className="text-[#6B7280]" />
            </div>
          </div>
        </div>

        {/* Grower Selection */}
        <div className="space-y-2">
          <Label htmlFor="grower" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Assigned Grower
          </Label>
          <div className="relative">
            <select
              id="grower"
              value={formData.growerId}
              onChange={(e) => setFormData({ ...formData, growerId: e.target.value })}
              className="w-full bg-muted/20 border border-border rounded-md py-2.5 pl-3 pr-10 text-sm text-foreground focus:border-primary focus:ring-0 focus:outline-none appearance-none transition-colors h-11"
              required
            >
              <option value="" disabled>Select a grower...</option>
              {growers.map((grower) => (
                <option key={grower.id} value={grower.id}>
                  {grower.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Icon name="ArrowDown01Icon" size={16} className="text-[#6B7280]" />
            </div>
          </div>
        </div>

        {/* Bird Count */}
        <div className="space-y-2">
          <Label htmlFor="bird-count" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Bird Count
          </Label>
          <Input
            id="bird-count"
            type="number"
            placeholder="e.g. 10,000"
            value={formData.birdCount}
            onChange={(e) => setFormData({ ...formData, birdCount: e.target.value })}
            className="w-full bg-muted/20 border-border text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:ring-0 transition-colors h-11"
            required
            min="1"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Start Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full bg-muted/20 border-border text-foreground focus:border-primary focus:ring-0 transition-colors h-11 px-3"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Expected End Date
            </Label>
            <Input
              id="end-date"
              type="date"
              value={formData.expectedEndDate}
              onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
              className="w-full bg-muted/20 border-border text-foreground focus:border-primary focus:ring-0 transition-colors h-11 px-3"
              required
            />
          </div>
        </div>

        {/* Initial Feed Stock */}
        <div className="space-y-2">
          <Label htmlFor="feed-stock" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Initial Feed Stock (kg)
          </Label>
          <Input
            id="feed-stock"
            type="number"
            placeholder="e.g. 5,000"
            value={formData.initialFeedStock}
            onChange={(e) => setFormData({ ...formData, initialFeedStock: e.target.value })}
            className="w-full bg-muted/20 border-border text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:ring-0 transition-colors h-11"
            min="0"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#27272A] flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="text-sm font-medium text-[#9CA3AF] hover:text-white hover:bg-transparent"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-8 h-11 bg-primary hover:bg-primary/90 text-white text-sm font-black rounded-lg transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {isSubmitting ? (
              <>
                <Icon name="CycleIcon" size={16} className="mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Icon name="PlayIcon" size={16} className="mr-2" />
                Start Cycle
              </>
            )}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

export default NewCycleSheet;
