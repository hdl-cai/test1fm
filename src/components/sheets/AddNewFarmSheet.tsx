import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/hooks/useIcon';
import { useFarmsStore } from '@/stores/useFarmsStore';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '@/lib/utils';
import type { Farm } from '@/types';

// Import CSS for leaflet (though it's in index.css, safety first for markers)
import 'leaflet/dist/leaflet.css';

interface AddNewFarmSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const REGIONS = [
  { value: 'Mindanao', label: 'Mindanao' },
  { value: 'Luzon', label: 'Luzon' },
  { value: 'Visayas', label: 'Visayas' },
];

// Custom icon for the marker in the mini-map
const miniMapIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="absolute w-full h-full rounded-full bg-[#10B981] opacity-20 animate-pulse"></div>
      <div class="relative w-3 h-3 rounded-full border-2 border-white bg-[#10B981] shadow-lg"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <Marker position={position} icon={miniMapIcon} />
  );
}

export function AddNewFarmSheet({ isOpen, onClose }: AddNewFarmSheetProps) {
  const addFarm = useFarmsStore((state) => state.addFarm);

  const [formData, setFormData] = React.useState({
    name: '',
    region: '',
    capacity: '',
    lat: 8.2,
    lng: 124.6,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const setCoordinates = (pos: [number, number]) => {
    setFormData(prev => ({ ...prev, lat: Number(pos[0].toFixed(4)), lng: Number(pos[1].toFixed(4)) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.region || !formData.capacity) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newFarmData: Omit<Farm, 'id' | 'lastUpdated'> = {
      name: formData.name,
      region: formData.region,
      status: 'empty',
      capacity: parseInt(formData.capacity, 10),
      currentBirdCount: 0,
      activeCycles: 0,
      avgFCR: 0,
      avgLiveWeight: 0,
      bpi: 0,
      coordinates: {
        lat: formData.lat,
        lng: formData.lng,
      },
    };

    addFarm(newFarmData);

    // Reset form
    setFormData({
      name: '',
      region: '',
      capacity: '',
      lat: 8.2,
      lng: 124.6,
    });

    setIsSubmitting(false);
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      region: '',
      capacity: '',
      lat: 8.2,
      lng: 124.6,
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

        {/* Location Pin */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Location Pin
            </Label>
            <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-white/5 font-mono text-micro text-muted-foreground">
              <span className="text-primary/70">LAT: {formData.lat}</span>
              <span className="w-px h-2 bg-white/10"></span>
              <span className="text-primary/70">LNG: {formData.lng}</span>
            </div>
          </div>

          <div className="relative h-56 rounded-xl overflow-hidden group border border-border/50 shadow-inner">
            <MapContainer
              center={[formData.lat, formData.lng]}
              zoom={10}
              className="w-full h-full z-0"
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <LocationMarker position={[formData.lat, formData.lng]} setPosition={setCoordinates} />
            </MapContainer>

            {/* Overlay Help */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border/40 rounded-lg p-2 z-[400] text-micro text-muted-foreground">
              <Icon name="InformationCircleIcon" size={14} className="text-primary" />
              Click anywhere on the map to set the farm location coordinates.
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
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 h-11 px-8 rounded-lg transition-colors transition-shadow transition-[width] transition-[height] group"
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
