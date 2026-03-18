import { cn } from "@/lib/utils";

interface InputPerformanceChartProps {
    className?: string;
}

export function InputPerformanceChart({ className }: InputPerformanceChartProps) {
    return (
        <div className={cn("bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full", className)}>
            <div className="p-6 flex flex-col h-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Comparative Input Performance</h3>
                        <p className="text-xs text-muted-foreground mt-1">Avg. Weight (kg) - Feed Brand vs Breed</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-primary rounded-sm"></span>
                            <span className="text-micro text-text-muted font-bold uppercase tracking-wide">Brand A</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-blue-500 rounded-sm"></span>
                            <span className="text-micro text-text-muted font-bold uppercase tracking-wide">Brand B</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex items-end justify-around pb-4 relative min-h-[250px] pt-12">
                    {/* Grid lines background */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0 py-4 pt-12">
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className="w-full h-px bg-border-dark" />
                        ))}
                    </div>

                    {/* Group 1: Cobb 500 */}
                    <div className="flex flex-col items-center gap-4 z-10 h-full w-full">
                        <div className="flex gap-4 items-end h-full w-full justify-center">
                            <div className="w-12 md:w-16 bg-primary rounded-t-lg shadow-[0_0_15px_rgba(16,185,129,0.2)] h-[55%] relative group transition-colors transition-transform transition-shadow transition-[width] transition-[height] hover:brightness-110 hover:scale-[1.02]" />
                            <div className="w-12 md:w-16 bg-blue-500 rounded-t-lg shadow-[0_0_15px_rgba(59,130,246,0.2)] h-[50%] relative group transition-colors transition-transform transition-shadow transition-[width] transition-[height] hover:brightness-110 hover:scale-[1.02]" />
                        </div>
                        <span className="text-micro font-bold text-text-muted uppercase">Cobb 500</span>
                    </div>

                    <div className="h-full w-px bg-border-dark z-0 mx-4" />

                    {/* Group 2: Ross 308 (Winner) */}
                    <div className="flex flex-col items-center gap-4 z-10 h-full w-full">
                        <div className="flex gap-4 items-end h-full w-full justify-center">
                            <div className="w-12 md:w-16 bg-primary rounded-t-lg shadow-[0_0_15px_rgba(16,185,129,0.2)] h-[90%] relative group transition-colors transition-transform transition-shadow transition-[width] transition-[height] hover:brightness-110 hover:scale-[1.02] flex justify-center">
                                <div className="absolute -top-10 animate-bounce">
                                    <span
                                        className="material-symbols-outlined text-yellow-400 text-2xl drop-shadow-lg"
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        emoji_events
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 md:w-16 bg-blue-500 rounded-t-lg shadow-[0_0_15px_rgba(59,130,246,0.2)] h-[85%] relative group transition-colors transition-transform transition-shadow transition-[width] transition-[height] hover:brightness-110 hover:scale-[1.02]" />
                        </div>
                        <span className="text-micro font-bold text-text-muted uppercase">Ross 308</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
