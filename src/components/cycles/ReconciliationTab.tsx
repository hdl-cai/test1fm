/**
 * ReconciliationTab
 * 
 * End-of-cycle reconciliation: bird accounting, feed accounting,
 * financial summary, reconciliation notes, and cycle close action.
 * Only visible when cycle has harvest data.
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/hooks/useIcon';
import { MetricCard } from '@/components/shared';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface ReconciliationTabProps {
  cycle: {
    id: string;
    farmId: string;
    birdCount: number;       // initial_birds
    status: string;
  };
  dailyLogs: any[];
  harvestRecords: any[];
  salesRecords: any[];
  deliveredInputs: any[];
  cycleExpenses: any[];
  orgId: string;
  userId: string;
  onCycleClosed?: () => void;
}

export function ReconciliationTab({
  cycle, dailyLogs, harvestRecords, salesRecords, deliveredInputs, cycleExpenses, orgId: _orgId, userId: _userId, onCycleClosed
}: ReconciliationTabProps) {
  const [reconciliationNotes, setReconciliationNotes] = React.useState('');
  const [isClosing, setIsClosing] = React.useState(false);
  const [closeError, setCloseError] = React.useState<string | null>(null);
  const [showConfirm, setShowConfirm] = React.useState(false);

  // ── Bird Accounting ──────────────────────────────────────────────
  const initialDOC = cycle.birdCount || 0;
  const totalMortalities = dailyLogs.reduce((sum, l) => sum + (l.mortality_count || 0), 0);
  const totalCulled = dailyLogs.reduce((sum, l) => sum + (l.culled_count || 0), 0);
  const totalBirdsHarvested = harvestRecords.reduce((sum, h) => sum + (h.birds_harvested_count || 0), 0);
  const unaccountedBirds = initialDOC - totalMortalities - totalCulled - totalBirdsHarvested;

  // ── Feed Accounting ──────────────────────────────────────────────
  const feedDelivered = deliveredInputs
    .filter(d => d.item_type === 'feed')
    .reduce((sum, d) => sum + (parseFloat(d.quantity_delivered) || 0), 0);
  const feedConsumed = dailyLogs.reduce((sum, l) => sum + (parseFloat(l.feed_used_kg) || 0), 0);
  const feedVariance = feedDelivered - feedConsumed;

  // ── Financial Summary ────────────────────────────────────────────
  const totalExpenses = cycleExpenses.reduce((sum, e) => sum + (parseFloat(e.total_paid) || 0), 0);
  const deliveryCosts = deliveredInputs.reduce((sum, d) => sum + (parseFloat(d.total_cost) || 0), 0);
  const totalCosts = totalExpenses + deliveryCosts;

  const totalRevenue = salesRecords.reduce((sum, s) => sum + (parseFloat(s.net_revenue) || 0), 0);
  const netPL = totalRevenue - totalCosts;
  const roiPct = totalCosts > 0 ? ((netPL / totalCosts) * 100) : 0;

  const totalCarcassWeight = salesRecords.reduce((sum, s) => sum + (parseFloat(s.total_weight_kg) || 0), 0);
  const costPerKg = totalCarcassWeight > 0 ? (totalCosts / totalCarcassWeight) : 0;

  const isCycleClosed = cycle.status === 'completed' || cycle.status === 'terminated';

  // ── Close Cycle Handler ──────────────────────────────────────────
  const handleCloseCycle = async () => {
    setIsClosing(true);
    setCloseError(null);

    try {
      const { error } = await supabase
        .from('production_cycles')
        .update({
          status: 'completed',
          actual_end_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', cycle.id);

      if (error) throw error;
      onCycleClosed?.();
    } catch (err: any) {
      setCloseError(err.message || 'Failed to close cycle.');
    } finally {
      setIsClosing(false);
      setShowConfirm(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString('en-PH', { maximumFractionDigits: 2 });
  const fmtCurrency = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {closeError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {closeError}
        </div>
      )}

      {/* ── Bird Accounting ──────────────────────────────────────── */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Icon name="FarmIcon" size={14} />
          Bird Accounting
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard title="Initial DOC" value={fmt(initialDOC)} icon="FarmIcon" iconColor="var(--primary)" />
          <MetricCard title="Total Mortalities" value={fmt(totalMortalities)} icon="ActivityIcon" iconColor="var(--danger)" />
          <MetricCard title="Total Culled" value={fmt(totalCulled)} icon="ActivityIcon" iconColor="var(--warning)" />
          <MetricCard title="Birds Harvested" value={fmt(totalBirdsHarvested)} icon="CheckCircleIcon" iconColor="var(--success)" />
          <div className={cn(
            "bg-card border rounded-2xl p-5 shadow-sm flex flex-col gap-2",
            unaccountedBirds > 0 ? "border-danger/50 bg-danger/5" : "border-border"
          )}>
            <span className="text-micro font-bold uppercase tracking-widest text-muted-foreground">Unaccounted</span>
            <span className={cn(
              "text-2xl font-black tabular-nums",
              unaccountedBirds > 0 ? "text-danger" : "text-foreground"
            )}>
              {fmt(unaccountedBirds)}
            </span>
            {unaccountedBirds > 0 && (
              <span className="text-micro font-semibold text-danger/80">
                ⚠ There are unaccounted birds
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Feed Accounting ──────────────────────────────────────── */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Icon name="BoxIcon" size={14} />
          Feed Accounting
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Feed Delivered" value={`${fmt(feedDelivered)} kg`} icon="BoxIcon" iconColor="var(--chart-1)" />
          <MetricCard title="Feed Consumed" value={`${fmt(feedConsumed)} kg`} icon="ActivityIcon" iconColor="var(--chart-2)" />
          <div className={cn(
            "bg-card border rounded-2xl p-5 shadow-sm flex flex-col gap-2",
            Math.abs(feedVariance) > feedDelivered * 0.05 ? "border-warning/50 bg-warning/5" : "border-border"
          )}>
            <span className="text-micro font-bold uppercase tracking-widest text-muted-foreground">Variance</span>
            <span className={cn(
              "text-2xl font-black tabular-nums",
              feedVariance > 0 ? "text-warning" : feedVariance < 0 ? "text-danger" : "text-foreground"
            )}>
              {feedVariance >= 0 ? '+' : ''}{fmt(feedVariance)} kg
            </span>
            <span className="text-micro text-muted-foreground font-semibold">
              {feedVariance > 0 ? 'Excess feed remaining' : feedVariance < 0 ? 'Consumed more than delivered' : 'Perfectly balanced'}
            </span>
          </div>
        </div>
      </section>

      {/* ── Financial Summary ────────────────────────────────────── */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Icon name="Money01Icon" size={14} />
          Financial Summary
        </h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border/50">
              <tr className="bg-muted/10">
                <td className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-widest text-micro">Total Delivery Costs</td>
                <td className="px-6 py-4 text-right font-bold tabular-nums">{fmtCurrency(deliveryCosts)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-widest text-micro">Other Expenses</td>
                <td className="px-6 py-4 text-right font-bold tabular-nums">{fmtCurrency(totalExpenses)}</td>
              </tr>
              <tr className="bg-muted/10">
                <td className="px-6 py-4 font-black text-foreground uppercase tracking-widest text-xs">Total Costs</td>
                <td className="px-6 py-4 text-right font-black tabular-nums text-foreground">{fmtCurrency(totalCosts)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-widest text-micro">Total Revenue</td>
                <td className="px-6 py-4 text-right font-bold tabular-nums text-success">{fmtCurrency(totalRevenue)}</td>
              </tr>
              <tr className={cn(
                "bg-muted/5",
                netPL >= 0 ? "border-t-2 border-success/30" : "border-t-2 border-danger/30"
              )}>
                <td className="px-6 py-5 font-black text-foreground uppercase tracking-widest text-xs">Net Profit / Loss</td>
                <td className={cn(
                  "px-6 py-5 text-right font-black tabular-nums text-lg",
                  netPL >= 0 ? "text-success" : "text-danger"
                )}>
                  {fmtCurrency(netPL)}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="grid grid-cols-2 gap-px bg-border/50">
            <div className="bg-card px-6 py-4 text-center">
              <span className="block text-micro font-bold uppercase tracking-widest text-muted-foreground mb-1">ROI</span>
              <span className={cn(
                "text-xl font-black tabular-nums",
                roiPct >= 0 ? "text-success" : "text-danger"
              )}>
                {roiPct.toFixed(1)}%
              </span>
            </div>
            <div className="bg-card px-6 py-4 text-center">
              <span className="block text-micro font-bold uppercase tracking-widest text-muted-foreground mb-1">Cost / kg</span>
              <span className="text-xl font-black tabular-nums text-foreground">
                {fmtCurrency(costPerKg)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reconciliation Notes ─────────────────────────────────── */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Icon name="EditIcon" size={14} />
          Reconciliation Notes
        </h3>
        <textarea
          value={reconciliationNotes}
          onChange={(e) => setReconciliationNotes(e.target.value)}
          rows={4}
          disabled={isCycleClosed}
          placeholder="Add any reconciliation notes, observations, or discrepancy explanations..."
          className="w-full bg-muted/20 border-border border rounded-xl py-3 px-4 text-sm text-foreground focus:border-primary focus:ring-0 focus:outline-none placeholder:text-muted-foreground/30 transition-colors resize-none disabled:opacity-50"
        />
      </section>

      {/* ── Close Cycle Action ───────────────────────────────────── */}
      {!isCycleClosed && (
        <section className="pt-4 border-t border-border">
          {showConfirm ? (
            <div className="bg-warning/5 border border-warning/30 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="AlertIcon" size={20} className="text-warning" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Close this production cycle?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    This action will mark the cycle as completed. All "Add" and "Log" buttons will be disabled.
                    {unaccountedBirds > 0 && (
                      <span className="text-danger font-bold"> There are {unaccountedBirds} unaccounted birds.</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowConfirm(false)}
                  disabled={isClosing}
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCloseCycle}
                  disabled={isClosing}
                  className="bg-warning hover:bg-warning/90 text-warning-foreground font-bold px-6"
                >
                  {isClosing ? (
                    <div className="flex items-center gap-2">
                      <Icon name="CycleIcon" size={16} className="animate-spin" />
                      <span>Closing...</span>
                    </div>
                  ) : (
                    'Yes, Close Cycle'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Once all data is verified, close this cycle to finalize reconciliation.
              </p>
              <Button
                onClick={() => setShowConfirm(true)}
                variant="outline"
                className="border-warning/50 text-warning hover:bg-warning/10 font-bold px-6"
              >
                <Icon name="CheckCircleIcon" size={16} className="mr-2" />
                Close Cycle
              </Button>
            </div>
          )}
        </section>
      )}

      {isCycleClosed && (
        <div className="bg-success/5 border border-success/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
            <Icon name="CheckCircleIcon" size={18} className="text-success" />
          </div>
          <span className="text-sm font-bold text-success">This cycle has been closed and reconciled.</span>
        </div>
      )}
    </div>
  );
}
