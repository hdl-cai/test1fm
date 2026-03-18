import { cn } from "@/lib/utils";

interface SeasonalityImpactChartProps {
    className?: string;
}

export function SeasonalityImpactChart({ className }: SeasonalityImpactChartProps) {
    const data = [1.2, 1.4, 1.8, 3.5, 6.2, 8.5, 7.8, 4.2, 3.1, 2.4, 1.6, 1.3]; // Mortality % per month
    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

    return (
        <div className={cn("bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full flex flex-col", className)}>
            <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Seasonality Impact</h3>
                        <p className="text-xs text-muted-foreground mt-1">Average Mortality Rate (%) per Month</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-danger/40 border border-danger/50 rounded"></span>
                        <span className="text-micro text-text-muted uppercase font-bold tracking-wider">Heat Stress Period</span>
                    </div>
                </div>

                <div className="flex-1 relative flex items-end justify-between gap-2 pt-8">
                    {/* Heat Stress Highlight Overlay */}
                    <div className="absolute top-8 bottom-12 left-[33%] right-[33%] bg-gradient-to-b from-danger/20 to-transparent border-x border-t border-danger/20 rounded-t-lg pointer-events-none flex flex-col items-center pt-2">
                        <span className="text-micro text-danger font-bold uppercase tracking-widest bg-surface-dark/80 px-2 py-1 rounded border border-danger/50">High Risk</span>
                    </div>

                    {/* Bars */}
                    {data.map((h, i) => {
                        const isHighRisk = i >= 4 && i <= 7;
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-end group h-full">
                                <div
                                    className={cn(
                                        "w-full rounded-t-sm transition-[width] duration-300",
                                        isHighRisk ? "bg-danger/80 group-hover:bg-danger" : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
                                    )}
                                    style={{ height: `${h * 8}%` }}
                                    title={`${months[i]}: ${h}% mortality`}
                                />
                                <div className="h-px bg-border-dark w-full mb-2 mt-px"></div>
                            </div>
                        )
                    })}
                </div>

                {/* X Axis */}
                <div className="flex justify-between mt-2 px-1">
                    {months.map((m, i) => (
                        <span key={i} className="text-micro text-text-muted font-medium w-full text-center">{m}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
