import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function HealthSection() {
  const { user } = useAuthStore();
  const { 
    vaccinationTemplates, 
    fetchVaccinationTemplates,
    syncTemplateItems,
    resetToBaiStandard,
    isLoading 
  } = useSettingsStore();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<any[]>([]);

  useEffect(() => {
    if (user?.orgId) {
      fetchVaccinationTemplates(user.orgId);
    }
  }, [user?.orgId, fetchVaccinationTemplates]);

  useEffect(() => {
    if (vaccinationTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(vaccinationTemplates[0].id);
    }
  }, [vaccinationTemplates, selectedTemplateId]);

  const selectedTemplate = vaccinationTemplates.find(t => t.id === selectedTemplateId);

  const handleStartEdit = () => {
    if (selectedTemplate) {
      setEditedItems([...(selectedTemplate.items || [])].sort((a, b) => (a.target_age_days || 0) - (b.target_age_days || 0)));
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplateId) return;
    try {
      await syncTemplateItems(selectedTemplateId, editedItems);
      setIsEditing(false);
      toast.success('Vaccination protocol saved.');
    } catch {
      toast.error('Failed to save protocol.');
    }
  };

  const handleReset = async () => {
    if (!user?.orgId) return;
    try {
      await resetToBaiStandard(user.orgId);
      toast.success('Reset to BAI Standard successful.');
      setIsEditing(false);
    } catch {
      toast.error('Failed to reset protocol.');
    }
  };

  const addItem = () => {
    setEditedItems([...editedItems, { 
      target_age_days: editedItems.length > 0 ? Math.max(...editedItems.map(i => i.target_age_days)) + 1 : 0,
      vaccine_name: '',
      admin_method: 'Drinking Water',
      is_optional: false,
      notes: ''
    }]);
  };

  const removeItem = (index: number) => {
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...editedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditedItems(newItems);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Health & Vaccination</h2>
          <p className="text-muted-foreground text-sm">Define and manage standard vaccination protocols for your farm batches.</p>
        </div>
        {!isEditing ? (
          <div className="flex items-center gap-3">
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Icon name="Refresh01Icon" size={14} />
                  Reset to BAI Standard
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset to BAI Standard?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will overwrite your current organization protocol with the Bureau of Animal Industry (BAI) standard schedule. This action cannot be undone. Vaccination schedules already generated for active cycles will not be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="rounded-xl bg-primary text-white">Reset Protocol</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleStartEdit} size="sm" className="gap-2">
              <Icon name="Edit01Icon" size={14} />
              Edit Protocol
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setIsEditing(false)} size="sm">Cancel</Button>
            <Button onClick={handleSave} size="sm" className="gap-2" disabled={isLoading}>
              <Icon name="Save01Icon" size={14} />
              {isLoading ? 'Saving...' : 'Save Protocol'}
            </Button>
          </div>
        )}
      </div>

      <div className="p-8 bg-muted/20 border border-border/50 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
              <Icon name="FileCode01Icon" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold">{selectedTemplate?.name || 'Standard Protocol'}</h3>
              <p className="text-xs text-muted-foreground">{selectedTemplate?.description || 'Standard Broiler Vaccination Schedule'}</p>
            </div>
          </div>
          {selectedTemplate?.is_system_default && (
             <span className="badge badge-pill badge-primary text-[10px]">SYSTEM DEFAULT</span>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <div className="col-span-2">Age (Days)</div>
            <div className="col-span-4">Vaccine / Treatment</div>
            <div className="col-span-3">Method</div>
            <div className="col-span-2 text-center">Required</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-2">
            {(isEditing ? editedItems : (selectedTemplate?.items || [])).sort((a: any, b: any) => (a.target_age_days || 0) - (b.target_age_days || 0)).map((item: any, idx: number) => (
              <div 
                key={idx} 
                className={cn(
                  "grid grid-cols-12 gap-4 items-center p-4 rounded-2xl border transition-all",
                  isEditing ? "bg-card border-border shadow-sm" : "bg-muted/30 border-transparent"
                )}
              >
                <div className="col-span-2">
                  {isEditing ? (
                    <Input 
                      type="number" 
                      value={item.target_age_days} 
                      onChange={(e) => updateItem(idx, 'target_age_days', parseInt(e.target.value))}
                      className="h-9 rounded-xl text-center font-data"
                    />
                  ) : (
                    <span className="text-sm font-bold font-data text-primary">Day {item.target_age_days}</span>
                  )}
                </div>
                <div className="col-span-4">
                  {isEditing ? (
                    <Input 
                      value={item.vaccine_name} 
                      onChange={(e) => updateItem(idx, 'vaccine_name', e.target.value)}
                      placeholder="e.g. B1B1 / La Sota"
                      className="h-9 rounded-xl"
                    />
                  ) : (
                    <span className="text-sm font-bold">{item.vaccine_name}</span>
                  )}
                </div>
                <div className="col-span-3">
                  {isEditing ? (
                    <Input 
                      value={item.admin_method} 
                      onChange={(e) => updateItem(idx, 'admin_method', e.target.value)}
                      placeholder="e.g. Drinking Water"
                      className="h-9 rounded-xl"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground font-medium">{item.admin_method}</span>
                  )}
                </div>
                <div className="col-span-2 flex justify-center">
                   {isEditing ? (
                      <button 
                        onClick={() => updateItem(idx, 'is_optional', !item.is_optional)}
                        className={cn(
                          "w-10 h-6 rounded-full relative transition-colors",
                          !item.is_optional ? "bg-success" : "bg-muted"
                        )}
                      >
                         <div className={cn(
                           "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                           !item.is_optional ? "left-5" : "left-1"
                         )} />
                      </button>
                   ) : (
                     !item.is_optional ? (
                       <Icon name="CheckmarkBadge01Icon" size={18} className="text-success" />
                     ) : (
                       <span className="text-[10px] text-muted-foreground uppercase font-bold text-center">Optional</span>
                     )
                   )}
                </div>
                <div className="col-span-1 flex justify-end">
                   {isEditing && (
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       onClick={() => removeItem(idx)}
                       className="w-8 h-8 rounded-lg text-danger hover:bg-danger/10"
                     >
                       <Icon name="Delete02Icon" size={14} />
                     </Button>
                   )}
                </div>
              </div>
            ))}

            {isEditing && (
              <Button 
                variant="outline" 
                onClick={addItem}
                className="w-full h-12 rounded-2xl border-dashed border-2 hover:bg-muted/50 gap-2"
              >
                <Icon name="Plus01Icon" size={18} />
                Add Row
              </Button>
            )}

            {!isEditing && (selectedTemplate?.items || []).length === 0 && (
              <div className="p-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
                 <Icon name="FileCode01Icon" size={48} className="text-muted-foreground/30 mb-4" />
                 <h4 className="font-bold text-muted-foreground">No Items Defined</h4>
                 <p className="text-xs text-muted-foreground mt-1">Start by adding a protocol or resetting to BAI standard.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {!isEditing && (
        <div className="flex items-start gap-4 p-6 bg-info/5 border border-info/20 rounded-3xl">
           <Icon name="InformationCircleIcon" size={20} className="text-info mt-1" />
           <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-info">Protocol Guidelines</span>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                Standard protocols defined here will be automatically applied as defaults when creating new production cycles. Managers can still override these settings per individual batch if specific conditions require adjustment.
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
