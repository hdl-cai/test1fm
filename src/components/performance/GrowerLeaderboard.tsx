import { cn } from "@/lib/utils";
import { Icon } from "@/hooks/useIcon";
import type { GrowerPerformance, Person } from "@/types";

interface GrowerLeaderboardProps {
    data: (GrowerPerformance & { epef: number; person?: Person })[];
    className?: string;
}

interface PodiumEntry {
    epef: number;
    person?: Person;
    averageFCR: number;
    averageMortality: number;
}

const Podium = ({ entry, rank }: { entry: PodiumEntry | undefined; rank: number }) => {
    if (!entry) return null;

    const variants = {
        1: {
            label: '1st Place',
            color: 'text-warning',
            glow: 'shadow-[0_0_20px_rgba(212,130,10,0.25)]',
            icon: 'TrophyIcon' as const,
            height: 'h-[320px] scale-110 z-20',
            avatarSize: 'w-24 h-24 border-warning',
            pointsColor: 'text-warning'
        },
        2: {
            label: '2nd Place',
            color: 'text-muted-foreground',
            glow: 'shadow-[0_0_20px_rgba(154,142,122,0.15)]',
            icon: 'AwardIcon' as const,
            height: 'h-[280px] order-2 md:order-1 z-10',
            avatarSize: 'w-20 h-20 border-muted-foreground',
            pointsColor: 'text-muted-foreground'
        },
        3: {
            label: '3rd Place',
            color: 'text-chart-1',
            glow: 'shadow-[0_0_20px_rgba(196,122,10,0.15)]',
            icon: 'StarIcon' as const,
            height: 'h-[240px] md:order-3 z-0',
            avatarSize: 'w-18 h-18 border-chart-1',
            pointsColor: 'text-chart-1'
        }
    };

    const v = variants[rank as keyof typeof variants];

    return (
        <div className={cn("flex flex-col items-center justify-end w-full group", v.height)}>
            <div className="relative mb-6 flex flex-col items-center">
                {/* Rank Icon */}
                <div className={cn("absolute -top-10 animate-pulse", v.color)}>
                    <Icon name={v.icon} size={40} />
                </div>

                {/* Avatar Container */}
                <div className={cn(
                    "rounded-full bg-muted border-4 p-1 overflow-hidden transition-colors transition-transform transition-shadow transition-[width] duration-500 group-hover:scale-105 shadow-xl",
                    v.avatarSize,
                    v.glow
                )}>
                    {entry.person?.avatar ? (
                        <img src={entry.person.avatar} className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-xl font-bold text-primary">
                            {entry.person?.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full p-4 text-center bg-card/60 border border-border rounded-xl backdrop-blur-sm">
                <h3 className="font-bold text-foreground text-sm truncate mb-1">{entry.person?.name}</h3>
                <div className="flex flex-col items-center gap-1">
                    <span className={cn("text-micro uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-muted", v.color)}>
                        {v.label}
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-xl font-black text-foreground font-data">{Math.round(entry.epef)}</span>
                        <span className="text-micro font-bold text-muted-foreground">EPEF</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border">
                    <div className="text-left">
                        <span className="block text-[8px] text-muted-foreground font-bold uppercase">FCR</span>
                        <span className="text-xs font-bold text-foreground font-data">{entry.averageFCR.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-[8px] text-muted-foreground font-bold uppercase">Mort.</span>
                        <span className="text-xs font-bold text-foreground font-data">{entry.averageMortality.toFixed(2)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export function GrowerLeaderboard({ data, className }: GrowerLeaderboardProps) {
    // Sort by epef for logical ranking, but data already has ranking property
    const sorted = [...data].sort((a, b) => (b.epef || 0) - (a.epef || 0));
    const first = sorted[0];
    const second = sorted[1];
    const third = sorted[2];

    return (
        <div className={cn("flex flex-col md:flex-row items-end justify-center gap-6 md:gap-4 lg:gap-8 pt-12 pb-8", className)}>
            <Podium entry={second} rank={2} />
            <Podium entry={first} rank={1} />
            <Podium entry={third} rank={3} />
        </div>
    );
}
