import { cn } from "@/lib/utils";
import { useState } from "react";
import { Icon } from "@/hooks/useIcon";
import type { LeaderboardEntry } from "@/stores/usePerformanceStore";

interface BonusCalculatorProps {
    growers: LeaderboardEntry[];
    className?: string;
}

export function BonusCalculator({ growers, className }: BonusCalculatorProps) {
    const [selectedId, setSelectedId] = useState(growers[0]?.id || '');
    const selected = growers.find(g => g.id === selectedId) || growers[0];

    const epef = selected?.epef || 0;
    const birdCount = 10500; // Standard batch size for simulation
    const baseIncentive = 4.50; // Standard base incentive per bird

    // Multiplier logic based on EPEF (Standard industry tiers)
    let multiplier = 1.0;
    let tier = "Standard";
    let nextTierLabel = "Silver (>350)";
    let nextThreshold = 350;

    if (epef >= 400) {
        multiplier = 1.25;
        tier = "Gold Tier";
        nextTierLabel = "Platinum (>420)";
        nextThreshold = 420;
    } else if (epef >= 350) {
        multiplier = 1.15;
        tier = "Silver Tier";
        nextTierLabel = "Gold (>400)";
        nextThreshold = 400;
    }

    const totalRate = baseIncentive * multiplier;
    const totalBonus = birdCount * totalRate;
    const progress = Math.min((epef / nextThreshold) * 100, 100);

    return (
        <div className={cn("bg-card rounded-xl border border-border p-8 shadow-lg", className)}>
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Icon name="CalculatorIcon" size={30} className="text-primary" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-foreground">Bonus Calculator</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Estimate dynamic incentives based on grower EPEF performance.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                            Select Grower
                        </label>
                        <div className="relative">
                            <select
                                value={selectedId}
                                onChange={(e) => setSelectedId(e.target.value)}
                                className="w-full bg-muted border border-border text-sm rounded-lg p-4 text-foreground focus:ring-1 focus:ring-primary focus:border-primary appearance-none transition-colors focus:outline-none"
                            >
                                {growers.map((g, index) => (
                                    <option key={`${g.id}-${index}`} value={g.id}>
                                        {g.growerName} (Rank #{g.rank})
                                    </option>
                                ))}
                            </select>
                            <span className="absolute right-4 top-4 text-muted-foreground pointer-events-none">
                                <Icon name="ArrowDown01Icon" size={18} />
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted border border-border rounded-xl p-4 text-center">
                            <p className="text-micro uppercase font-bold text-muted-foreground mb-1">EPEF SCORE</p>
                            <p className="text-3xl font-bold text-primary">{Math.round(epef)}</p>
                        </div>
                        <div className="bg-muted border border-border rounded-xl p-4 text-center">
                            <p className="text-micro uppercase font-bold text-muted-foreground mb-1">BIRDS</p>
                            <p className="text-3xl font-bold text-foreground">{birdCount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center space-y-4 lg:px-8 lg:border-x lg:border-border">
                    <div className="flex justify-between items-center text-sm py-2 border-b border-dashed border-border">
                        <span className="text-muted-foreground">Base Incentive</span>
                        <span className="text-foreground font-mono font-medium">₱ {baseIncentive.toFixed(2)} / bird</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-2 border-b border-dashed border-border">
                        <span className="text-muted-foreground">Performance Multiplier</span>
                        <span className="text-primary font-mono font-medium">x {multiplier.toFixed(2)} ({tier})</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-2">
                        <span className="text-muted-foreground">Total Rate per Bird</span>
                        <span className="text-foreground font-mono font-medium">₱ {totalRate.toFixed(3)}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center flex-1 flex flex-col justify-center">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                            ESTIMATED TOTAL BONUS
                        </p>
                        <p className="text-4xl font-bold text-foreground tracking-tight">
                            ₱ {Math.floor(totalBonus).toLocaleString()}<span className="text-2xl text-muted-foreground font-normal">.{(totalBonus % 1).toFixed(2).split('.')[1]}</span>
                        </p>
                    </div>
                    <div className="bg-muted border border-border rounded-xl p-5">
                        <div className="flex justify-between text-xs mb-3">
                            <span className="text-muted-foreground">
                                Current: <span className="text-foreground font-semibold">{tier}</span>
                            </span>
                            <span className="text-muted-foreground">
                                Next: <span className="text-primary font-semibold">{nextTierLabel}</span>
                            </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5 mb-2 relative overflow-hidden">
                            <div
                                className="bg-primary h-full rounded-full relative transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-micro text-muted-foreground text-right uppercase tracking-widest">
                            {nextThreshold - Math.round(epef) > 0
                                ? `${nextThreshold - Math.round(epef)} points to next multiplier`
                                : 'Maximum multiplier reached'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
