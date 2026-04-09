import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function NotificationPrefsSection() {
  const { user } = useAuthStore();
  const { 
    notificationPreferences: prefs, 
    updateNotificationPreferences,
  } = useSettingsStore();

  const handleToggle = async (field: 'email_enabled' | 'push_enabled', value: boolean) => {
    if (!user?.id) return;
    try {
      await updateNotificationPreferences(user.id, { [field]: value });
      toast.success('Notification settings updated.');
    } catch {
      toast.error('Failed to update notifications.');
    }
  };

  const handleTimeChange = async (time: string, index: number) => {
    if (!user?.id || !prefs) return;
    const newTimes = [...(prefs.daily_report_reminder_times || [])];
    newTimes[index] = time;
    try {
      await updateNotificationPreferences(user.id, { daily_report_reminder_times: newTimes });
      toast.success('Reminder time updated.');
    } catch {
      toast.error('Failed to update reminder time.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Manage Personal Notifications</h2>
        <p className="text-muted-foreground text-sm">Fine-tune how and when you receive reminders and alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Channels */}
        <div className="p-6 bg-muted/20 border border-border/50 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Notification01Icon" size={24} className="text-primary" />
            <h3 className="font-bold">Delivery Channels</h3>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/40 shadow-sm">
            <div className="flex flex-col">
              <span className="font-medium text-sm">Email Notifications</span>
              <span className="text-[10px] text-muted-foreground">Receive daily reports and system alerts via email.</span>
            </div>
            <button 
              onClick={() => handleToggle('email_enabled', !prefs?.email_enabled)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                prefs?.email_enabled ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                prefs?.email_enabled ? 'translate-x-5' : 'translate-x-0'
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/40 shadow-sm opacity-60">
            <div className="flex flex-col text-muted-foreground">
              <span className="font-medium text-sm flex items-center gap-1.5">
                Push Notifications <Icon name="Settings01Icon" size={12} className="text-muted-foreground" />
              </span>
              <span className="text-[10px]">Desktop and mobile push alerts. (Mobile PWA feature)</span>
            </div>
            <button disabled className="bg-muted h-6 w-11 rounded-full cursor-not-allowed border-2 border-transparent relative">
              <span className="h-5 w-5 bg-white rounded-full absolute left-0" />
            </button>
          </div>
        </div>

        {/* Daily Reminders */}
        <div className="p-6 bg-muted/20 border border-border/50 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Calendar01Icon" size={24} className="text-primary" />
            <h3 className="font-bold">Daily Reminders</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Set times to be reminded if daily reports aren't submitted yet. 
            These act as reminders at 18:00 and 21:00 by default.
          </p>

          <div className="space-y-3">
            {(prefs?.daily_report_reminder_times || ['18:00', '21:00']).map((time: string, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-xs font-bold w-full max-w-16 text-muted-foreground uppercase">{idx === 0 ? 'First' : 'Final'}</span>
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value, idx)}
                  className="bg-card w-full p-2 h-10 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
