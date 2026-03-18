import React from 'react';
import { Icon } from '@/hooks/useIcon';
import type { LeaderboardEntry } from '@/stores/usePerformanceStore';

interface TopGrowersProps {
    entries: LeaderboardEntry[];
}

const TopGrowers: React.FC<TopGrowersProps> = ({ entries }) => {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
    };

    const first = entries.find(g => g.rank === 1);
    const second = entries.find(g => g.rank === 2);
    const third = entries.find(g => g.rank === 3);

    if (!first) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-12 pb-4">

            {/* 2nd Place - Left (Desktop) */}
            {second && (
                <div className="order-2 md:order-1 animate-in fade-in slide-in-from-left-8 duration-1000 delay-300 fill-mode-both">
                    <div className="bg-card backdrop-blur-md rounded-2xl border border-border p-6 relative overflow-hidden shadow-xl flex flex-col items-center group hover:translate-y-[-4px] transition-all duration-500 hover:border-muted-foreground/30">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-400/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 flex flex-col items-center w-full">
                            <div className="relative mb-4">
                                <div className="w-20 h-20 rounded-full bg-muted border-4 border-muted-foreground/50 p-1 shadow-lg ring-1 ring-border">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-muted-foreground/40 to-muted-foreground/60 flex items-center justify-center text-lg font-black text-foreground">
                                        {getInitials(second.growerName)}
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-1 w-8 h-8 bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/50 rounded-full flex items-center justify-center shadow-lg border-2 border-card">
                                    <span className="text-foreground font-black text-xs font-data">2</span>
                                </div>
                            </div>
                            <h3 className="text-lg font-black text-foreground text-center leading-tight tracking-tight">{second.growerName}</h3>
                            <p className="text-micro text-muted-foreground font-bold text-center mb-6 uppercase tracking-widest">Efficiency: {second.efficiency.toFixed(1)}%</p>

                            <div className="grid grid-cols-2 gap-2 w-full text-center border-t border-border pt-5 pb-2">
                                <div>
                                    <span className="block text-micro text-muted-foreground uppercase font-black tracking-widest mb-1">Points</span>
                                    <span className="block text-sm font-black text-foreground font-data">{second.points.toLocaleString()}</span>
                                </div>
                                <div className="bg-success/10 rounded-lg py-1 border border-success/20 shadow-[0_0_15px_rgba(var(--success-rgb),0.1)]">
                                    <span className="block text-micro text-success uppercase font-black tracking-widest mb-1">EPEF</span>
                                    <span className="block text-sm font-black text-success font-data">{second.epef}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 1st Place - Center (Desktop) - Higher & Bigger */}
            <div className="order-1 md:order-2 -mt-12 relative z-20 animate-in fade-in zoom-in-95 duration-1000 fill-mode-both">
                <div className="absolute inset-0 bg-yellow-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none"></div>

                <div className="bg-card/60 backdrop-blur-xl rounded-3xl border-2 border-yellow-500/30 p-8 relative overflow-visible shadow-[0_0_50px_rgba(234,179,8,0.1)] transform md:scale-110 hover:scale-[1.12] transition-all duration-500 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl -mr-12 -mt-12 overflow-hidden pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -ml-12 -mb-12 overflow-hidden pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center w-full">
                        <div className="relative mb-6">
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                                <div className="animate-bounce-slow">
                                    <Icon
                                        name="AwardIcon"
                                        size={56}
                                        className="text-yellow-400"
                                    />
                                </div>
                            </div>
                            <div className="w-28 h-28 rounded-full bg-card border-4 border-yellow-400 p-1.5 shadow-[0_0_30px_rgba(234,179,8,0.2)] ring-2 ring-yellow-400/20">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300/20 to-yellow-600/20 text-yellow-400 flex items-center justify-center text-3xl font-black">
                                    {getInitials(first.growerName)}
                                </div>
                            </div>
                            <div className="absolute -bottom-3 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-xl border-4 border-card">
                                <span className="text-black font-black text-xl font-data">1</span>
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-foreground text-center leading-none tracking-tight mb-1">{first.growerName}</h3>
                        <p className="text-xs text-muted-foreground font-black text-center mb-8 uppercase tracking-[0.3em]">Efficiency: {first.efficiency.toFixed(1)}%</p>

                        <div className="grid grid-cols-2 gap-4 w-full text-center border-t border-border pt-6 pb-2">
                            <div className="flex flex-col items-center">
                                <span className="block text-micro text-muted-foreground uppercase font-black tracking-widest mb-1">Points</span>
                                <span className="block text-xl font-black text-foreground font-data">{first.points.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col items-center p-2 rounded-2xl bg-success/10 border border-success/20 shadow-[0_0_25px_rgba(var(--success-rgb),0.2)]">
                                <span className="block text-micro text-success uppercase font-black tracking-widest mb-1">EPEF</span>
                                <span className="block text-2xl font-black text-success drop-shadow-[0_0_8px_rgba(var(--success-rgb),0.4)] font-data">{first.epef}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3rd Place - Right (Desktop) */}
            {third && (
                <div className="order-3 md:order-3 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500 fill-mode-both">
                    <div className="bg-card backdrop-blur-md rounded-2xl border border-border p-6 relative overflow-hidden shadow-xl flex flex-col items-center group hover:translate-y-[-4px] transition-all duration-500 hover:border-orange-500/30">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 flex flex-col items-center w-full">
                            <div className="relative mb-4">
                                <div className="w-20 h-20 rounded-full bg-card border-4 border-orange-400/50 p-1 shadow-lg ring-1 ring-border">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-800/40 to-orange-900/40 flex items-center justify-center text-lg font-black text-orange-200">
                                        {getInitials(third.growerName)}
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-1 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-2 border-card">
                                    <span className="text-foreground font-black text-xs font-data">3</span>
                                </div>
                            </div>
                            <h3 className="text-lg font-black text-foreground text-center leading-tight tracking-tight">{third.growerName}</h3>
                            <p className="text-micro text-muted-foreground font-bold text-center mb-6 uppercase tracking-widest">Efficiency: {third.efficiency.toFixed(1)}%</p>

                            <div className="grid grid-cols-2 gap-2 w-full text-center border-t border-border pt-5 pb-2">
                                <div>
                                    <span className="block text-micro text-muted-foreground uppercase font-black tracking-widest mb-1">Points</span>
                                    <span className="block text-sm font-black text-foreground font-data">{third.points.toLocaleString()}</span>
                                </div>
                                <div className="bg-success/10 rounded-lg py-1 border border-success/20 shadow-[0_0_15px_rgba(var(--success-rgb),0.1)]">
                                    <span className="block text-micro text-success uppercase font-black tracking-widest mb-1">EPEF</span>
                                    <span className="block text-sm font-black text-success font-data">{third.epef}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopGrowers;
