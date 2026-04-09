import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/stores/usePerformanceStore';

interface GrowerComparisonChartProps {
  growers: LeaderboardEntry[];
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-xs">
        <p className="font-bold text-foreground mb-1">{label}</p>
        <p className="text-muted-foreground">
          EPEF: <span className="font-bold text-primary">{payload[0]?.value}</span>
        </p>
        <p className="text-muted-foreground">
          Tier: <span className="font-bold text-foreground">{payload[0]?.payload?.status}</span>
        </p>
      </div>
    );
  }
  return null;
};

const TIER_COLORS: Record<string, string> = {
  Elite: 'hsl(var(--warning))',
  Senior: 'hsl(var(--chart-1))',
  Junior: 'hsl(var(--chart-2))',
  Training: 'hsl(var(--muted-foreground))',
};

export function GrowerComparisonChart({ growers, className }: GrowerComparisonChartProps) {
  const available = growers.slice(0, 10);
  const defaultSelected = available.slice(0, Math.min(5, available.length)).map((g) => g.id);
  const [selected, setSelected] = useState<string[]>(defaultSelected);

  const toggleGrower = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 6
        ? [...prev, id]
        : prev
    );
  };

  const chartData = available
    .filter((g) => selected.includes(g.id))
    .map((g) => ({
      name: g.growerName.split(' ')[0],
      epef: Math.round(g.epef),
      status: g.status,
      id: g.id,
    }));

  if (growers.length === 0) {
    return (
      <div className={cn('bg-card border border-border rounded-xl p-6 flex items-center justify-center min-h-75', className)}>
        <p className="text-sm text-muted-foreground text-center">
          No grower data available yet. Close at least one cycle to see comparisons.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col', className)}>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground">Grower EPEF Comparison</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Select up to 6 growers to compare (tap to toggle)
        </p>
      </div>

      {/* Grower toggle pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {available.map((g) => {
          const isOn = selected.includes(g.id);
          return (
            <button
              key={g.id}
              onClick={() => toggleGrower(g.id)}
              className={cn(
                'px-3 py-1 rounded-full text-micro font-bold uppercase tracking-wide border transition-colors',
                isOn
                  ? 'bg-primary/10 border-primary/40 text-primary'
                  : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/60'
              )}
            >
              {g.growerName.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-50">
          <p className="text-sm text-muted-foreground">Select at least one grower to display the chart.</p>
        </div>
      ) : (
        <div className="h-65 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="epef" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={TIER_COLORS[entry.status] ?? 'hsl(var(--primary))'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tier legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
        {Object.entries(TIER_COLORS).map(([tier, color]) => (
          <div key={tier} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-micro text-muted-foreground font-bold uppercase tracking-wide">{tier}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
