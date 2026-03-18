import React from 'react';
import { MetricCard } from '@/components/shared';
import type { PerformanceStats } from '@/stores/usePerformanceStore';

interface KPIGridProps {
    stats: PerformanceStats | null;
}

const KPIGrid: React.FC<KPIGridProps> = ({ stats }) => {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <MetricCard
                title="Average FCR"
                value={stats.fcr.toFixed(2)}
                trend={{ value: 'Live', direction: 'neutral', label: 'Feed Efficiency' }}
                icon="AnalyticsIcon"
                iconColor="var(--success)"
            />
            <MetricCard
                title="Livability Rate"
                value={`${(stats.livability * 100).toFixed(2)}%`}
                trend={{ value: 'Live', direction: 'neutral', label: 'vs target' }}
                icon="HeartIcon"
                iconColor="var(--info)"
            />
            <MetricCard
                title="Avg EPEF Score"
                value={stats.epef.toFixed(0)}
                trend={{ value: `${stats.epefChange.toFixed(1)}%`, direction: stats.epefTrend === 'up' ? 'up' : stats.epefTrend === 'down' ? 'down' : 'neutral', label: 'vs prev batch' }}
                icon="TrophyIcon"
                iconColor="var(--warning)"
            />
            <MetricCard
                title="Avg Market Weight"
                value={`${stats.avgWeight.toFixed(2)} KG`}
                trend={{ value: 'Target 2.1', direction: 'neutral', label: 'Harvest Quality' }}
                icon="PackageIcon"
                iconColor="var(--primary)"
            />
        </div>
    );
};

export default KPIGrid;
