import { cn } from "@/lib/utils";
import { useState } from "react";
import { Icon } from "@/hooks/useIcon";
import type { LeaderboardEntry } from "@/stores/usePerformanceStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

interface BonusCalculatorProps {
    growers: LeaderboardEntry[];
    className?: string;
}

export function BonusCalculator({ growers, className }: BonusCalculatorProps) {
    const [selectedId, setSelectedId] = useState(growers[0]?.id || '');
    const [adjustedBirdCount, setAdjustedBirdCount] = useState<number | ''>('');
    const { orgSettings, epefBrackets } = useSettingsStore();

    const selected = growers.find(g => g.id === selectedId) || growers[0];

    const epef = selected?.epef || 0;
    const birdCount = adjustedBirdCount !== '' ? adjustedBirdCount : 10500;
    const baseIncentive = orgSettings?.base_incentive_per_bird ?? 4.50;

    // Find applicable EPEF bracket from org settings
    const sortedBrackets = [...epefBrackets].sort((a, b) => (b.min_epef ?? 0) - (a.min_epef ?? 0));
    const matchedBracket = sortedBrackets.find(
        b => epef >= (b.min_epef ?? 0) && epef <= (b.max_epef ?? Infinity)
    );

    // Determine tier label and next threshold
    const tierLabel = matchedBracket?.description || 'Standard';
    const currentRate = matchedBracket?.incentive_rate_per_head ?? baseIncentive;

    // Find next bracket above current EPEF
    const nextBracket = sortedBrackets
        .filter(b => (b.min_epef ?? 0) > epef)
        .sort((a, b) => (a.min_epef ?? 0) - (b.min_epef ?? 0))[0];

    const nextTierLabel = nextBracket
        ? `${nextBracket.description ?? 'Next Tier'} (>${nextBracket.min_epef})`
        : 'Maximum tier reached';
    const nextThreshold = nextBracket?.min_epef ?? Math.round(epef) + 1;
    const progress = Math.min((epef / nextThreshold) * 100, 100);

    const totalBonus = (typeof birdCount === 'number' ? birdCount : 0) * currentRate;

    return (
        <div className={cn("bg-card rounded-xl border border-border p-8 shadow-lg", className)}>
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Icon name="CalculatorIcon" size={30} className="text-primary" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-foreground">Bonus Calculator</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Informational estimate based on org EPEF brackets and base incentive rate.
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

                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                            Bird Count
                        </label>
                        <input
                            type="number"
                            min={1}
                            placeholder="e.g. 10500"
                            value={adjustedBirdCount}
                            onChange={(e) => setAdjustedBirdCount(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full bg-muted border border-border text-sm rounded-lg p-3 text-foreground focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted border border-border rounded-xl p-4 text-center">
                            <p className="text-micro uppercase font-bold text-muted-foreground mb-1">EPEF SCORE</p>
                            <p className="text-3xl font-bold text-primary">{Math.round(epef)}</p>
                        </div>
                        <div className="bg-muted border border-border rounded-xl p-4 text-center">
                            <p className="text-micro uppercase font-bold text-muted-foreground mb-1">BIRDS</p>
                            <p className="text-3xl font-bold text-foreground">{(typeof birdCount === 'number' ? birdCount : 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center space-y-4 lg:px-8 lg:border-x lg:border-border">
                    <div className="flex justify-between items-center text-sm py-2 border-b border-dashed border-border">
                        <span className="text-muted-foreground">Base Incentive Rate</span>
                        <span className="text-foreground font-mono font-medium">₱ {baseIncentive.toFixed(2)} / bird</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-2 border-b border-dashed border-border">
                        <span className="text-muted-foreground">Applicable Bracket</span>
                        <span className="text-primary font-mono font-medium">{tierLabel}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-2">
                        <span className="text-muted-foreground">Rate Per Bird</span>
                        <span className="text-foreground font-mono font-medium">₱ {currentRate.toFixed(3)}</span>
                    </div>
                    {epefBrackets.length === 0 && (
                        <p className="text-micro text-amber-500 mt-2">
                            No EPEF brackets configured. Rates use the base incentive only. Configure brackets in Settings → Performance.
                        </p>
                    )}
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
                                Current: <span className="text-foreground font-semibold">{tierLabel}</span>
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
                            {nextBracket
                                ? `${nextThreshold - Math.round(epef)} EPEF points to next bracket`
                                : 'Maximum bracket reached'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
