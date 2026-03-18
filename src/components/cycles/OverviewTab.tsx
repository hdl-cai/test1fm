import { cn } from '@/lib/utils';
import { Icon } from '@/hooks/useIcon';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { ProductionCycle, Person, Farm } from '@/types';

interface OverviewTabProps {
    cycle: ProductionCycle;
    farm: Farm | undefined;
    grower: Person | undefined;
}

export function OverviewTab({ cycle, farm, grower }: OverviewTabProps) {
    const startDate = new Date(cycle.startDate);
    const endDate = new Date(cycle.expectedEndDate);
    const now = new Date();
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const currentBirdCount = Math.round(cycle.birdCount * (1 - cycle.mortalityRate / 100));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <p className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Bird Count</p>
                    <div className="mt-2 flex items-baseline gap-1">
                        <p className="text-2xl font-bold text-foreground tabular-nums font-data">{currentBirdCount.toLocaleString()}</p>
                        <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest leading-none">Live</span>
                    </div>
                    <p className="text-micro text-muted-foreground mt-2 font-bold uppercase tracking-widest italic">Initial: <span className="font-data">{cycle.birdCount.toLocaleString()}</span></p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <p className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Mortality Rate</p>
                    <div className="mt-2 flex items-baseline gap-1">
                        <p className={cn(
                            'text-2xl font-bold tabular-nums font-data transition-colors',
                            cycle.mortalityRate > 1 ? 'text-danger font-semibold' : cycle.mortalityRate >= 0.5 ? 'text-warning' : 'text-success'
                        )}>
                            {cycle.mortalityRate.toFixed(2)}%
                        </p>
                        <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest leading-none">Rate</span>
                    </div>
                    <p className="text-micro text-muted-foreground mt-2 font-bold uppercase tracking-widest italic">Total Mortality</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <p className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Performance Summary</p>
                    <div className="mt-2 flex items-baseline gap-1">
                        <p className="text-2xl font-bold text-foreground tabular-nums font-data">{cycle.fcr?.toFixed(2) || '--'}</p>
                        <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest leading-none">FCR</span>
                    </div>
                    <p className="text-micro text-muted-foreground mt-2 font-bold uppercase tracking-widest italic">Conversion Ratio</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <p className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Average Bird Weight</p>
                    <div className="mt-2 flex items-baseline gap-1">
                        <p className="text-2xl font-bold text-foreground tabular-nums font-data">
                            {cycle.averageWeight ? `${(cycle.averageWeight / 1000).toFixed(2)}` : '--'}
                        </p>
                        <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest leading-none">KG/AVG</span>
                    </div>
                    <p className="text-micro text-muted-foreground mt-2 font-bold uppercase tracking-widest italic">Average Weight</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Progress Timeline */}
                <div className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden group shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Growth Timeline</h3>
                            <p className="text-lg font-bold text-foreground">Cycle Progress</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground">
                            <Icon name="CalendarIcon" size={18} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="w-full h-3 bg-muted/40 rounded-full overflow-hidden border border-border/50 shadow-inner p-[1px]">
                            <div
                                className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-colors transition-shadow transition-[width] transition-[height] duration-1000 shadow-[2px_0_10px_rgba(16,185,129,0.3)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/10 p-4 rounded-xl border border-border/50">
                                <span className="text-micro font-bold text-muted-foreground uppercase tracking-[0.1em] block mb-1">Duration</span>
                                <span className="text-sm font-bold text-foreground tabular-nums font-data">{elapsedDays} <span className="text-muted-foreground/40 font-bold tracking-normal lowercase ml-1">of</span> {totalDays} <span className="text-muted-foreground/40 font-bold tracking-normal lowercase ml-1">days</span></span>
                            </div>
                            <div className="bg-muted/10 p-4 rounded-xl border border-border/50">
                                <span className="text-micro font-bold text-muted-foreground uppercase tracking-[0.1em] block mb-1">Remaining Days</span>
                                <span className={cn(
                                    'text-sm font-bold tabular-nums font-data transition-colors',
                                    daysRemaining <= 0 ? 'text-danger font-bold' : daysRemaining <= 7 ? 'text-warning' : 'text-foreground'
                                )}>
                                    {daysRemaining} <span className="text-muted-foreground/40 font-bold tracking-normal lowercase ml-1">days</span>
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest">Start Date</span>
                                <span className="text-xs font-bold text-foreground">{startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest">Anticipated Harvest</span>
                                <span className="text-xs font-bold text-foreground">{endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed Management */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Feed Usage</h3>
                            <p className="text-lg font-bold text-foreground">Feed Management</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground">
                            <Icon name="PackagingIcon" size={18} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest">Inventory Level</span>
                                <span className="text-sm font-bold text-foreground tabular-nums font-data">{(cycle.currentFeedStock / 1000).toFixed(1)} MT <span className="text-muted-foreground/40 text-xs font-bold lowercase tracking-normal ml-1">Remaining</span></span>
                            </div>
                            <StatusBadge
                                status={cycle.currentFeedStock < 1000 ? 'critical' : cycle.currentFeedStock < 3000 ? 'replenish' : 'optimal'}
                                size="sm"
                            />
                        </div>

                        <div className="w-full h-2 bg-muted/40 rounded-full overflow-hidden shadow-inner">
                            <div
                                className={cn(
                                    'h-full rounded-full transition-[height]',
                                    cycle.currentFeedStock < 1000 ? 'bg-destructive' : cycle.currentFeedStock < 3000 ? 'bg-amber-500' : 'bg-primary'
                                )}
                                style={{ width: `${Math.min(100, (cycle.currentFeedStock / 5000) * 100)}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/10 p-4 rounded-xl border border-border/50">
                                <span className="text-micro font-bold text-muted-foreground uppercase tracking-[0.1em] block mb-1">Total Consumed</span>
                                <span className="text-sm font-bold text-foreground tabular-nums font-data">{(cycle.feedConsumed / 1000).toFixed(2)} MT</span>
                            </div>
                            <div className="bg-muted/10 p-4 rounded-xl border border-border/50">
                                <span className="text-micro font-bold text-muted-foreground uppercase tracking-[0.1em] block mb-1">Days Remaining</span>
                                <span className="text-sm font-bold text-foreground tabular-nums font-data">~{elapsedDays > 0 ? Math.floor(cycle.currentFeedStock / (cycle.feedConsumed / elapsedDays)) : '--'} <span className="text-muted-foreground/40 font-bold tracking-normal lowercase ml-1">days</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignment Info */}
            <div className="bg-card/50 border border-border rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <h4 className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em]">Farm & Grower</h4>
                    <div className="h-px flex-1 bg-border/50" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center border border-border/50 shadow-inner group-hover:scale-105 transition-transform">
                            <Icon name="Home01Icon" size={24} className="text-primary" />
                        </div>
                        <div>
                            <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest block mb-1">Farm</span>
                            <p className="text-lg font-bold text-foreground leading-tight tracking-tight">{farm?.name || 'Unknown Farm'}</p>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">{farm?.region || 'Unknown Region'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center border border-border/50 shadow-inner group-hover:scale-105 transition-transform">
                            <Icon name="UserIcon" size={24} className="text-primary" />
                        </div>
                        <div>
                            <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest block mb-1">Grower</span>
                            <p className="text-lg font-bold text-foreground leading-tight tracking-tight">{grower?.name || 'Unassigned'}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground font-bold tracking-wide lowercase">{grower?.email || 'No email available'}</span>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                <span className="text-micro font-bold text-primary uppercase tracking-widest">Primary Contact</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
