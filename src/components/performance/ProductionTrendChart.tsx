import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";

interface ProductionTrendChartProps {
    data: { date: string; fcr: number }[];
    className?: string;
}

export function ProductionTrendChart({ data, className }: ProductionTrendChartProps) {
    const TARGET_FCR = 1.55;

    return (
        <div className={cn("bg-card border border-border rounded-xl shadow-sm overflow-hidden", className)}>
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-white">FCR Trend Analysis</h3>
                        <p className="text-xs text-text-muted mt-1">Rolling 12-month flock performance vs Target ({TARGET_FCR})</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-micro font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-text-muted">Below Target (Good)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                            <span className="text-text-muted">Above Target (Alert)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-0.5 border-t border-dashed border-primary/50"></span>
                            <span className="text-text-muted">Target Line</span>
                        </div>
                    </div>
                </div>

                <div className="h-75 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorFcr" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2C2B" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 500 }}
                                domain={[1.4, 1.8]}
                                ticks={[1.4, 1.5, 1.6, 1.7, 1.8]}
                            />
                            <Tooltip
                                content={(props: any) => {
                                    const { active, payload } = props;
                                    if (active && payload && payload.length) {
                                        const val = payload[0].value as number;
                                        return (
                                            <div className="bg-surface-dark border border-border-dark p-3 rounded-lg shadow-xl">
                                                <p className="text-micro text-text-muted uppercase font-bold mb-1">{payload[0].payload.date}</p>
                                                <p className={cn("text-sm font-bold", val <= TARGET_FCR ? "text-primary" : "text-danger")}>
                                                    FCR: {val.toFixed(2)}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <ReferenceLine
                                y={TARGET_FCR}
                                stroke="#10B981"
                                strokeDasharray="6 4"
                                strokeWidth={2}
                                label={{
                                    value: 'TARGET',
                                    position: 'right',
                                    fill: '#10B981',
                                    fontSize: 10,
                                    fontWeight: 'bold'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="fcr"
                                stroke="#6B7280"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorFcr)"
                                dot={(props: any) => {
                                    const { cx, cy, value } = props;
                                    return (
                                        <circle
                                            key={`dot-${cx}-${cy}`}
                                            cx={cx}
                                            cy={cy}
                                            r={4}
                                            fill={value <= TARGET_FCR ? "#10B981" : "#EF4444"}
                                            stroke="#111312"
                                            strokeWidth={2}
                                        />
                                    );
                                }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
