import React from 'react';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/shared';
import type { Farm } from '@/types';

interface FarmCardProps {
    farm: Farm;
    onClick?: (farmId: string) => void;
}

export const FarmCard: React.FC<FarmCardProps> = ({ farm, onClick }) => {
    const isActive = farm.status === 'active';
    const isMaintenance = farm.status === 'maintenance';

    // Specific sparkline paths for variety based on farm index or data
    const getSparklinePath = () => {
        // In a real app, this would be generated from actual trend data
        const paths = [
            "M0 25 C20 25, 40 20, 60 15 S 80 5, 100 2",
            "M0 20 L20 25 L40 10 L60 18 L80 12 L100 15",
            "M0 25 C30 25, 50 15, 70 10 S 90 8, 100 5",
            "M0 15 L20 18 L40 12 L60 20 L80 15 L100 5"
        ];
        // Return a path based on the first char of ID to keep it consistent
        const index = farm.id ? farm.id.charCodeAt(0) % paths.length : 0;
        return paths[index];
    };

    return (
        <div
            onClick={() => onClick?.(farm.id)}
            className="bg-card border border-border hover:border-primary/50 transition-colors transition-[width] transition-[height] p-5 flex flex-col justify-between group h-64 cursor-pointer relative overflow-hidden rounded-2xl"
        >
            {/* Background decoration highlight */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-3">
                        <div
                            className={cn(
                                'w-11 h-11 rounded-xl flex items-center justify-center border transition-shadow transition-[width] transition-[height] duration-300 shadow-inner',
                                isActive
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : isMaintenance
                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        : 'bg-muted/50 text-muted-foreground border-border'
                            )}
                        >
                            <Icon
                                name={
                                    isActive
                                        ? 'FarmIcon'
                                        : isMaintenance
                                            ? 'AlertCircleIcon'
                                            : 'Home01Icon'
                                }
                                size={22}
                                className="drop-shadow-sm"
                            />
                        </div>
                        <div>
                            <h4 className="font-black text-foreground text-sm leading-tight transition-colors">{farm.name}</h4>
                            <p className="text-micro text-muted-foreground mt-1 uppercase font-bold tracking-widest">{farm.region}</p>
                        </div>
                    </div>
                    <div className="scale-90 origin-top-right">
                        <StatusBadge status={farm.status} size="sm" />
                    </div>
                </div>

                <div className="mb-1">
                    <p className="text-micro font-black text-muted-foreground uppercase tracking-[0.2em]">
                        Current Population
                    </p>
                    <div className="flex items-end justify-between mt-1">
                        <span className="text-xl font-black text-foreground tracking-tighter origin-left font-data leading-none">
                            {farm.currentBirdCount > 0
                                ? farm.currentBirdCount.toLocaleString()
                                : '--'}
                        </span>

                        {/* Mock Sparkline SVG */}
                        <div className="h-7 w-16 relative opacity-60 transition-opacity">
                            <svg className={cn("h-full w-full", isActive ? "text-emerald-500" : "text-muted-foreground/20")} fill="none" viewBox="0 0 100 30">
                                <path
                                    d={getSparklinePath()}
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    className={cn(isActive && "drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]")}
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Secondary Metrics Row - Enhanced Legibility */}
                <div className="grid grid-cols-4 gap-0 border-y border-border/40 py-3.5 mt-2">
                    <div className="flex flex-col items-center border-r border-border/20 last:border-r-0">
                        <span className="text-micro font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">Cycles</span>
                        <span className="text-lg font-black text-foreground font-data leading-none">{farm.activeCycles}</span>
                    </div>
                    <div className="flex flex-col items-center border-r border-border/20 last:border-r-0">
                        <span className="text-micro font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">FCR</span>
                        <span className="text-lg font-black text-foreground font-data leading-none">{farm.avgFCR.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-center border-r border-border/20 last:border-r-0">
                        <span className="text-micro font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">Weight</span>
                        <span className="text-lg font-black text-foreground font-data leading-none">{farm.avgLiveWeight.toFixed(1)}k</span>
                    </div>
                    <div className="flex flex-col items-center last:border-r-0">
                        <span className="text-micro font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">BPI</span>
                        <span className={cn(
                            'text-lg font-black font-data leading-none',
                            farm.bpi > 350 ? 'text-success' : farm.bpi >= 300 ? 'text-warning' : 'text-danger'
                        )}>{farm.bpi}</span>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto relative z-10">
                <div className={cn(
                    'flex items-center gap-1.5 text-micro font-black uppercase tracking-widest',
                    isActive ? 'text-emerald-500' : isMaintenance ? 'text-amber-500' : 'text-muted-foreground'
                )}>
                    <Icon
                        name={isActive ? "TrendingUpIcon" : isMaintenance ? "Clock01Icon" : "CancelIcon"}
                        size={14}
                    />
                    <span>{isActive ? "+2.4% vs last week" : isMaintenance ? "Restocking soon" : "No active data"}</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-card flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors transition-transform transition-[width] transition-[height] active:scale-90 border border-border/40 group-hover:border-border/60">
                    <Icon name="ArrowRight01Icon" size={18} />
                </div>
            </div>
        </div>
    );
};
