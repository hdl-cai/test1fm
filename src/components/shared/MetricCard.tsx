import { Card } from '@/components/ui/card';
import { Icon, type IconName, TrendingUpIcon, TrendingDownIcon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';

export interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: {
        value: number | string;
        direction: 'up' | 'down' | 'neutral';
        label?: string;
    };
    icon?: IconName;
    iconColor?: string;
    variant?: 'default' | 'gauge';
    gaugeValue?: number;
    gaugeColor?: string;
    statusBadge?: {
        label: string;
        type: 'success' | 'warning' | 'danger' | 'info';
    };
    fillIcon?: boolean;
    className?: string;
}

export function MetricCard({
    title,
    value,
    subtitle,
    trend,
    icon,
    iconColor = 'var(--primary)',
    variant = 'default',
    gaugeValue = 0,
    gaugeColor = 'var(--primary)',
    statusBadge,
    fillIcon,
    className,
}: MetricCardProps) {
    return (
        <Card className={cn(
            'bg-card rounded-xl p-6 border border-border relative overflow-hidden group transition-colors transition-[width] duration-300',
            'hover:border-primary/30 hover:shadow-md light:shadow-[var(--card-shadow)]',
            className
        )}>
            <div className="flex justify-between items-start relative z-10 h-full">
                <div className="flex-1 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-micro font-bold text-muted-foreground uppercase tracking-widest">{title}</h3>
                        {statusBadge && (
                            <StatusBadge
                                status={
                                    statusBadge.label.toLowerCase().includes('on track') ? 'on_track' :
                                        statusBadge.label.toLowerCase().includes('market peak') ? 'market_peak' :
                                            statusBadge.type
                                }
                                size="sm"
                            />
                        )}
                    </div>

                    <div className="mt-auto">
                        <p className="text-stat font-bold text-foreground tracking-tight tabular-nums leading-none font-data">
                            {value}
                        </p>

                        {subtitle && (
                            <p className="text-caption text-muted-foreground mt-2 font-medium leading-relaxed">
                                {subtitle}
                            </p>
                        )}

                        {trend && (
                            <div className="mt-4 flex items-center gap-2">
                                <div className={cn(
                                    "flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-micro font-bold border",
                                    trend.direction === 'up'
                                        ? "bg-success/10 text-success border-success/20"
                                        : trend.direction === 'down'
                                            ? "bg-danger/10 text-danger border-danger/20"
                                            : "bg-muted/30 text-muted-foreground border-border/60"
                                )}>
                                    {trend.direction === 'up' ? <TrendingUpIcon size={12} /> : trend.direction === 'down' ? <TrendingDownIcon size={12} /> : null}
                                    <span className="tabular-nums font-data">{trend.value}</span>
                                </div>
                                {trend.label && (
                                    <span className="text-micro text-muted-foreground font-semibold uppercase tracking-wide">
                                        {trend.label}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Right Icon Badge */}
                {icon && variant === 'default' && (
                    <div
                        className={cn(
                            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-[width] transition-[height] duration-300",
                            "shadow-sm border border-border group-hover:scale-110 group-hover:rotate-3",
                            iconColor?.startsWith('var(') ? "bg-muted/50 text-foreground" : "bg-muted/50"
                        )}
                        style={!iconColor?.startsWith('var(') ? {
                            color: iconColor,
                            borderColor: `${iconColor}20`
                        } : undefined}
                    >
                        <Icon
                            name={icon}
                            size={22}
                            strokeWidth={2}
                            fill={fillIcon ? 'currentColor' : 'none'}
                        />
                    </div>
                )}

                {variant === 'gauge' && (
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="var(--muted)"
                                strokeWidth="8"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke={gaugeColor}
                                strokeWidth="8"
                                strokeLinecap="round"
                                style={{
                                    strokeDasharray: 264,
                                    strokeDashoffset: 264 - (264 * Math.min(gaugeValue, 100)) / 100,
                                    transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-foreground tabular-nums">{gaugeValue}%</span>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
