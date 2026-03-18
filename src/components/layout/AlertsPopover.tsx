import * as React from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { mockAlerts } from '@/data/alerts';
import type { Alert } from '@/components/shared/AlertCard';

export function AlertsPopover() {
    const [open, setOpen] = React.useState(false);
    const unreadCount = mockAlerts.length;

    const getAlertStyles = (type: Alert['type']) => {
        switch (type) {
            case 'critical':
                return {
                    icon: 'AlertTriangleIcon' as const,
                    iconColor: 'text-red-500',
                    bg: 'bg-red-500/5',
                    borderColor: 'border-red-500/20',
                    textColor: 'text-red-500',
                };
            case 'warning':
                return {
                    icon: 'AlertTriangleIcon' as const,
                    iconColor: 'text-amber-500',
                    bg: 'bg-amber-500/5',
                    borderColor: 'border-amber-500/20',
                    textColor: 'text-amber-500',
                };
            case 'info':
                return {
                    icon: 'InformationCircleIcon' as const,
                    iconColor: 'text-blue-500',
                    bg: 'bg-blue-500/5',
                    borderColor: 'border-blue-500/20',
                    textColor: 'text-blue-500',
                };
            default:
                return {
                    icon: 'AlertTriangleIcon' as const,
                    iconColor: 'text-muted-foreground',
                    bg: 'bg-muted/5',
                    borderColor: 'border-border',
                    textColor: 'text-muted-foreground',
                };
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative shrink-0 text-foreground"
                    aria-label="Notifications"
                >
                    <Icon name="NotificationIcon" size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-micro font-bold text-white ring-2 ring-card">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0 mr-4" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">System Alerts</h3>
                        <span className="px-1.5 py-0.5 rounded-md text-micro font-bold bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-tight">
                            {unreadCount} Alerts
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-micro font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                        Mark all as read
                    </Button>
                </div>

                <ScrollArea className="h-[400px]">
                    <div className="p-3 space-y-2">
                        {mockAlerts.map((alert) => {
                            const styles = getAlertStyles(alert.type);
                            return (
                                <div
                                    key={alert.id}
                                    className={cn(
                                        'p-3 rounded-xl border transition-colors hover:bg-muted/30 cursor-pointer group',
                                        styles.bg,
                                        styles.borderColor
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-border/50 shadow-sm",
                                            styles.iconColor
                                        )}>
                                            <Icon name={styles.icon} size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h4 className={cn("text-xs font-black uppercase tracking-tight truncate", styles.textColor)}>
                                                    {alert.title}
                                                </h4>
                                                <span className="text-micro text-muted-foreground font-medium shrink-0 ml-2">
                                                    {alert.time}
                                                </span>
                                            </div>
                                            <p className="text-micro text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                                                {alert.description}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                <span className="text-micro font-bold text-muted-foreground uppercase tracking-wider">
                                                    {alert.farmName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
                <div className="p-3 border-t border-border/50 bg-muted/20">
                    <Button variant="ghost" className="w-full h-8 text-xs font-bold text-muted-foreground hover:text-foreground">
                        View All Notifications
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
