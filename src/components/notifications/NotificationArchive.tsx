import * as React from 'react';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { NotificationItem } from './NotificationItem';
import { NotificationFilters, type NotificationFilterState } from './NotificationFilters';
import { Icon } from '@/hooks/useIcon';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function NotificationArchive() {
  const { notifications, unreadCount, markRead, markAllRead, archive } = useNotificationStore();

  const [filters, setFilters] = React.useState<NotificationFilterState>({
    search: '',
    urgency: 'all',
    type: '',
  });

  const filtered = notifications.filter((n) => {
    if (filters.urgency !== 'all' && n.urgency !== filters.urgency) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <NotificationFilters filters={filters} onChange={setFilters} />
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0"
            onClick={() => void markAllRead()}
          >
            <Icon name="Tick01Icon" size={14} className="mr-1.5" />
            Mark all as read
          </Button>
        )}
      </div>

      <Separator />

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Icon name="Notification01Icon" size={40} className="mb-3 opacity-20" />
          <p className="text-sm">No notifications match your filters</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={(id) => void markRead(id)}
              onArchive={(id) => void archive(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
