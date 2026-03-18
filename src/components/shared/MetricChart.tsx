/**
 * MetricChart Component
 * 
 * A Recharts line chart wrapper for displaying performance metrics
 * Supports dark mode, multiple data series, and time period toggles
 */

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Icon } from '@/hooks/useIcon';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface ChartSeries {
  key: string;
  name: string;
  color: string;
  unit?: string;
}

interface MetricChartProps {
  title: string;
  subtitle?: string;
  data: ChartDataPoint[];
  series: ChartSeries[];
  periods?: { label: string; value: string }[];
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
  className?: string;
  height?: number;
}

interface PayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

// ... imports
interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
  seriesConfig: ChartSeries[];
}

function CustomTooltip({ active, payload, label, seriesConfig }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/90 border border-border/50 rounded-xl p-4 shadow-xl backdrop-blur-md">
        <p className="text-micro font-bold text-muted-foreground mb-3 uppercase tracking-widest border-b border-border/50 pb-2">{label}</p>
        <div className="space-y-2.5">
          {payload.map((entry: PayloadItem, index: number) => {
            const config = seriesConfig.find(s => s.key === entry.dataKey);
            return (
              <div key={index} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full ring-2 ring-white/10"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-micro font-medium text-muted-foreground">{entry.name}</span>
                </div>
                <span className="text-xs font-black text-foreground font-mono">
                  {entry.value}{config?.unit ? ` ${config.unit}` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}

export function MetricChart({
  title,
  subtitle,
  data,
  series,
  periods,
  activePeriod,
  onPeriodChange,
  className,
  height = 300,
}: MetricChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(activePeriod || periods?.[0]?.value);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  return (
    <Card className={cn('bg-card border-border p-6 flex flex-col shadow-sm', className)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</h3>
          {subtitle && <p className="text-micro text-muted-foreground font-medium mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {/* Optimal Condition Badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-micro font-black bg-success/10 text-success border border-success/20 mr-2 uppercase tracking-wide shadow-sm shadow-success/5">
            <Icon name="TrendingUpIcon" size={12} className="mr-1.5" />
            Optimal
          </span>

          {periods && periods.length > 0 && (
            <div className="flex bg-muted/30 rounded-lg p-1 border border-border">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => handlePeriodChange(period.value)}
                  className={cn(
                    'px-3.5 py-1 text-micro font-bold uppercase tracking-wider rounded-md transition-colors duration-200',
                    selectedPeriod === period.value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                {series.map((s) => (
                  <linearGradient key={`grad-${s.key}`} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={s.color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--border)"
                strokeOpacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                dy={15}
              />
              <YAxis
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                content={<CustomTooltip seriesConfig={series} />}
                cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
              />
              {series.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#gradient-${s.key})`}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex justify-center flex-wrap gap-6 mt-6 pt-5 border-t border-border/40 border-dashed">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/10 border border-border/20">
            <span className="w-2 h-2 rounded-full ring-2 ring-white/5" style={{ backgroundColor: s.color }}></span>
            <span className="text-micro font-bold text-muted-foreground uppercase tracking-wide">{s.name} {s.unit && <span className="text-muted-foreground ml-0.5">({s.unit})</span>}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default MetricChart;
