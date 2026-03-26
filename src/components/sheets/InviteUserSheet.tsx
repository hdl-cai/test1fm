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
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

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

  const orgId = useAuthStore((state) => state.user?.orgId);

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
      // Get current session token for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            email: email.trim(),
            role,
            org_id: orgId,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to invite user');

      setSuccess(true);
      onInvited?.();
      // Auto-close after brief success display
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to send invite');
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
