import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/hooks/useIcon';
import { useFarmsStore } from '@/stores/useFarmsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

interface AddNewFarmSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const REGIONS = [
  { value: 'Mindanao', label: 'Mindanao' },
  { value: 'Luzon', label: 'Luzon' },
  { value: 'Visayas', label: 'Visayas' },
];

export function AddNewFarmSheet({ isOpen, onClose }: AddNewFarmSheetProps) {
  const createFarm = useFarmsStore((state) => state.createFarm);
  const orgId = useAuthStore((state) => state.user?.orgId);

  const [formData, setFormData] = React.useState({
    name: '',
    region: '',
    capacity: '',
    lat: '',
    lng: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.region || !formData.capacity) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createFarm({
        name: formData.name,
        region: formData.region,
        capacity: parseInt(formData.capacity, 10),
        lat: formData.lat ? parseFloat(formData.lat) : undefined,
        lng: formData.lng ? parseFloat(formData.lng) : undefined,
        orgId: orgId!,
      });

      // Reset form
      setFormData({
        name: '',
        region: '',
        capacity: '',
        lat: '',
        lng: '',
      });
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create farm. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      region: '',
      capacity: '',
      lat: '',
      lng: '',
    });
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleCancel}
      title="Add New Farm"
      description="Configure your new farm location and details"
      width="lg"
      className={cn("bg-card/95 backdrop-blur-xl border-l border-border/40")}
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-8">
        {submitError && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {submitError}
          </div>
        )}
        {/* Farm Name */}
        <div className="space-y-2">
          <Label htmlFor="farm-name" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Farm Name
          </Label>
          <Input
            id="farm-name"
            type="text"
            placeholder="e.g. Valencia Station #2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Region */}
          <div className="space-y-2">
            <Label htmlFor="region" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Region
            </Label>
            <div className="relative">
              <select
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full bg-muted/20 border-border border rounded-md py-2.5 pl-3 pr-10 text-sm text-foreground focus:border-primary focus:ring-0 focus:outline-none appearance-none transition-colors h-11"
                required
              >
                <option value="" disabled className="bg-card">Select region...</option>
                {REGIONS.map((region) => (
                  <option key={region.value} value={region.value} className="bg-card">
                    {region.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Icon name="ArrowDown01Icon" size={16} className="text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Total Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Capacity
            </Label>
            <div className="relative">
              <Input
                id="capacity"
                type="number"
                placeholder="0"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors pr-12 h-11"
                required
                min="1"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-micro font-bold text-muted-foreground">QTY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location Coordinates (optional) */}
        <div className="space-y-3">
          <Label className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Location Coordinates (Optional)
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-xs text-muted-foreground">
                Latitude
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="e.g. 8.2000"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-xs text-muted-foreground">
                Longitude
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="e.g. 124.6000"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-border flex items-center justify-end gap-3 mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 h-11 px-6 transition-colors transition-[height]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 h-11 px-8 rounded-lg transition-[color,box-shadow,width,height] group"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Icon name="CycleIcon" size={16} className="animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Register Farm</span>
                <Icon name="ArrowRight01Icon" size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

export default AddNewFarmSheet;
