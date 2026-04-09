/**
 * InviteUserSheet
 * 
 * Sheet form for inviting a new user via the invite-user Edge Function.
 * Fields: Email, Role (Technician | Grower).
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { Icon } from '@/hooks/useIcon';
import { sendUserInvite } from '@/lib/data/auth';
import { getErrorMessage } from '@/lib/data/errors';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';

interface InviteUserSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onInvited?: () => void;
}

export function InviteUserSheet({ isOpen, onClose, onInvited }: InviteUserSheetProps) {
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('technician');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const { user } = useAuthStore()
  const orgId = user?.orgId;

  React.useEffect(() => {
    if (isOpen) {
      setEmail('');
      setRole('technician');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleInvite = async () => {
    if (!email.trim() || !orgId) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await sendUserInvite({
        email: email.trim(),
        role,
        orgId,
      });

      // Notify org admins that a new user has been invited
      if (orgId) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('org_id', orgId)
          .in('role', ['admin', 'owner']);

        for (const admin of admins ?? []) {
          // Don't notify the person who sent the invite
          if (admin.id === user?.id) continue;
          await supabase.from('notifications').insert({
            recipient_id: admin.id,
            org_id: orgId,
            type: 'new_user_invite',
            event_type: 'new_user_invite',
            urgency: 'info',
            title: 'New User Invited',
            message: `An invitation was sent to ${email.trim()} for the role of ${role}.`,
            link: '/settings?tab=personnel',
            expires_at: expiresAt,
          });
        }
      }

      setSuccess(true);
      onInvited?.();
      // Auto-close after brief success display
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send invite'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Invite User">
      <div className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm font-medium flex items-center gap-2">
            <Icon name="CheckCircleIcon" size={16} />
            Invite sent successfully!
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full bg-muted/20 border-border border rounded-xl py-3 px-4 text-sm text-foreground focus:border-primary focus:ring-0 focus:outline-none placeholder:text-muted-foreground/30 transition-colors"
            disabled={success}
          />
        </div>

        {/* Role */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Role *</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-muted/20 border-border border rounded-xl py-3 px-4 text-sm text-foreground focus:border-primary focus:ring-0 focus:outline-none transition-colors"
            disabled={success}
          >
            <option value="technician">Technician</option>
            <option value="grower">Grower</option>
          </select>
          <p className="text-micro text-muted-foreground">
            {role === 'technician'
              ? 'Technicians can log data, manage cycles, and view reports.'
              : 'Growers can view their assigned farm data and verify harvests.'}
          </p>
        </div>

        {/* Submit */}
        <Button
          onClick={handleInvite}
          disabled={isSubmitting || !email.trim() || success}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Icon name="CycleIcon" size={16} className="animate-spin" />
              <span>Sending Invite...</span>
            </div>
          ) : success ? (
            'Invited!'
          ) : (
            'Send Invite'
          )}
        </Button>

        <p className="text-micro text-muted-foreground text-center">
          The user will receive an email with a magic link to join.
        </p>
      </div>
    </Sheet>
  );
}
