import { useRef, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function ProfileSection() {
  const { user } = useAuthStore();
  const { profile, updateProfile } = useProfileStore();
  const { isLoading } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || user?.email || '',
      contact_number: profile?.contact_number || '',
      avatar_url: profile?.avatar_url || '',
    }
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB.');
      return;
    }
    if (!user?.id || !user?.orgId) {
      toast.error('User session not found.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.orgId}/${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      await updateProfile({ avatar_url: urlData.publicUrl });
      toast.success('Avatar updated successfully.');
    } catch {
      toast.error('Failed to upload avatar.');
    } finally {
      setUploadingAvatar(false);
      // Reset input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to update profile.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <p className="text-muted-foreground text-sm">Update your personal information and profile picture.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-6 pb-6 border-b border-border/50">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
              {profile?.first_name?.charAt(0).toUpperCase() || 'U'}
              {profile?.last_name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              size="sm"
              variant="outline"
              type="button"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
            </Button>
            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input id="first_name" {...register('first_name')} placeholder="First name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input id="last_name" {...register('last_name')} placeholder="Last name" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" {...register('email')} disabled />
            <p className="text-[10px] text-muted-foreground italic">Email changes are restricted to admin users.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_number">Contact Number</Label>
            <Input id="contact_number" {...register('contact_number')} placeholder="e.g. +63 912 345 6789" />
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
