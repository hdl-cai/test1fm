import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface DeliveryLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cycleId: string;
  farmId: string;
  orgId: string;
  onSaved?: () => void;
}

const ITEM_TYPES = [
  { value: 'feed', label: 'Feed' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'biologic', label: 'Biologic' },
  { value: 'disinfectant', label: 'Disinfectant' },
  { value: 'other', label: 'Other' },
];

export function DeliveryLogSheet({ isOpen, onClose, cycleId, farmId, orgId, onSaved }: DeliveryLogSheetProps) {
  const [formData, setFormData] = React.useState({
    itemName: '',
    itemType: 'feed',
    quantityDelivered: '',
    unit: 'kg',
    costPerUnit: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName || !formData.quantityDelivered || !formData.costPerUnit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await supabase
        .from('delivered_inputs')
        .insert({
          org_id: orgId,
          cycle_id: cycleId,
          farm_id: farmId,
          item_name: formData.itemName,
          item_type: formData.itemType,
          quantity_delivered: parseFloat(formData.quantityDelivered),
          unit: formData.unit,
          cost_per_unit: parseFloat(formData.costPerUnit),
          delivery_date: formData.deliveryDate,
          notes: formData.notes || null,
        });

      if (error) throw error;

      setFormData({
        itemName: '',
        itemType: 'feed',
        quantityDelivered: '',
        unit: 'kg',
        costPerUnit: '',
        deliveryDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      onSaved?.();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save delivery log.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      itemName: '',
      itemType: 'feed',
      quantityDelivered: '',
      unit: 'kg',
      costPerUnit: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setSubmitError(null);
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleCancel}
      title="Log Delivery"
      description="Record inputs delivered for this production cycle"
      width="lg"
      className={cn("bg-card/95 backdrop-blur-xl border-l border-border/40")}
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-8">
        {submitError && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {submitError}
          </div>
        )}

        {/* Item Name */}
        <div className="space-y-2">
          <Label htmlFor="item-name" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Item Name
          </Label>
          <Input
            id="item-name"
            type="text"
            placeholder="e.g. Starter Mash B1"
            value={formData.itemName}
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Item Type */}
          <div className="space-y-2">
            <Label htmlFor="item-type" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Type
            </Label>
            <div className="relative">
              <select
                id="item-type"
                value={formData.itemType}
                onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                className="w-full bg-muted/20 border-border border rounded-md py-2.5 pl-3 pr-10 text-sm text-foreground focus:border-primary focus:ring-0 focus:outline-none appearance-none transition-colors h-11"
                required
              >
                {ITEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-card">
                    {t.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Icon name="ArrowDown01Icon" size={16} className="text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Delivery Date */}
          <div className="space-y-2">
            <Label htmlFor="delivery-date" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Delivery Date
            </Label>
            <Input
              id="delivery-date"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground transition-colors h-11"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder="0"
              step="any"
              value={formData.quantityDelivered}
              onChange={(e) => setFormData({ ...formData, quantityDelivered: e.target.value })}
              className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
              required
              min="0"
            />
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Label htmlFor="unit" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Unit
            </Label>
            <Input
              id="unit"
              type="text"
              placeholder="kg"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
              required
            />
          </div>

          {/* Cost Per Unit */}
          <div className="space-y-2">
            <Label htmlFor="cost" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Cost/Unit
            </Label>
            <Input
              id="cost"
              type="number"
              placeholder="0.00"
              step="any"
              value={formData.costPerUnit}
              onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
              className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
              required
              min="0"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Notes (Optional)
          </Label>
          <textarea
            id="notes"
            rows={2}
            placeholder="Any delivery notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full bg-muted/20 border-border border rounded-md py-2.5 px-3 text-sm text-foreground focus:border-primary focus:ring-0 focus:outline-none placeholder:text-muted-foreground/30 transition-colors resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-border flex items-center justify-end gap-3 mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 h-11 px-6 transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 h-11 px-8 rounded-lg transition-colors group"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Icon name="CycleIcon" size={16} className="animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Save Delivery</span>
                <Icon name="ArrowRight01Icon" size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

export default DeliveryLogSheet;
