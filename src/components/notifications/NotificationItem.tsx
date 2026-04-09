import { cn } from '@/lib/utils';
import { Icon } from '@/hooks/useIcon';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/types';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onArchive?: (id: string) => void;
  compact?: boolean;
}

function getUrgencyStyles(urgency: Notification['urgency']) {
  switch (urgency) {
    case 'critical':
      return {
        border: 'border-l-4 border-l-red-500',
        iconName: 'AlertTriangleIcon' as const,
        iconColor: 'text-red-500',
      };
    case 'warning':
      return {
        border: 'border-l-4 border-l-amber-500',
        iconName: 'AlertTriangleIcon' as const,
        iconColor: 'text-amber-500',
      };
    default:
      return {
        border: '',
        iconName: 'InformationCircleIcon' as const,
        iconColor: 'text-muted-foreground',
      };
  }
}

export function NotificationItem({
  notification,
  onMarkRead,
  onArchive,
  compact = false,
}: NotificationItemProps) {
  const styles = getUrgencyStyles(notification.urgency);

  return (
    <div
      className={cn(
        'flex gap-3 px-3 py-2.5 rounded-md transition-colors',
        styles.border,
        !notification.isRead && 'bg-accent/40',
        'hover:bg-accent/60'
      )}
    >
      <div className="shrink-0 mt-0.5">
        <Icon name={styles.iconName} size={16} className={cn(styles.iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium leading-snug', !notification.isRead && 'font-semibold')}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
          {notification.message}
        </p>
        {!compact && notification.link && (
          <a
            href={notification.link}
            className="text-xs text-primary hover:underline mt-1 inline-block"
          >
            View details →
          </a>
        )}
        <p className="text-xs text-muted-foreground/70 mt-1">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </p>
      </div>

      {!compact && (
        <div className="shrink-0 flex flex-col gap-1">
          {!notification.isRead && onMarkRead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onMarkRead(notification.id)}
              title="Mark as read"
            >
              <Icon name="Tick01Icon" size={12} />
            </Button>
          )}
          {onArchive && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground"
              onClick={() => onArchive(notification.id)}
              title="Dismiss"
            >
              <Icon name="Cancel01Icon" size={12} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
