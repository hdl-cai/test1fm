import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { addHarvestLogRecord } from '@/lib/data/cycles';
import { getErrorMessage } from '@/lib/data/errors';
import { useAuthStore } from '@/stores/useAuthStore';

interface HarvestLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cycleId: string;
  orgId: string;
  onSaved?: () => void;
}

export function HarvestLogSheet({ isOpen, onClose, cycleId, orgId, onSaved }: HarvestLogSheetProps) {
  const authOrgId = useAuthStore((state) => state.user?.orgId);
  const [formData, setFormData] = React.useState({
    harvestDateStart: new Date().toISOString().split('T')[0],
    birdsHarvestedCount: '',
    grossWeightKg: '',
    birdsRejectedCount: '',
    rejectWeightKg: '',
    loadingLossCount: '',
    fleetUsed: '',
    harvestTeamNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.birdsHarvestedCount || !formData.grossWeightKg) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await addHarvestLogRecord({
        orgId: authOrgId ?? orgId,
        cycleId,
        harvestDateStart: formData.harvestDateStart,
        birdsHarvestedCount: parseInt(formData.birdsHarvestedCount),
        grossWeightKg: parseFloat(formData.grossWeightKg),
        birdsRejectedCount: parseInt(formData.birdsRejectedCount) || 0,
        rejectWeightKg: parseFloat(formData.rejectWeightKg) || 0,
        loadingLossCount: parseInt(formData.loadingLossCount) || 0,
        fleetUsed: formData.fleetUsed || undefined,
        harvestTeamNotes: formData.harvestTeamNotes || undefined,
      });

      setFormData({
        harvestDateStart: new Date().toISOString().split('T')[0],
        birdsHarvestedCount: '',
        grossWeightKg: '',
        birdsRejectedCount: '',
        rejectWeightKg: '',
        loadingLossCount: '',
        fleetUsed: '',
        harvestTeamNotes: '',
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to save harvest log.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      harvestDateStart: new Date().toISOString().split('T')[0],
      birdsHarvestedCount: '',
      grossWeightKg: '',
      birdsRejectedCount: '',
      rejectWeightKg: '',
      loadingLossCount: '',
      fleetUsed: '',
      harvestTeamNotes: '',
    });
    setSubmitError(null);
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleCancel}
      title="Log Harvest"
      description="Record harvest data for this production cycle"
      width="lg"
      className={cn("bg-card/95 backdrop-blur-xl border-l border-border/40")}
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-8">
        {submitError && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {submitError}
          </div>
        )}

        {/* Harvest Date */}
        <div className="space-y-2">
          <Label htmlFor="harvest-date" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Harvest Date
          </Label>
          <Input
            id="harvest-date"
            type="date"
            value={formData.harvestDateStart}
            onChange={(e) => setFormData({ ...formData, harvestDateStart: e.target.value })}
            className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground transition-colors h-11"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Birds Harvested Count */}
          <div className="space-y-2">
            <Label htmlFor="birds-count" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Birds Harvested
            </Label>
            <Input
              id="birds-count"
              type="number"
              placeholder="0"
              value={formData.birdsHarvestedCount}
              onChange={(e) => setFormData({ ...formData, birdsHarvestedCount: e.target.value })}
              className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
              required
              min="1"
            />
          </div>

          {/* Gross Weight */}
          <div className="space-y-2">
            <Label htmlFor="gross-weight" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Gross Weight (kg)
            </Label>
            <Input
              id="gross-weight"
              type="number"
              placeholder="0.00"
              step="any"
              value={formData.grossWeightKg}
              onChange={(e) => setFormData({ ...formData, grossWeightKg: e.target.value })}
              className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
              required
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Birds Rejected */}
          <div className="space-y-2">
            <Label htmlFor="rejected-count" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Rejected
            </Label>
            <Input
              id="rejected-count"
              type="number"
              placeholder="0"
              value={formData.birdsRejectedCount}
              onChange={(e) => setFormData({ ...formData, birdsRejectedCount: e.target.value })}
              className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
              min="0"
            />
          </div>

          {/* Reject Weight */}
          <div className="space-y-2">
            <Label htmlFor="reject-weight" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Reject Wt (kg)
            </Label>
            <Input
              id="reject-weight"
              type="number"
              placeholder="0.00"
              step="any"
              value={formData.rejectWeightKg}
              onChange={(e) => setFormData({ ...formData, rejectWeightKg: e.target.value })}
              className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
              min="0"
            />
          </div>

          {/* Loading Loss */}
          <div className="space-y-2">
            <Label htmlFor="loading-loss" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Loading Loss
            </Label>
            <Input
              id="loading-loss"
              type="number"
              placeholder="0"
              value={formData.loadingLossCount}
              onChange={(e) => setFormData({ ...formData, loadingLossCount: e.target.value })}
              className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
              min="0"
            />
          </div>
        </div>

        {/* Fleet Used */}
        <div className="space-y-2">
          <Label htmlFor="fleet" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Fleet Used (Optional)
          </Label>
          <Input
            id="fleet"
            type="text"
            placeholder="e.g. Utility Trucks"
            value={formData.fleetUsed}
            onChange={(e) => setFormData({ ...formData, fleetUsed: e.target.value })}
            className="w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Team Notes (Optional)
          </Label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Any notes about the harvest..."
            value={formData.harvestTeamNotes}
            onChange={(e) => setFormData({ ...formData, harvestTeamNotes: e.target.value })}
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
                <span>Save Harvest Log</span>
                <Icon name="ArrowRight01Icon" size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

export default HarvestLogSheet;
