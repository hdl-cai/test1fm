import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangleIcon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  farmName?: string;
  time: string;
}

interface AlertCardProps {
  alerts: Alert[];
  className?: string;
}

export function AlertCard({
  alerts,
  className,
}: AlertCardProps) {
  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return {
          iconColor: 'text-danger',
          bg: 'bg-danger/5',
          borderColor: 'border-danger/20',
          hoverBorderColor: 'group-hover/item:border-danger/40',
          textColor: 'text-danger',
        };
      case 'warning':
        return {
          iconColor: 'text-warning',
          bg: 'bg-warning/5',
          borderColor: 'border-warning/20',
          hoverBorderColor: 'group-hover/item:border-warning/40',
          textColor: 'text-warning',
        };
      case 'info':
        return {
          iconColor: 'text-info',
          bg: 'bg-info/5',
          borderColor: 'border-info/20',
          hoverBorderColor: 'group-hover/item:border-info/40',
          textColor: 'text-info',
        };
      default:
        return {
          iconColor: 'text-muted-foreground',
          bg: 'bg-muted/5',
          borderColor: 'border-border',
          hoverBorderColor: 'group-hover/item:border-foreground/20',
          textColor: 'text-muted-foreground',
        };
    }
  };

  return (
    <Card className={cn('bg-card border-border flex flex-col shadow-sm light:shadow-[var(--card-shadow)]', className)}>
      <CardHeader className="p-5 pb-4 shrink-0 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center border border-danger/20">
              <AlertTriangleIcon size={16} className="text-danger" />
            </div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">System Alerts</h3>
          </div>
          <span className="bg-danger/10 text-danger text-micro px-2.5 py-1 rounded-lg border border-danger/20 font-black uppercase tracking-widest shrink-0 shadow-sm shadow-danger/5">
            {alerts.length} ACTIVE
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden min-h-0">
        <ScrollArea className="h-full">
          <div className="p-5 space-y-3">
            {alerts.map((alert) => {
              const styles = getAlertStyles(alert.type);
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'border rounded-xl p-4 transition-colors transition-transform transition-shadow transition-[width] duration-300 relative group/item hover:bg-muted/30 hover:shadow-md hover:scale-[1.01]',
                    styles.bg,
                    styles.borderColor,
                    styles.hoverBorderColor
                  )}
                >
                  <div className="flex gap-4">
                    <div
                      className={cn("flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-border/50 shadow-sm", styles.iconColor)}
                    >
                      <AlertTriangleIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h4 className={cn("text-xs font-black uppercase tracking-wide truncate pr-16", styles.textColor)}>
                          {alert.title}
                        </h4>
                      </div>
                      <p className="text-micro text-muted-foreground font-semibold leading-relaxed line-clamp-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-primary/40" />
                          <span className="text-micro font-bold text-muted-foreground tracking-wide uppercase">{alert.farmName}</span>
                        </div>
                        <span className="text-micro font-medium text-muted-foreground italic border-l border-border/50 pl-3">{alert.time}</span>
                      </div>
                    </div>
                  </div>
                  {/* Severity Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={cn(
                      "text-[8px] font-black px-2 py-1 rounded-md border uppercase tracking-[0.2em]",
                      alert.type === 'critical' ? "bg-background text-danger border-danger/30" :
                        alert.type === 'warning' ? "bg-background text-warning border-warning/30" :
                          "bg-background text-info border-info/30"
                    )}>
                      {alert.type}
                    </span>
                  </div>
                </div>
              );
            })}
            {alerts.length === 0 && (
              <div className="text-center py-12 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <AlertTriangleIcon size={24} className="text-muted-foreground/30" />
                </div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Everything is okay</p>
                <p className="text-micro text-muted-foreground mt-1">No alerts at this time</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default AlertCard;
