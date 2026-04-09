import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMarketStore } from '@/stores/useMarketStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Icon } from '@/hooks/useIcon';
import { toast } from 'sonner';
import { Loader2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function MarketPricesSection() {
  const { user } = useAuthStore();
  const { 
    prices, 
    fetchPrices, 
    addPrice, 
    removePrice, 
    verifyPrice,
    isLoading 
  } = useMarketStore();

  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (user?.orgId) {
      fetchPrices(user.orgId, { limit: 20 });
    }
  }, [user?.orgId, fetchPrices]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      price_date: format(new Date(), 'yyyy-MM-dd'),
      region: 'Luzon',
      farmgate_price_per_kg: 0,
      price_per_kg_carcass: 0,
      srp_price: 0,
      source: 'Internal Update',
      data_source: 'manual'
    }
  });

  const onSubmit = async (data: any) => {
    if (!user?.orgId || !user?.id) return;
    try {
      await addPrice(user.orgId, {
        price_date: data.price_date,
        region: data.region,
        farmgate_price_per_kg: Number(data.farmgate_price_per_kg),
        price_per_kg_carcass: data.price_per_kg_carcass ? Number(data.price_per_kg_carcass) : null,
        srp_price: data.srp_price ? Number(data.srp_price) : null,
        source: data.source,
        data_source: data.data_source
      }, user.id);
      
      toast.success('Market price added successfully.');
      setIsAdding(false);
      reset();
    } catch {
      toast.error('Failed to add market price.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this price entry?')) {
      try {
        await removePrice(id);
        toast.success('Market price deleted.');
      } catch {
        toast.error('Failed to delete market price.');
      }
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await verifyPrice(id);
      toast.success('Market price verified.');
    } catch {
      toast.error('Failed to verify market price.');
    }
  };

  const regionValue = watch('region');

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="flex flex-row justify-between items-end gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Market Prices Index</h2>
          <p className="text-muted-foreground text-sm">Monitor and manage regional farmgate and SRP benchmarks.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          variant={isAdding ? "outline" : "default"}
          className="rounded-xl shadow-sm"
        >
          {isAdding ? 'Cancel' : 'Add Price Point'}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-primary/5 border border-primary/20 p-8 rounded-3xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Icon name="MoneyIcon" size={24} />
             </div>
             <div>
                <h3 className="font-bold">New Entry</h3>
                <p className="text-[10px] italic text-slate-500 dark:text-slate-400">Manual verification is applied automatically for direct owner entries.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_date">Effective Date</Label>
              <Input id="price_date" type="date" {...register('price_date', { required: true })} />
              {errors.price_date && <span className="text-xs text-destructive">Required</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select defaultValue={regionValue} onValueChange={(val) => setValue('region', val)}>
                <SelectTrigger id="region" className="rounded-xl">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Luzon">Luzon</SelectItem>
                  <SelectItem value="Visayas">Visayas</SelectItem>
                  <SelectItem value="Mindanao">Mindanao</SelectItem>
                  <SelectItem value="NCR">NCR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farmgate">Live Price (per KG)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                <Input 
                  id="farmgate" 
                  type="number" 
                  step="0.01" 
                  className="pl-7"
                  {...register('farmgate_price_per_kg', { required: true, min: 0 })} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="carcass">Carcass Price (per KG)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                <Input 
                  id="carcass" 
                  type="number" 
                  step="0.01" 
                  className="pl-7"
                  {...register('price_per_kg_carcass', { min: 0 })} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="srp">SRP (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                <Input 
                  id="srp" 
                  type="number" 
                  step="0.01" 
                  className="pl-7"
                  {...register('srp_price', { min: 0 })} 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Data Source / Reference</Label>
            <Input id="source" {...register('source')} placeholder="e.g. DA Price Bulletin, Local Broker" />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Price Record
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden border border-border/50 rounded-3xl bg-card shadow-sm text-slate-900 dark:text-slate-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Region</th>
              <th className="px-6 py-4 text-right">Live Price</th>
              <th className="px-6 py-4 text-right">Carcass</th>
              <th className="px-6 py-4 text-right">SRP</th>
              <th className="px-6 py-4">Entered By</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {prices.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground italic">
                  No market price records found. Click "Add Price Point" to start.
                </td>
              </tr>
            ) : (
              prices.map((price) => (
                <tr key={price.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium">{format(new Date(price.price_date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] uppercase font-bold rounded-full border border-primary/20">
                      {price.region}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800 dark:text-slate-200">₱{price.farmgate_price_per_kg.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                    {price.price_per_kg_carcass ? `₱${Number(price.price_per_kg_carcass).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                    {price.srp_price ? `₱${price.srp_price.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {price.profiles
                      ? [price.profiles.first_name, price.profiles.last_name].filter(Boolean).join(' ') || '—'
                      : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {price.last_verified_at ? (
                      <div className="flex items-center text-emerald-500 gap-1.5 text-xs font-semibold">
                        <CheckCircle2 size={14} />
                        Verified
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-500 gap-1.5 text-xs font-semibold">
                        <AlertCircle size={14} />
                        Pending
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {!price.last_verified_at && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                          onClick={() => handleVerify(price.id)}
                          title="Verify Entry"
                        >
                          <CheckCircle2 size={16} />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(price.id)}
                        title="Delete Entry"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {isLoading && prices.length > 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">
                  <Loader2 size={20} className="animate-spin mx-auto text-primary" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
