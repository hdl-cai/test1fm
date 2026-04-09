import { useEffect } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Icon } from '@/hooks/useIcon';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { NotificationArchive } from '@/components/notifications/NotificationArchive';

export default function Notifications() {
  const { fetch } = useNotificationStore();

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Icon name="Notification01Icon" size={28} className="text-primary" />
        <div>
          <PageTitle>Notifications</PageTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your activity feed — alerts, updates, and reminders.
          </p>
        </div>
      </div>

      <NotificationArchive />
    </div>
  );
}
