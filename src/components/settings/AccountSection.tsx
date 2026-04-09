import { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/hooks/useIcon';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function AccountSection() {
  const { user } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      // Re-authenticate with current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email ?? '',
        password: currentPassword,
      });

      if (signInError) {
        toast.error('Current password is incorrect.');
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast.success('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Account Security</h2>
        <p className="text-muted-foreground text-sm">Manage your login credentials and account access.</p>
      </div>

      {/* Account Info */}
      <div className="p-6 bg-muted/20 border border-border/50 rounded-3xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Icon name="UserIcon" size={20} className="text-primary" />
          <h3 className="font-bold">Account Details</h3>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email Address</Label>
          <p className="font-medium text-sm">{user?.email ?? '—'}</p>
          <p className="text-[11px] text-muted-foreground">Your email address is used for login and cannot be changed here.</p>
        </div>
      </div>

      {/* Change Password */}
      <div className="p-6 bg-muted/20 border border-border/50 rounded-3xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Icon name="LockIcon" size={20} className="text-primary" />
          <h3 className="font-bold">Change Password</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <p className="text-[11px] text-muted-foreground">Minimum 8 characters.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <Button type="submit" disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}>
            {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update Password
          </Button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="p-6 border-2 border-destructive/20 bg-destructive/5 rounded-3xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Icon name="ShieldAlertIcon" size={20} className="text-destructive" />
          <h3 className="font-bold text-destructive">Danger Zone</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Account deactivation permanently removes your access to this organization. This action cannot be undone. Contact your administrator or{' '}
          <a href="mailto:support@flockmate.tech" className="text-primary underline">support@flockmate.tech</a> to request account removal.
        </p>
      </div>
    </div>
  );
}
