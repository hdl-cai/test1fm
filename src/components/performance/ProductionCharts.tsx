import React from 'react';
import { usePerformanceStore } from '@/stores/usePerformanceStore';
import type { ChartDataPoint } from '@/stores/usePerformanceStore';
import { Icon } from '@/hooks/useIcon';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    BarChart,
    Bar,
    Cell
} from 'recharts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const val = payload[0].value;
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-xl backdrop-blur-md">
                <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">{label}</p>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${typeof val === 'number' && val <= 1.55 ? 'bg-primary' : 'bg-destructive'}`}></div>
                    <p className="text-sm font-mono text-foreground">
                        FCR: <span className="font-bold">{typeof val === 'number' ? val.toFixed(2) : val}</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ComparativeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
                <p className="text-micro font-bold text-muted-foreground mb-2 uppercase tracking-tighter">{label}</p>
                {(payload as { name: string; value: number }[]).map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-6 mb-1 last:mb-0">
                        <span className="text-xs text-muted-foreground font-medium">{p.name}</span>
                        <span className="text-xs font-mono font-bold text-foreground">{p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

interface ChartProps {
    data: ChartDataPoint[];
}

const FCRTrendChart: React.FC<ChartProps> = ({ data }) => {
    return (
        <div className="bg-card backdrop-blur-md rounded-2xl border border-border p-6 shadow-xl relative overflow-hidden transition-all duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">Feed Conversion History (FCR)</h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></span>
                        Historical flock performance vs Target (1.55)
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-micro uppercase font-bold tracking-widest text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary/50 shadow-[0_0_10px_rgba(var(--color-primary),0.2)]"></span>
                        <span>Below Target</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-destructive/20 border border-destructive/50 shadow-[0_0_10px_rgba(var(--color-destructive),0.2)]"></span>
                        <span>Above Target</span>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.map(d => ({ month: d.label, value: d.value }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorFcr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 600 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
                        <ReferenceLine
                            y={1.55}
                            stroke="hsl(var(--chart-2))"
                            strokeDasharray="5 5"
                            strokeWidth={1.5}
                            label={{ position: 'right', value: 'TARGET', fill: 'hsl(var(--chart-2))', fontSize: 10, fontWeight: 800 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(var(--chart-2))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorFcr)"
                            animationDuration={1500}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            dot={(props: any) => {
                                const { cx, cy, value } = props;
                                return (
                                    <circle
                                        key={`dot-${cx}-${cy}`}
                                        cx={cx} cy={cy} r={4}
                                        fill={value <= 1.55 ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-3))'}
                                        stroke="var(--card)" strokeWidth={2}
                                    />
                                );
                            }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--foreground)' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const SeasonalityChart: React.FC<ChartProps> = ({ data }) => {
    return (
        <div className="bg-card backdrop-blur-md rounded-2xl border border-border p-6 shadow-lg h-full flex flex-col group hover:border-border/50 transition-all duration-500">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">Mortality Trends</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Historical Mortality Rate (%) over time</p>
                </div>
                <div className="flex items-center gap-2 bg-destructive/10 px-2 py-1 rounded border border-destructive/20">
                    <span className="w-1.5 h-1.5 bg-destructive rounded-full animate-pulse"></span>
                    <span className="text-micro text-destructive uppercase font-black tracking-widest">Performance Alert</span>
                </div>
            </div>

            <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.map(d => ({ name: d.label, val: d.value }))} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(var(--foreground), 0.03)' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-popover border border-border p-2 rounded shadow-lg">
                                            <p className="text-micro font-bold text-foreground">{payload[0].value.toFixed(1)}% Mortality</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="val"
                            radius={[4, 4, 0, 0]}
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.value > 5 ? '#EF4444' : '#374151'}
                                    opacity={0.8}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
                <p className="text-micro text-muted-foreground text-center font-medium italic">
                    Historical data reflects overall health trends across batches.
                </p>
            </div>
        </div>
    );
};

const ComparativeChart = () => {
    // This could still be a mix, but we'll show some fixed comparisons or dynamic ones if we had them.
    // For now, let's keep it as static but cleaned up to acknowledge live context.
    const data = [
        { name: 'Feed Conversion', brandA: 1.55, brandB: 1.62 },
        { name: 'Avg. Body Weight', brandA: 2.45, brandB: 2.30 },
        { name: 'Efficiency Score', brandA: 385, brandB: 360 },
    ];

    return (
        <div className="bg-card backdrop-blur-md rounded-2xl border border-border p-6 shadow-lg h-full flex flex-col group hover:border-border/50 transition-all duration-500">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">Performance Comparison</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Comparison: System Targets vs History</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-primary rounded shadow-[0_0_8px_rgba(var(--color-primary),0.3)]"></span>
                        <span className="text-micro text-muted-foreground font-bold uppercase tracking-widest">Brand A</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-blue-500 rounded shadow-[0_0_8px_rgba(59,130,246,0.3)]"></span>
                        <span className="text-micro text-muted-foreground font-bold uppercase tracking-widest">Brand B</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 600 }}
                        />
                        <YAxis hide />
                        <Tooltip
                            cursor={{ fill: 'rgba(var(--foreground), 0.03)' }}
                            content={ComparativeTooltip}
                        />
                        <Bar dataKey="brandA" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={32} animationDuration={1500} />
                        <Bar dataKey="brandB" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} barSize={32} animationDuration={1500} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const ProductionCharts: React.FC = () => {
    const { fcrHistory, mortalityHistory } = usePerformanceStore();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="w-full flex items-center justify-between mb-2">
                <div className="relative group">
                    <select className="w-64 bg-muted border border-border text-sm rounded-xl pl-4 pr-10 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer focus:outline-none shadow-xl transition-all hover:bg-muted font-semibold">
                        <option>Overall Summary (All Farms)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground group-hover:text-primary transition-colors">
                        <Icon name="ArrowDown01Icon" size={18} />
                    </div>
                </div>
            </div>

            <FCRTrendChart data={fcrHistory} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SeasonalityChart data={mortalityHistory} />
                <ComparativeChart />
            </div>
        </div>
    );
};

export default ProductionCharts;
