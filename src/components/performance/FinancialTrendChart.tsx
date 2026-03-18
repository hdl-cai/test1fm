import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { usePerformanceStore } from "@/stores/usePerformanceStore";

interface FinancialTrendChartProps {
    className?: string;
}

export function FinancialTrendChart({ className }: FinancialTrendChartProps) {
    const { financialHistory } = usePerformanceStore();

    return (
        <div className={cn("bg-card border border-border rounded-xl shadow-sm overflow-hidden", className)}>
            <div className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-6">Financial Performance Trend</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={financialHistory}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                                tickFormatter={(value) => `₱${(value / 1000).toLocaleString()}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--popover)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: 'var(--popover-foreground)'
                                }}
                                formatter={(value: any) => `₱${Number(value).toLocaleString()}`}
                            />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', textTransform: 'uppercase' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Gross Revenue" />
                            <Area type="monotone" dataKey="profit" stroke="hsl(var(--chart-1))" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" name="Net Profit" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
