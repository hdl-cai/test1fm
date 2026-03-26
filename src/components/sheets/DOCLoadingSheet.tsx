import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { addDocLoadingRecord } from '@/lib/data/cycles';
import { getErrorMessage } from '@/lib/data/errors';
import { useAuthStore } from '@/stores/useAuthStore';

interface DOCLoadingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cycleId: string;
  orgId: string;
  onSaved?: () => void;
}

export function DOCLoadingSheet({ isOpen, onClose, cycleId, orgId, onSaved }: DOCLoadingSheetProps) {
  const userId = useAuthStore((state) => state.user?.id);
  const authOrgId = useAuthStore((state) => state.user?.orgId);
  const [formData, setFormData] = React.useState({
    hatcheryName: '',
    sourceFarmCertNo: '',
    deliveredQuantity: '',
    actualPlacedQuantity: '',
    deadOnArrivalCount: '',
    averageChickWeightG: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sourceFarmCertNo || !formData.deliveredQuantity || !formData.actualPlacedQuantity) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await addDocLoadingRecord({
        orgId: authOrgId ?? orgId,
        userId: userId ?? null,
        cycleId,
        hatcheryName: formData.hatcheryName || undefined,
        sourceFarmCertNo: formData.sourceFarmCertNo,
        deliveredQuantity: parseInt(formData.deliveredQuantity),
        actualPlacedQuantity: parseInt(formData.actualPlacedQuantity),
        deadOnArrivalCount: parseInt(formData.deadOnArrivalCount) || 0,
        averageChickWeightG: formData.averageChickWeightG ? parseFloat(formData.averageChickWeightG) : null,
      });

      setFormData({
        hatcheryName: '',
        sourceFarmCertNo: '',
        deliveredQuantity: '',
        actualPlacedQuantity: '',
        deadOnArrivalCount: '',
        averageChickWeightG: '',
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to save DOC loading record.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      hatcheryName: '',
      sourceFarmCertNo: '',
      deliveredQuantity: '',
      actualPlacedQuantity: '',
      deadOnArrivalCount: '',
      averageChickWeightG: '',
    });
    setSubmitError(null);
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleCancel}
      title="Record DOC Loading"
      description="Day-Old Chick arrival and placement data"
      width="lg"
      className={cn("bg-card/95 backdrop-blur-xl border-l border-border/40")}
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-8">
        {submitError && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {submitError}
          </div>
        )}

        {/* Hatchery Name */}
        <div className="space-y-2">
          <Label htmlFor="hatchery" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Hatchery Name (Optional)
          </Label>
          <Input
            id="hatchery"
            type="text"
            placeholder="e.g. San Miguel Hatchery"
            value={formData.hatcheryName}
            onChange={(e) => setFormData({ ...formData, hatcheryName: e.target.value })}
            className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
          />
        </div>

        {/* Source Farm Cert */}
        <div className="space-y-2">
          <Label htmlFor="cert-no" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Source Farm Certificate No.
          </Label>
          <Input
            id="cert-no"
            type="text"
            placeholder="e.g. CERT-2026-001"
            value={formData.sourceFarmCertNo}
            onChange={(e) => setFormData({ ...formData, sourceFarmCertNo: e.target.value })}
            className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Delivered Quantity */}
          <div className="space-y-2">
            <Label htmlFor="delivered-qty" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Delivered Quantity
            </Label>
            <Input
              id="delivered-qty"
              type="number"
              placeholder="0"
              value={formData.deliveredQuantity}
              onChange={(e) => setFormData({ ...formData, deliveredQuantity: e.target.value })}
              className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
              required
              min="1"
            />
          </div>

          {/* Actual Placed */}
          <div className="space-y-2">
            <Label htmlFor="placed-qty" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Actual Placed
            </Label>
            <Input
              id="placed-qty"
              type="number"
              placeholder="0"
              value={formData.actualPlacedQuantity}
              onChange={(e) => setFormData({ ...formData, actualPlacedQuantity: e.target.value })}
              className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
              required
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* DOA Count */}
          <div className="space-y-2">
            <Label htmlFor="doa" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Dead on Arrival
            </Label>
            <Input
              id="doa"
              type="number"
              placeholder="0"
              value={formData.deadOnArrivalCount}
              onChange={(e) => setFormData({ ...formData, deadOnArrivalCount: e.target.value })}
              className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
              min="0"
            />
          </div>

          {/* Avg Chick Weight */}
          <div className="space-y-2">
            <Label htmlFor="avg-weight" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Avg Chick Weight (g)
            </Label>
            <Input
              id="avg-weight"
              type="number"
              placeholder="e.g. 42"
              step="any"
              value={formData.averageChickWeightG}
              onChange={(e) => setFormData({ ...formData, averageChickWeightG: e.target.value })}
              className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
              min="0"
            />
          </div>
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
                <span>Save DOC Record</span>
                <Icon name="ArrowRight01Icon" size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

export default DOCLoadingSheet;
