import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Icon } from '@/hooks/useIcon';
import { toast } from 'sonner';

export function GeneralOrgSection() {
  const { user } = useAuthStore();
  const { 
    organization, 
    orgSettings, 
    updateOrganization, 
    updateOrgSettings, 
    isLoading 
  } = useSettingsStore();

  const { register, handleSubmit, setValue, watch, formState: { isDirty } } = useForm({
    defaultValues: {
      name: organization?.name || '',
      address: organization?.address || '',
      contact_number: organization?.contact_number || '',
      currency: orgSettings?.currency || 'PHP',
      region: organization?.region || 'Luzon',
      payment_terms_days: orgSettings?.payment_terms_days || 30,
    }
  });

  const onSubmit = async (data: any) => {
    if (!user?.orgId) return;
    try {
      // Split updates between tables
      const orgUpdates = {
        name: data.name,
        address: data.address,
        contact_number: data.contact_number,
        region: data.region
      };
      
      const settingsUpdates = {
        currency: data.currency,
        payment_terms_days: data.payment_terms_days
      };

      await Promise.all([
        updateOrganization(user.orgId, orgUpdates),
        updateOrgSettings(user.orgId, settingsUpdates)
      ]);
      
      toast.success('Organization settings updated successfully.');
    } catch {
      toast.error('Failed to update organization info.');
    }
  };

  const currencyValue = watch('currency');
  const regionValue = watch('region');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">General Organization</h2>
        <p className="text-muted-foreground text-sm">Configure your farm's base information and regional defaults.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="p-8 bg-muted/20 border border-border/50 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Icon name="FactoryIcon" size={24} />
             </div>
             <div>
                <h3 className="font-bold">Company Profile</h3>
                <p className="text-[10px] text-muted-foreground italic">General info used across all your farms and reports.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input id="name" {...register('name')} placeholder="e.g. Acme Poultry Corp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input id="contact" {...register('contact_number')} placeholder="+63 9xx xxxx xxx" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Head Office Address</Label>
            <Input id="address" {...register('address')} placeholder="Unit, Street, City, ZIP" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div className="space-y-2">
              <Label htmlFor="currency">Base Currency</Label>
              <Select defaultValue={currencyValue} onValueChange={(val) => setValue('currency', val, { shouldDirty: true })}>
                <SelectTrigger id="currency" className="rounded-xl h-11">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="PHP">₱ Philippine Peso (PHP)</SelectItem>
                  <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Primary Region</Label>
              <Select defaultValue={regionValue} onValueChange={(val) => setValue('region', val, { shouldDirty: true })}>
                <SelectTrigger id="region" className="rounded-xl h-11">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Luzon">Luzon</SelectItem>
                  <SelectItem value="Visayas">Visayas</SelectItem>
                  <SelectItem value="Mindanao">Mindanao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-border/50">
            <Label htmlFor="payment_terms_days">Default Payment Terms (Days)</Label>
            <Input 
              id="payment_terms_days" 
              type="number" 
              {...register('payment_terms_days', { valueAsNumber: true })} 
              placeholder="e.g. 30" 
              className="max-w-50"
            />
            <p className="text-[10px] text-muted-foreground italic">Used for calculating payout due dates for employees and growers.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" disabled={isLoading || !isDirty}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          {!isDirty && <span className="text-xs text-muted-foreground italic">No changes detected</span>}
        </div>
      </form>
    </div>
  );
}
