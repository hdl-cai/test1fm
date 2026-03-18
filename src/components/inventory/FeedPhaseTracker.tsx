import { cn } from '@/lib/utils';
import { Icon } from '@/hooks/useIcon';
import { useCyclesStore } from '@/stores/useCyclesStore';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { differenceInDays, startOfDay } from 'date-fns';


interface FeedPhase {
    name: string;
    startDay: number;
    endDay: number;
    color: string;
}

const FEED_PHASES: FeedPhase[] = [
    { name: 'Starter', startDay: 1, endDay: 10, color: '#D4820A' },
    { name: 'Grower', startDay: 11, endDay: 24, color: '#F5C430' },
    { name: 'Finisher', startDay: 25, endDay: 42, color: 'hsl(var(--chart-2))' },
];

/**
 * FeedPhaseTracker Component
 * 
 * High-density UI for tracking feed lifecycle and stock projections.
 */
export function FeedPhaseTracker() {
    const { cycles } = useCyclesStore();
    const { items: inventoryItems } = useInventoryStore();
    
    const activeCycles = cycles.filter(c => c.status === 'active');

    const getDOL = (startDate: Date) => {
        return Math.max(0, differenceInDays(startOfDay(new Date()), startOfDay(new Date(startDate))) + 1);
    };

    // Calculate real stock data from inventory items
    const feedStock = {
        starter: inventoryItems
            .filter(i => i.category === 'feed' && i.name.toLowerCase().includes('starter'))
            .reduce((acc, i) => acc + i.currentStock, 0),
        grower: inventoryItems
            .filter(i => i.category === 'feed' && i.name.toLowerCase().includes('grower'))
            .reduce((acc, i) => acc + i.currentStock, 0),
        finisher: inventoryItems
            .filter(i => i.category === 'feed' && i.name.toLowerCase().includes('finisher'))
            .reduce((acc, i) => acc + i.currentStock, 0),
    };

    // Requirement calculation logic (simplified for UI demonstration)
    // In a real app, this would use the current active bird count * standard feed consumption per day
    const calculateRequirements = () => {
        let starterReq = 0;
        let growerReq = 0;
        let finisherReq = 0;

        activeCycles.forEach(cycle => {
            const dol = getDOL(cycle.startDate);
            const birds = cycle.birdCount;

            // Simple estimation: 1.5kg Starter, 3.5kg Grower, 4kg Finisher per bird total
            if (dol <= 10) starterReq += (birds * 1.5);
            if (dol <= 24) growerReq += (birds * 3.5);
            if (dol <= 42) finisherReq += (birds * 4.0);
        });

        return {
            starter: starterReq || 4500, // Fallback for UI if no cycles
            grower: growerReq || 9000,
            finisher: finisherReq || 8200
        };
    };

    const requirements = calculateRequirements();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Supply Projection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Starter Projected', stock: feedStock.starter, req: requirements.starter, color: '#D4820A' },
                    { label: 'Grower Projected', stock: feedStock.grower, req: requirements.grower, color: '#F5C430' },
                    { label: 'Finisher Projected', stock: feedStock.finisher, req: requirements.finisher, color: 'hsl(var(--chart-2))' },
                ].map((stat, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Icon name="AnalyticsIcon" size={48} />
                        </div>
                        <p className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-2xl font-bold text-foreground tabular-nums">{stat.stock.toLocaleString()}<span className="text-xs font-medium text-muted-foreground ml-1">kg</span></p>
                                <p className="text-micro font-bold text-muted-foreground/50 uppercase tracking-widest mt-1">Actual Stock</p>
                            </div>
                            <div className="text-right">
                                <p className={cn("text-sm font-bold tabular-nums", stat.stock < stat.req ? "text-danger" : "text-muted-foreground")}>
                                    {stat.req.toLocaleString()}kg
                                </p>
                                <p className="text-micro font-bold text-muted-foreground/50 uppercase tracking-widest mt-1">Requirement</p>
                            </div>
                        </div>
                        {stat.stock < stat.req && (
                            <div className="mt-4 px-2 py-1 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-2">
                                <Icon name="AlertTriangleIcon" size={10} className="text-danger" />
                                <span className="text-micro font-bold text-danger uppercase tracking-widest">Low Stock</span>
                            </div>
                        )}
                        <div className="mt-6 h-1 w-full bg-muted/20 rounded-full overflow-hidden">
                            <div className="h-full transition-[width] duration-1000" style={{ width: `${Math.min(100, (stat.stock / stat.req) * 100)}%`, backgroundColor: stat.color }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Feed Phase Timeline */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/5">
                    <div>
                        <h3 className="text-sm font-bold text-foreground tracking-widest uppercase">Feed Schedule</h3>
                        <p className="text-micro font-bold text-muted-foreground mt-1 uppercase tracking-widest">Feed status by phase</p>
                    </div>
                    <div className="flex gap-4">
                        {FEED_PHASES.map((p, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {activeCycles.map((cycle) => {
                        const dol = getDOL(cycle.startDate);
                        const currentPhase = FEED_PHASES.find(p => dol >= p.startDay && dol <= p.endDay) || FEED_PHASES[2];
                        const daysToTransition = currentPhase.endDay - dol;

                        return (
                            <div key={cycle.id} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-muted/30 border border-border flex items-center justify-center text-primary">
                                            <Icon name="CycleIcon" size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">{cycle.batchName}</h4>
                                            <p className="text-micro font-bold text-muted-foreground uppercase tracking-widest">Current Age: <span className="text-primary tabular-nums">DOL {dol}</span></p>
                                        </div>
                                    </div>
                                    {daysToTransition <= 3 && daysToTransition >= 0 && (
                                        <span className="text-micro font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-lg uppercase tracking-widest animate-pulse">
                                            Transitioning in {daysToTransition} Days
                                        </span>
                                    )}
                                </div>

                                <div className="relative pt-6">
                                    {/* Phase Track */}
                                    <div className="h-3 w-full bg-muted/30 rounded-full flex overflow-hidden border border-border/50">
                                        {FEED_PHASES.map((phase, i) => {
                                            const totalDays = FEED_PHASES[2].endDay;
                                            const width = ((phase.endDay - phase.startDay + 1) / totalDays) * 100;
                                            return (
                                                <div
                                                    key={i}
                                                    className="h-full border-r border-background/20 relative group/phase"
                                                    style={{ width: `${width}%`, backgroundColor: phase.color, opacity: dol >= phase.startDay ? 1 : 0.2 }}
                                                >
                                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/phase:opacity-100 transition-opacity" />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* DOL Pointer */}
                                    <div
                                        className="absolute top-0 flex flex-col items-center transition-[left] duration-1000"
                                        style={{ left: `${Math.min(98, (dol / FEED_PHASES[2].endDay) * 100)}%` }}
                                    >
                                        <div className="px-1.5 py-0.5 bg-foreground text-background text-[8px] font-black rounded mb-1 tabular-nums shadow-lg">
                                            LIVE
                                        </div>
                                        <div className="w-0.5 h-8 bg-foreground shadow-sm" />
                                    </div>

                                    {/* Phase Labels */}
                                    <div className="flex justify-between mt-2 px-1">
                                        {FEED_PHASES.map((phase, i) => (
                                            <span key={i} className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.25em]">
                                                {phase.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Transition Critical Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Icon name="AlertTriangleIcon" size={14} className="text-warning" />
                        Upcoming Transitions
                    </h3>
                    <div className="space-y-4">
                        {activeCycles.slice(0, 2).map((cycle, i) => (
                            <div key={i} className="p-4 bg-muted/10 border border-border/50 rounded-xl flex items-center justify-between group hover:bg-muted/20 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning border border-warning/20 flex items-center justify-center">
                                        <Icon name="TimeHighIcon" size={14} />
                                    </div>
                                    <div>
                                        <p className="text-micro font-bold text-foreground">{cycle.batchName}</p>
                                        <p className="text-micro font-bold text-muted-foreground uppercase tracking-widest">Move to Finisher Feed • 48h</p>
                                    </div>
                                </div>
                                <button className="px-3 py-1.5 bg-background border border-border rounded-lg text-micro font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors active:scale-95 shadow-sm">
                                    Verify Stock
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4">
                        <Icon name="AnalyticsIcon" size={24} />
                    </div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2">Inventory Tracking</h4>
                    <p className="text-micro font-medium text-muted-foreground leading-relaxed max-w-[280px]">
                        The system is tracking feed usage from <span className="text-primary font-bold">8 active silos</span> to help you plan your next order.
                    </p>
                    <button className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground text-micro font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95">
                        Update Projections
                    </button>
                </div>
            </div>
        </div>
    );
}
