import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { usePerformanceStore } from "@/stores/usePerformanceStore";

interface CostDistributionChartProps {
    className?: string;
}

export function CostDistributionChart({ className }: CostDistributionChartProps) {
    const { costBreakdown } = usePerformanceStore();

    const total = costBreakdown.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className={cn("bg-card border border-border rounded-2xl shadow-sm overflow-hidden", className)}>
            <div className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-6">Cost Distribution</h3>
                <div className="h-[400px] md:h-[300px] w-full flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-1/2 h-[200px] md:h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={costBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {costBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--popover)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        color: 'var(--popover-foreground)'
                                    }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any) => `₱${Number(value).toLocaleString()}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 space-y-3 mt-4 md:mt-0">
                        {costBreakdown.length === 0 && (
                            <div className="text-center text-muted-foreground text-xs py-10">No expense data available</div>
                        )}
                        {costBreakdown.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs text-muted-foreground truncate max-w-[100px]">{item.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-foreground block">₱{(item.value / 1000).toFixed(1)}k</span>
                                    <span className="text-micro text-muted-foreground block">{total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
