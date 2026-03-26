/**
 * FinancialsTab
 * 
 * Per-cycle financial summary: expense breakdown by category,
 * revenue breakdown from harvest sales, P&L, ROI, cost/kg,
 * and an "Add Manual Expense" form.
 * Admin only.
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Sheet } from '@/components/ui/sheet';
import { useAuthStore } from '@/stores/useAuthStore';
import type { CycleExpenseRow, DeliveredInputRow, HarvestSaleRow } from '@/lib/data-adapters';

interface FinancialsTabProps {
  cycle: {
    id: string;
    farmId: string;
    status: string;
  };
  salesRecords: HarvestSaleRow[];
  deliveredInputs: DeliveredInputRow[];
  cycleExpenses: (CycleExpenseRow & { expense_categories?: { name: string } | null })[];
  orgId: string;
  userId: string;
  onRefetch?: () => void;
}

interface ExpenseCategory {
  id: string;
  name: string;
}

export function FinancialsTab({
  cycle, salesRecords, deliveredInputs, cycleExpenses, orgId, userId, onRefetch
}: FinancialsTabProps) {
  const authOrgId = useAuthStore((state) => state.user?.orgId);
  const authUserId = useAuthStore((state) => state.user?.id);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [categories, setCategories] = React.useState<ExpenseCategory[]>([]);

  // Form state
  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');

  // Fetch expense categories on mount
  React.useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('expense_categories')
        .select('id, name')
        .order('name');
      if (data) setCategories(data);
    }
    loadCategories();
  }, []);

  const fmtCurrency = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ── Expense Breakdown ────────────────────────────────────────────
  // Group delivery costs by item_type
  const feedCosts = deliveredInputs
    .filter(d => d.item_type === 'feed')
    .reduce((sum, d) => sum + Number(d.total_cost || 0), 0);
  const medicineCosts = deliveredInputs
    .filter(d => d.item_type === 'medicine' || d.item_type === 'biologic')
    .reduce((sum, d) => sum + Number(d.total_cost || 0), 0);
  const otherDeliveryCosts = deliveredInputs
    .filter(d => !['feed', 'medicine', 'biologic'].includes(d.item_type))
    .reduce((sum, d) => sum + Number(d.total_cost || 0), 0);

  // Group cycle_expenses by category
  const expensesByCategory = cycleExpenses.reduce((acc: Record<string, number>, e) => {
    const catName = e.expense_categories?.name || 'Uncategorized';
    acc[catName] = (acc[catName] || 0) + Number(e.total_paid || 0);
    return acc;
  }, {} as Record<string, number>);

  const totalDeliveryCosts = feedCosts + medicineCosts + otherDeliveryCosts;
  const totalManualExpenses = cycleExpenses.reduce((sum, e) => sum + Number(e.total_paid || 0), 0);
  const totalExpenses = totalDeliveryCosts + totalManualExpenses;

  // ── Revenue Breakdown ────────────────────────────────────────────
  const totalRevenue = salesRecords.reduce((sum, s) => sum + Number(s.net_revenue || 0), 0);
  const totalCarcassWeight = salesRecords.reduce((sum, s) => sum + Number(s.total_weight_kg || 0), 0);

  // ── P&L ──────────────────────────────────────────────────────────
  const netPL = totalRevenue - totalExpenses;
  const roiPct = totalExpenses > 0 ? ((netPL / totalExpenses) * 100) : 0;
  const costPerKg = totalCarcassWeight > 0 ? (totalExpenses / totalCarcassWeight) : 0;

  // ── Add Manual Expense ───────────────────────────────────────────
  const handleAddExpense = async () => {
    if (!description.trim() || !amount || !categoryId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const resolvedOrgId = authOrgId ?? orgId;
      const resolvedUserId = authUserId ?? userId;
      if (!resolvedOrgId || !resolvedUserId) {
        throw new Error('You must be signed in to add a manual expense.');
      }

      const amountVal = parseFloat(amount);
      if (isNaN(amountVal) || amountVal <= 0) throw new Error('Amount must be a positive number');

      const { error } = await supabase
        .from('cycle_expenses')
        .insert({
          org_id: resolvedOrgId,
          cycle_id: cycle.id,
          farm_id: cycle.farmId,
          category_id: categoryId,
          description: description.trim(),
          amount_excl_vat: amountVal,
          total_paid: amountVal,
          submitted_by: resolvedUserId,
          status: 'approved',
        });

      if (error) throw error;

      // Reset form
      setDescription('');
      setAmount('');
      setCategoryId('');
      setIsAddExpenseOpen(false);
      onRefetch?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isClosed = cycle.status === 'completed' || cycle.status === 'terminated';

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* ── Header + Add Expense Button ──────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Cycle P&L</h3>
          <p className="text-sm text-muted-foreground">Financial breakdown for this production cycle</p>
        </div>
        {!isClosed && (
          <Button
            onClick={() => setIsAddExpenseOpen(true)}
            className="bg-primary hover:bg-primary/90 font-bold"
            size="sm"
          >
            <Icon name="AddCircleIcon" size={16} className="mr-2" />
            Add Expense
          </Button>
        )}
      </div>

      {/* ── P&L Summary Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="block text-micro font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Expenses</span>
          <span className="text-xl font-black tabular-nums text-foreground">{fmtCurrency(totalExpenses)}</span>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="block text-micro font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Revenue</span>
          <span className="text-xl font-black tabular-nums text-success">{fmtCurrency(totalRevenue)}</span>
        </div>
        <div className={cn(
          "bg-card border rounded-2xl p-5 shadow-sm",
          netPL >= 0 ? "border-success/30" : "border-danger/30"
        )}>
          <span className="block text-micro font-bold uppercase tracking-widest text-muted-foreground mb-2">Net P&L</span>
          <span className={cn(
            "text-xl font-black tabular-nums",
            netPL >= 0 ? "text-success" : "text-danger"
          )}>
            {fmtCurrency(netPL)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-card p-4 text-center">
            <span className="block text-micro font-bold uppercase tracking-widest text-muted-foreground mb-1">ROI</span>
            <span className={cn(
              "text-lg font-black tabular-nums",
              roiPct >= 0 ? "text-success" : "text-danger"
            )}>
              {roiPct.toFixed(1)}%
            </span>
          </div>
          <div className="bg-card p-4 text-center">
            <span className="block text-micro font-bold uppercase tracking-widest text-muted-foreground mb-1">Cost/kg</span>
            <span className="text-lg font-black tabular-nums text-foreground">{fmtCurrency(costPerKg)}</span>
          </div>
        </div>
      </div>

      {/* ── Expense Breakdown Table ──────────────────────────────── */}
      <section>
        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Icon name="ArrowDown01Icon" size={14} />
          Expense Breakdown
        </h4>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-left font-bold text-muted-foreground uppercase tracking-widest text-micro">Category</th>
                <th className="px-6 py-3 text-right font-bold text-muted-foreground uppercase tracking-widest text-micro">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {/* Delivery-derived costs */}
              {feedCosts > 0 && (
                <tr>
                  <td className="px-6 py-3 text-foreground">🌾 Feed (deliveries)</td>
                  <td className="px-6 py-3 text-right font-semibold tabular-nums">{fmtCurrency(feedCosts)}</td>
                </tr>
              )}
              {medicineCosts > 0 && (
                <tr>
                  <td className="px-6 py-3 text-foreground">💊 Medicine & Biologics (deliveries)</td>
                  <td className="px-6 py-3 text-right font-semibold tabular-nums">{fmtCurrency(medicineCosts)}</td>
                </tr>
              )}
              {otherDeliveryCosts > 0 && (
                <tr>
                  <td className="px-6 py-3 text-foreground">📦 Other Supplies (deliveries)</td>
                  <td className="px-6 py-3 text-right font-semibold tabular-nums">{fmtCurrency(otherDeliveryCosts)}</td>
                </tr>
              )}

              {/* Manual expenses by category */}
              {Object.entries(expensesByCategory).map(([catName, catAmount]) => (
                <tr key={catName}>
                  <td className="px-6 py-3 text-foreground">📋 {catName}</td>
                  <td className="px-6 py-3 text-right font-semibold tabular-nums">{fmtCurrency(catAmount as number)}</td>
                </tr>
              ))}

              {/* Total row */}
              <tr className="bg-muted/20 border-t-2 border-border">
                <td className="px-6 py-4 font-black text-foreground uppercase tracking-widest text-xs">Total Expenses</td>
                <td className="px-6 py-4 text-right font-black tabular-nums text-foreground">{fmtCurrency(totalExpenses)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Revenue Breakdown Table ──────────────────────────────── */}
      <section>
        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Icon name="ArrowUp01Icon" size={14} />
          Revenue Breakdown
        </h4>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-left font-bold text-muted-foreground uppercase tracking-widest text-micro">Harvest</th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground uppercase tracking-widest text-micro">Birds</th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground uppercase tracking-widest text-micro">Weight (kg)</th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground uppercase tracking-widest text-micro">Price/kg</th>
                <th className="px-6 py-3 text-right font-bold text-muted-foreground uppercase tracking-widest text-micro">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {salesRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">
                    No sales recorded yet
                  </td>
                </tr>
              ) : (
                salesRecords.map((sale, idx) => (
                  <tr key={sale.id || idx}>
                    <td className="px-6 py-3 text-foreground font-medium">
                      {sale.buyer_name || `Sale #${idx + 1}`}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{(sale.total_head_count || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{Number(sale.total_weight_kg || 0).toLocaleString('en-PH', { maximumFractionDigits: 1 })}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{fmtCurrency(Number(sale.price_per_kg_actual || 0))}</td>
                    <td className="px-6 py-3 text-right font-semibold tabular-nums text-success">{fmtCurrency(Number(sale.net_revenue || 0))}</td>
                  </tr>
                ))
              )}
              {salesRecords.length > 0 && (
                <tr className="bg-muted/20 border-t-2 border-border">
                  <td colSpan={4} className="px-6 py-4 font-black text-foreground uppercase tracking-widest text-xs">Total Revenue</td>
                  <td className="px-6 py-4 text-right font-black tabular-nums text-success">{fmtCurrency(totalRevenue)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Add Manual Expense Sheet ─────────────────────────────── */}
      <Sheet isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} title="Add Manual Expense">
          <div className="space-y-6">
            {submitError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {submitError}
              </div>
            )}

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-muted/20 border-border border rounded-xl py-3 px-4 text-sm text-foreground focus:border-primary focus:ring-0 focus:outline-none transition-colors"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description *</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Electricity bill for March"
                className="w-full bg-muted/20 border-border border rounded-xl py-3 px-4 text-sm text-foreground focus:border-primary focus:ring-0 focus:outline-none placeholder:text-muted-foreground/30 transition-colors"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount (₱) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full bg-muted/20 border-border border rounded-xl py-3 px-4 text-sm text-foreground focus:border-primary focus:ring-0 focus:outline-none placeholder:text-muted-foreground/30 transition-colors tabular-nums"
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleAddExpense}
              disabled={isSubmitting || !description.trim() || !amount || !categoryId}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Icon name="CycleIcon" size={16} className="animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Expense'
              )}
            </Button>
          </div>
      </Sheet>
    </div>
  );
}
