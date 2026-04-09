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
import { useMarketStore } from '@/stores/useMarketStore';

interface HarvestLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cycleId: string;
  orgId: string;
  onSaved?: () => void;
}

export function HarvestLogSheet({ isOpen, onClose, cycleId, orgId, onSaved }: HarvestLogSheetProps) {
  const authOrgId = useAuthStore((state) => state.user?.orgId);
  const resolvedOrgId = authOrgId ?? orgId;
  const { latestPrices, fetchLatestPrice } = useMarketStore();
  const [formData, setFormData] = React.useState({
    harvestDateStart: new Date().toISOString().split('T')[0],
    birdsHarvestedCount: '',
    grossWeightKg: '',
    birdsRejectedCount: '',
    rejectWeightKg: '',
    loadingLossCount: '',
    fleetUsed: '',
    harvestTeamNotes: '',
    salePricePerKg: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Fetch latest market price on open
  React.useEffect(() => {
    if (isOpen && resolvedOrgId) {
      fetchLatestPrice(resolvedOrgId, 'Luzon');
    }
  }, [isOpen, resolvedOrgId, fetchLatestPrice]);

  const latestMarketPrice = latestPrices['Luzon'] ?? null;

  // 15% soft warning: compare entered sale price to current market price
  const priceDeviationWarning = React.useMemo(() => {
    if (!formData.salePricePerKg || !latestMarketPrice) return null;
    const entered = parseFloat(formData.salePricePerKg);
    if (isNaN(entered) || entered <= 0) return null;
    const market = latestMarketPrice.farmgate_price_per_kg;
    const deviation = (market - entered) / market;
    if (deviation > 0.15) {
      return `Entered price ₱${entered.toFixed(2)}/kg is ${(deviation * 100).toFixed(0)}% below the current market rate of ₱${market.toFixed(2)}/kg (Luzon). Confirm before proceeding.`;
    }
    return null;
  }, [formData.salePricePerKg, latestMarketPrice]);

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
        salePricePerKg: '',
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
      salePricePerKg: '',
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

        {/* Market Price Reference */}
        {latestMarketPrice && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/15 flex items-center gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Icon name="TrendingUpIcon" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-micro font-bold uppercase tracking-[0.15em] text-muted-foreground mb-0.5">Current Market Reference</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-bold text-foreground">Live: ₱{latestMarketPrice.farmgate_price_per_kg.toFixed(2)}/kg</span>
                {latestMarketPrice.price_per_kg_carcass && (
                  <span className="text-sm text-muted-foreground">Carcass: ₱{Number(latestMarketPrice.price_per_kg_carcass).toFixed(2)}/kg</span>
                )}
                <span className="text-micro text-muted-foreground/60 italic">{latestMarketPrice.region} · {latestMarketPrice.price_date}</span>
              </div>
            </div>
          </div>
        )}

        {/* Sale Price (optional) — used for 15% market warning */}
        {latestMarketPrice && (
          <div className="space-y-2">
            <Label htmlFor="sale-price" className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Expected Sale Price (optional)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₱</span>
              <Input
                id="sale-price"
                type="number"
                step="0.01"
                min="0"
                placeholder={latestMarketPrice.farmgate_price_per_kg.toFixed(2)}
                value={formData.salePricePerKg}
                onChange={(e) => setFormData({ ...formData, salePricePerKg: e.target.value })}
                className="pl-7 w-full bg-muted/20 border-border border focus:border-primary focus:ring-0 text-foreground placeholder:text-muted-foreground/30 transition-colors h-11"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">Enter the agreed sale price per kg to check against the current market rate.</p>
          </div>
        )}

        {/* 15% Soft Warning */}
        {priceDeviationWarning && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
            <Icon name="AlertCircleIcon" size={16} className="shrink-0 mt-0.5 text-warning" />
            <p className="text-sm text-warning font-medium">{priceDeviationWarning}</p>
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
