import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/hooks/useIcon';
import { usePerformanceStore } from '@/stores/usePerformanceStore';
import { useAuthStore } from '@/stores/useAuthStore';

const GrowerTable: React.FC = () => {
    const { user } = useAuthStore();
    const { leaderboard, isLoading, fetchPerformanceData } = usePerformanceStore();

    React.useEffect(() => {
        if (user?.orgId) {
            fetchPerformanceData(user.orgId);
        }
    }, [user?.orgId, fetchPerformanceData]);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
    };

    if (isLoading && leaderboard.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="loader" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Grower Leaderboard</h3>
                    <span className="px-2 py-0.5 rounded-[4px] text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase font-data">
                        {leaderboard.length} TOTAL
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Icon
                            name="SearchIcon"
                            size={14}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            type="text"
                            placeholder="Search growers..."
                            className="pl-9 w-64 bg-muted/30 border border-border text-foreground placeholder-muted-foreground/50 focus:border-primary focus:ring-0 text-xs rounded-lg h-9 outline-none transition-colors transition-[width] transition-[height]"
                        />
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest">Rank</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest">Grower Profile</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right">EPEF</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right">Efficiency</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right">Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {leaderboard.map((grower, index) => (
                                <tr key={`${grower.id}-${index}`} className="hover:bg-row-hover transition-colors group bg-background">
                                    <td className="px-6 py-4">
                                        <div className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground font-black text-micro border border-border/50 shadow-inner transition-colors font-data">
                                            {grower.rank.toString().padStart(2, '0')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-9 w-9 rounded-xl bg-muted/50 text-primary flex items-center justify-center font-black text-micro border border-border/50 mr-3 shadow-inner transition-transform">
                                                {getInitials(grower.growerName)}
                                            </div>
                                            <div>
                                                <p className="font-black text-foreground transition-colors text-xs uppercase tracking-tight">
                                                    {grower.growerName}
                                                </p>
                                                <p className="text-micro text-muted-foreground/40 font-black uppercase tracking-widest italic mt-0.5 font-data">ID: {grower.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                         <span className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border font-data",
                                            grower.status === 'Elite' ? "bg-success/10 text-success border-success/20" : 
                                            grower.status === 'Senior' ? "bg-info/10 text-info border-info/20" : 
                                            "bg-muted text-muted-foreground border-border"
                                         )}>
                                            {grower.status}
                                         </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-foreground text-xs tabular-nums font-data">{grower.epef}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary transition-all duration-1000" 
                                                    style={{ width: `${grower.efficiency}%` }}
                                                />
                                            </div>
                                            <span className="text-micro font-black text-muted-foreground font-data">{grower.efficiency.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-micro font-black bg-primary/5 text-primary/70 border border-primary/10 tracking-widest uppercase font-data">
                                            {grower.points.toLocaleString()} PTS
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GrowerTable;
