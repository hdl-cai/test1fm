import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/hooks/useIcon';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import type { EpefIncentiveBracket } from '@/lib/data/settings';

export function PerformanceSection() {
  const { user } = useAuthStore();
  const { 
    orgSettings: settings, 
    updateOrgSettings, 
    epefBrackets: brackets,
    fetchEpefBrackets,
    updateEpefBrackets,
    deleteEpefBracket,
    isLoading 
  } = useSettingsStore();

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
    defaultValues: {
      default_fcr_target: settings?.default_fcr_target || 1.45,
      default_target_mortality_pct: settings?.default_target_mortality_pct || 3.5,
      base_incentive_per_bird: settings?.base_incentive_per_bird || 1.0,
    }
  });

  const [editingBrackets, setEditingBrackets] = useState<Partial<EpefIncentiveBracket>[]>([]);

  useEffect(() => {
    if (user?.orgId) {
      fetchEpefBrackets(user.orgId);
    }
  }, [user, fetchEpefBrackets]);

  useEffect(() => {
    if (brackets.length > 0) {
      setEditingBrackets(brackets);
    } else if (brackets.length === 0 && !isLoading) {
       // Seed empty brackets if nothing exists
        setEditingBrackets([
          { description: 'Junior Bonus', min_epef: 280, max_epef: 319, incentive_rate_per_head: 1.5 },
          { description: 'Senior Bonus', min_epef: 320, max_epef: 349, incentive_rate_per_head: 2.0 },
          { description: 'Elite Bonus', min_epef: 350, max_epef: 9999, incentive_rate_per_head: 3.0 }
        ]);
    }
  }, [brackets, isLoading]);

  const onSettingsSubmit = async (data: any) => {
     if (!user?.orgId) return;
     try {
       await updateOrgSettings(user.orgId, data);
       toast.success('Performance targets updated.');
       reset(data);
     } catch {
       toast.error('Failed to update targets.');
     }
  };

  const handleBracketChange = (field: string, val: any, index: number) => {
     const newBrackets = [...editingBrackets];
     newBrackets[index] = { ...newBrackets[index], [field]: val };
     setEditingBrackets(newBrackets);
  };

  const saveBrackets = async () => {
    if (!user?.orgId) return;
    try {
      await updateEpefBrackets(user.orgId, editingBrackets);
      toast.success('Incentive brackets saved.');
    } catch {
      toast.error('Failed to save brackets.');
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Performance & Targets</h2>
        <p className="text-muted-foreground text-sm">Set your core production KPI targets and bonus incentives.</p>
      </div>

      {/* Target Metrics */}
      <div className="p-8 bg-muted/20 border border-border/50 rounded-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Icon name="AnalyticsUpIcon" size={24} className="text-primary" />
          <h3 className="font-bold">System Targets (Defaults)</h3>
        </div>
        
        <form onSubmit={handleSubmit(onSettingsSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fcr">Target FCR</Label>
            <Input id="fcr" type="number" step="0.01" {...register('default_fcr_target')} />
            <p className="text-[10px] text-muted-foreground italic">Target Feed Conversion Ratio for your region.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mortality">Target Mortality %</Label>
            <Input id="mortality" type="number" step="0.1" {...register('default_target_mortality_pct')} />
            <p className="text-[10px] text-muted-foreground italic">Default maximum expected bird mortality rate.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="incentive">Base Incentive / Bird</Label>
            <Input id="incentive" type="number" step="0.1" {...register('base_incentive_per_bird')} />
             <p className="text-[10px] text-muted-foreground italic">Fixed per-bird payout before multipliers.</p>
          </div>
          <div className="md:col-span-3 pt-4 flex items-center justify-between">
            <Button type="submit" disabled={isLoading || !isDirty}>Save Targets</Button>
            {!isDirty && <span className="text-[10px] text-muted-foreground italic">Targets are up to date</span>}
          </div>
        </form>
      </div>

      {/* Incentive Brackets Editor */}
      <div className="p-8 bg-card border border-border rounded-3xl space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <Icon name="Money03Icon" size={24} className="text-primary" />
              <div>
                <h3 className="font-bold">EPEF Incentive Brackets</h3>
                <p className="text-xs text-muted-foreground italic">Bonus tiers applied when a cycle closes.</p>
              </div>
           </div>
           <Button variant="outline" size="sm" onClick={saveBrackets} disabled={isLoading}>Save All Brackets</Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 border-b border-border/50">
              <tr>
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Bonus Level</th>
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Min EPEF</th>
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Max EPEF</th>
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Multiplier (Per Bird)</th>
                <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {editingBrackets.map((bracket, index) => (
                <tr key={index} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 min-w-48">
                    <Input 
                      value={bracket.description ?? ''} 
                      onChange={(e) => handleBracketChange('description', e.target.value, index)}
                      className="h-9 rounded-lg"
                    />
                  </td>
                  <td className="px-4 py-3 min-w-24">
                    <Input 
                      type="number" 
                      value={bracket.min_epef} 
                      onChange={(e) => handleBracketChange('min_epef', parseInt(e.target.value), index)}
                      className="h-9 rounded-lg"
                    />
                  </td>
                  <td className="px-4 py-3 min-w-24">
                    <Input 
                      type="number" 
                      value={bracket.max_epef} 
                      onChange={(e) => handleBracketChange('max_epef', parseInt(e.target.value), index)} 
                      className="h-9 rounded-lg"
                    />
                  </td>
                  <td className="px-4 py-3 min-w-32">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-primary">₱</span>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={bracket.incentive_rate_per_head ?? ''} 
                        onChange={(e) => handleBracketChange('incentive_rate_per_head', parseFloat(e.target.value), index)}
                        className="h-9 pl-7 rounded-lg"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
                      onClick={() => {
                        if (bracket.id) {
                           deleteEpefBracket(bracket.id);
                        } else {
                           setEditingBrackets(prev => prev.filter((_, i) => i !== index));
                        }
                      }}
                    >
                      <Icon name="Delete01Icon" size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {editingBrackets.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground italic">No bonus tiers defined.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-muted/50 rounded-xl h-10 px-4"
            onClick={() => {
              setEditingBrackets([
                { description: 'Junior Bonus', min_epef: 280, max_epef: 319, incentive_rate_per_head: 1.5 },
                { description: 'Senior Bonus', min_epef: 320, max_epef: 349, incentive_rate_per_head: 2.0 },
                { description: 'Elite Bonus', min_epef: 350, max_epef: 9999, incentive_rate_per_head: 3.0 },
              ]);
            }}
          >
            Reset to Defaults
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary font-bold hover:bg-primary/5 rounded-xl h-10 px-4"
            onClick={() => setEditingBrackets([...editingBrackets, { description: 'New Level', min_epef: 0, max_epef: 0, incentive_rate_per_head: 0 }])}
          >
            <Icon name="Plus01Icon" size={16} className="mr-2" /> Add Tier
          </Button>
        </div>
      </div>
    </div>
  );
}
