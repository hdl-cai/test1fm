import React from 'react';
import { Icon } from '@/hooks/useIcon';
import type { PerformanceStats } from '@/stores/usePerformanceStore';

interface GrowerStatsProps {
    stats: PerformanceStats | null;
}

const GrowerStats: React.FC<GrowerStatsProps> = ({ stats }) => {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-5 rounded-xl border border-border flex items-center justify-between hover:bg-muted/50 transition-colors cursor-default">
                <div>
                    <p className="text-3xl font-bold text-foreground">{(stats.livability * 100).toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        Avg. Livability
                    </p>
                </div>
                <div className="h-10 w-10 bg-info/20 rounded-full flex items-center justify-center text-info">
                    <Icon name="HeartIcon" size={20} />
                </div>
            </div>

            <div className="bg-card p-5 rounded-xl border border-border flex items-center justify-between hover:bg-muted/50 transition-colors cursor-default">
                <div>
                    <p className="text-3xl font-bold text-foreground">{stats.fcr.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        Avg. Company FCR
                    </p>
                </div>
                <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    <Icon name="AnalyticsIcon" size={20} />
                </div>
            </div>

            <div className="bg-card p-5 rounded-xl border border-border flex items-center justify-between hover:bg-muted/50 transition-colors cursor-default">
                <div>
                    <p className="text-3xl font-bold text-foreground">{stats.epef.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        Company EPEF
                    </p>
                </div>
                <div className="h-10 w-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400">
                    <Icon name="TrophyIcon" size={20} />
                </div>
            </div>
        </div>
    );
};

export default GrowerStats;
