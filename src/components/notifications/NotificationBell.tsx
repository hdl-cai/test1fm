import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { NotificationItem } from './NotificationItem';

export function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const { notifications, unreadCount, fetch, markRead, markAllRead, subscribeRealtime, unsubscribeRealtime } =
    useNotificationStore();

  // Bootstrap on mount
  React.useEffect(() => {
    void fetch();
    subscribeRealtime();
    return () => unsubscribeRealtime();
  }, [fetch, subscribeRealtime, unsubscribeRealtime]);

  const preview = notifications.slice(0, 10);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-foreground relative"
          aria-label="Notifications"
        >
          <Icon name="Notification01Icon" size={20} />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -top-0.5 -right-0.5 flex items-center justify-center',
                'min-w-4.5 h-4.5 rounded-full px-1',
                'bg-red-500 text-white text-[10px] font-bold leading-none'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        className="w-95 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
                {unreadCount} unread
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 text-muted-foreground"
              onClick={() => void markAllRead()}
            >
              Mark all read
            </Button>
          )}
        </div>

        <Separator />

        {/* Notification list */}
        {preview.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Icon name="Notification01Icon" size={32} className="mb-2 opacity-30" />
            <p className="text-sm">You're all caught up</p>
          </div>
        ) : (
          <ScrollArea className="max-h-85">
            <div className="p-2 space-y-0.5">
              {preview.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={(id) => void markRead(id)}
                  compact
                />
              ))}
            </div>
          </ScrollArea>
        )}

        <Separator />

        {/* Footer */}
        <div className="px-4 py-2.5">
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="text-xs text-primary hover:underline font-medium"
          >
            View all notifications →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
