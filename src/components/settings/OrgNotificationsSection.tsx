import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

const CRITICAL_EVENTS = [
  { key: 'sensor_critical', label: 'Sensor Critical Alert', description: 'Fires when a sensor exceeds the critical threshold.' },
  { key: 'vaccination_overdue', label: 'Vaccination Overdue', description: 'Fires when a scheduled vaccination passes its due date.' },
];

const STANDARD_EVENTS = [
  { key: 'daily_report_missing', label: 'Daily Report Missing', description: 'Remind growers and technicians to submit daily reports.' },
  { key: 'harvest_completed', label: 'Harvest Completed', description: 'Notify admin when a harvest log is submitted.' },
  { key: 'cycle_created', label: 'Cycle Started', description: 'Notify org members when a new production cycle begins.' },
  { key: 'cycle_closed', label: 'Cycle Closed', description: 'Notify org members when a cycle is closed and EPEF is calculated.' },
  { key: 'cash_advance_submitted', label: 'Cash Advance Request', description: 'Notify admin when an employee submits a cash advance request.' },
  { key: 'cash_advance_approved', label: 'Cash Advance Approved', description: 'Notify the employee when a cash advance is approved.' },
  { key: 'cash_advance_rejected', label: 'Cash Advance Rejected', description: 'Notify the employee when a cash advance is rejected.' },
  { key: 'payroll_released', label: 'Payroll Released', description: 'Notify employees when payroll records are released.' },
  { key: 'sensor_warning', label: 'Sensor Warning Alert', description: 'Fires when a sensor reading is in the warning range.' },
];

export function OrgNotificationsSection() {
  const { user } = useAuthStore();
  const { notificationPreferences: prefs, updateNotificationPreferences } = useSettingsStore();

  const disabledEvents: string[] = prefs?.disabled_event_types ?? [];

  const isEventEnabled = (key: string) => !disabledEvents.includes(key);

  const handleEventToggle = async (eventKey: string, enabled: boolean) => {
    if (!user?.id || !prefs) return;

    const current = prefs.disabled_event_types ?? [];
    const updated = enabled
      ? current.filter((k) => k !== eventKey)
      : [...current, eventKey];

    try {
      await updateNotificationPreferences(user.id, { disabled_event_types: updated });
      toast.success(`"${eventKey.replace(/_/g, ' ')}" notifications ${enabled ? 'enabled' : 'disabled'}.`);
    } catch {
      toast.error('Failed to update notification settings.');
    }
  };

  const handleChannelToggle = async (field: 'email_enabled' | 'push_enabled', value: boolean) => {
    if (!user?.id) return;
    try {
      await updateNotificationPreferences(user.id, { [field]: value });
      toast.success('Delivery channel updated.');
    } catch {
      toast.error('Failed to update delivery channel.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Organization Notifications</h2>
        <p className="text-muted-foreground text-sm">
          Configure org-wide notification delivery and event triggers.
          Full dispatch (email + push) activates when the Phase 4 notification system is deployed.
        </p>
      </div>

      {/* Delivery Channels */}
      <div className="p-6 bg-muted/20 border border-border/50 rounded-3xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Icon name="Notification01Icon" size={20} className="text-primary" />
          <h3 className="font-bold">Default Delivery Channels</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          These defaults apply to org-level alerts. Individual users can override their own preferences in Personal → Notifications.
        </p>

        <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/40 shadow-sm">
          <div className="flex flex-col">
            <span className="font-medium text-sm">Email Notifications</span>
            <span className="text-[10px] text-muted-foreground">Send critical and standard events via email to relevant users.</span>
          </div>
          <button
            onClick={() => handleChannelToggle('email_enabled', !prefs?.email_enabled)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              prefs?.email_enabled ? 'bg-primary' : 'bg-muted'
            )}
          >
            <span className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              prefs?.email_enabled ? 'translate-x-5' : 'translate-x-0'
            )} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/40 shadow-sm opacity-60">
          <div className="flex flex-col text-muted-foreground">
            <span className="font-medium text-sm flex items-center gap-1.5">
              Push Notifications <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-normal">Phase 4 / PWA</span>
            </span>
            <span className="text-[10px]">Web push and mobile push alerts via PWA. Enabled in Phase 4.</span>
          </div>
          <button disabled className="bg-muted h-6 w-11 rounded-full cursor-not-allowed border-2 border-transparent relative">
            <span className="h-5 w-5 bg-white rounded-full absolute left-0" />
          </button>
        </div>
      </div>

      {/* Critical Events (locked ON) */}
      <div className="p-6 bg-muted/20 border border-border/50 rounded-3xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Icon name="ShieldAlertIcon" size={20} className="text-destructive" />
          <h3 className="font-bold">Critical Events</h3>
          <span className="text-[10px] bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
            Always On
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          These events are always active and cannot be disabled. They represent safety and compliance thresholds.
        </p>
        <div className="space-y-2">
          {CRITICAL_EVENTS.map((event) => (
            <div key={event.key} className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/40 shadow-sm opacity-80">
              <div className="flex flex-col">
                <span className="font-medium text-sm">{event.label}</span>
                <span className="text-[10px] text-muted-foreground">{event.description}</span>
              </div>
              <div className="flex items-center gap-2" title="Critical alerts cannot be disabled">
                <Lock size={12} className="text-muted-foreground" />
                <div className="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent bg-primary cursor-not-allowed" aria-label="Always enabled">
                  <span className="pointer-events-none inline-block h-5 w-5 translate-x-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standard Events */}
      <div className="p-6 bg-muted/20 border border-border/50 rounded-3xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Icon name="Notification01Icon" size={20} className="text-primary" />
          <h3 className="font-bold">Standard Events</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Toggle which events generate notifications for your organization. Disabled events are suppressed org-wide.
        </p>
        <div className="space-y-2">
          {STANDARD_EVENTS.map((event) => {
            const enabled = isEventEnabled(event.key);
            return (
              <div key={event.key} className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/40 shadow-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{event.label}</span>
                  <span className="text-[10px] text-muted-foreground">{event.description}</span>
                </div>
                <button
                  onClick={() => handleEventToggle(event.key, !enabled)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    enabled ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <span className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  )} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
