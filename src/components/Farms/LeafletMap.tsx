import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '@/lib/utils';
import type { Farm } from '@/types';
import { useUIStore } from '@/stores/useUIStore';
import { Icon } from '@/hooks/useIcon';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from 'react-router-dom';

// Fix for default marker icons in Leaflet when used with Webpack/Vite
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
    farms: Farm[];
    className?: string;
    onMarkerClick?: (farmId: string) => void;
    hoveredFarmId?: string | null;
}

// Custom pulsing marker icon
const createPulsingIcon = (isActive: boolean, isHighlighted: boolean) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
      <div class="relative flex items-center justify-center ${isHighlighted ? 'w-14 h-14' : 'w-10 h-10'} transition-[width] transition-[height] duration-300">
        <div class="absolute w-full h-full rounded-full ${isActive ? 'bg-[#D4820A]' : 'bg-muted-foreground'} ${isHighlighted ? 'opacity-40 scale-125' : 'opacity-20'} animate-ping"></div>
        <div class="relative ${isHighlighted ? 'w-5 h-5' : 'w-3 h-3'} rounded-full border-2 border-white ${isActive ? 'bg-[#D4820A]' : 'bg-muted-foreground'} shadow-[0_0_15px_rgba(212,130,10,0.9)] transition-colors transition-shadow transition-[width] transition-[height] duration-300"></div>
      </div>
    `,
        iconSize: isHighlighted ? [56, 56] : [40, 40],
        iconAnchor: isHighlighted ? [28, 28] : [20, 20],
    });
};

// Component to handle map view changes (zooming and centering)
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom, { animate: true });
    }, [center, zoom, map]);
    return null;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({ farms, className, onMarkerClick, hoveredFarmId }) => {
    const theme = useUIStore(state => state.theme);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'empty' | 'maintenance'>('all');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Default center (Mindanao area as per project context)
    const [mapView, setMapView] = useState<{ center: [number, number], zoom: number }>({
        center: [8.2, 124.6],
        zoom: 9
    });

    // Theme-aware tile layer URL
    const tileUrl = theme === 'dark'
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    // Filter farms based on status
    const filteredFarms = useMemo(() => {
        return farms.filter(farm => {
            if (statusFilter === 'all') return true;
            return farm.status === statusFilter;
        });
    }, [farms, statusFilter]);

    const handleFarmSelect = (farm: Farm) => {
        // Find farm coordinate
        const index = farms.findIndex(f => f.id === farm.id);
        const positions: [number, number][] = [
            [8.4, 124.6], [8.1, 124.8], [8.3, 124.3], [8.5, 124.9], [8.0, 124.2],
        ];
        const pos = positions[index % positions.length];

        setMapView({ center: pos, zoom: 12 });
        setIsSearchOpen(false);
        setSearchQuery("");
    };

    return (
        <div className={cn("glass-panel rounded-xl overflow-hidden relative group h-[400px]", className)}>
            <MapContainer
                center={mapView.center}
                zoom={mapView.zoom}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
                zoomControl={false}
            >
                <ZoomControl position="bottomleft" />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url={tileUrl}
                    key={theme} // Force re-render of TileLayer when theme changes
                />

                <MapController center={mapView.center} zoom={mapView.zoom} />

                {filteredFarms.map((farm, index) => {
                    // Fallback coordinates if farm doesn't have them (simulating positions for demo)
                    const positions: [number, number][] = [
                        [8.4, 124.6], [8.1, 124.8], [8.3, 124.3], [8.5, 124.9], [8.0, 124.2],
                    ];
                    const pos = positions[index % positions.length];
                    const isHighlighted = hoveredFarmId === farm.id;

                    return (
                        <Marker
                            key={farm.id}
                            position={pos}
                            icon={createPulsingIcon(farm.status === 'active', isHighlighted)}
                            eventHandlers={{
                                click: () => onMarkerClick?.(farm.id),
                            }}
                        >
                            <Popup className="custom-popup">
                                <div className="p-2 w-48">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-foreground text-sm leading-tight">{farm.name}</h4>
                                        <span className={cn(
                                            "w-2 h-2 rounded-full",
                                            farm.status === 'active' ? "bg-success" :
                                                farm.status === 'maintenance' ? "bg-warning" : "bg-muted-foreground"
                                        )} />
                                    </div>
                                    <p className="text-micro text-muted-foreground mb-3">{farm.region} · {farm.status}</p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-micro uppercase font-bold text-muted-foreground">Capacity</span>
                                            <span className="text-xs font-bold text-foreground font-data">{farm.capacity.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-micro uppercase font-bold text-muted-foreground">Birds</span>
                                            <span className="text-xs font-bold text-success font-data">{farm.currentBirdCount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        className="w-full h-8 text-xs font-bold"
                                        onClick={() => navigate(`/farms/${farm.id}`)}
                                    >
                                        View Farm
                                        <Icon name="ArrowRight01Icon" className="ml-2 h-3 w-3" />
                                    </Button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Custom Overlay Controls */}
                <div className="absolute top-4 left-4 z-[1000]">
                    {/* Search Overlay */}
                    <div className="relative group/search">
                        <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                            <PopoverTrigger asChild>
                                <div className="flex h-10 w-64 items-center gap-2 bg-card/90 backdrop-blur-md border border-border rounded-xl px-3 shadow-xl cursor-text hover:border-primary/50 transition-colors transition-shadow transition-[width] transition-[height]">
                                    <Icon name="Search01Icon" size={16} className="text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Search farms...</span>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="p-1 w-64" align="start">
                                <div className="p-2 border-b border-border mb-1">
                                    <input
                                        autoFocus
                                        placeholder="Type farm name..."
                                        className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                    {farms.filter(f =>
                                        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        f.region.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).length === 0 && (
                                            <div className="p-4 text-center text-xs text-muted-foreground">No farms found.</div>
                                        )}
                                    {farms
                                        .filter(f =>
                                            f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            f.region.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                        .map((farm) => (
                                            <div
                                                key={farm.id}
                                                onClick={() => handleFarmSelect(farm)}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center border border-border">
                                                    <Icon name="Home01Icon" size={14} className="text-muted-foreground" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-foreground leading-tight">{farm.name}</span>
                                                    <span className="text-micro text-muted-foreground mt-0.5">{farm.region}</span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end">
                    {/* Filter Toggles */}
                    <div className="flex bg-card/90 backdrop-blur-md rounded-xl p-1 border border-border shadow-xl w-fit">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'active', label: 'Active' },
                            { id: 'empty', label: 'Empty' },
                            { id: 'maintenance', label: 'Maint.' }
                        ].map((choice) => {
                            const isActive = statusFilter === choice.id;
                            const badgeClass =
                                choice.id === 'active' ? 'badge-success' :
                                    choice.id === 'maintenance' ? 'badge-warning' :
                                        'badge-muted';

                            return (
                                <button
                                    key={choice.id}
                                    onClick={() => setStatusFilter(choice.id as any)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg text-micro font-bold transition-all duration-200 uppercase tracking-wider',
                                        isActive
                                            ? `${badgeClass} shadow-sm border border-border/20`
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    )}
                                >
                                    {choice.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </MapContainer>

            {/* Decorative Grid Overlay (matching mock) */}
            <div className="absolute inset-0 pointer-events-none opacity-5 z-[500]"
                style={{ backgroundImage: 'radial-gradient(var(--muted-foreground) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>
        </div>
    );
};


