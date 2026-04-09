import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/hooks/useIcon';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFarmsStore } from '@/stores/useFarmsStore';
import type { SavePurchaseOrderInput, OrderItemInput } from '@/lib/data/purchase-orders';
import type { InventoryCatalogueItem } from '@/lib/data/inventory';
import { fetchInventoryCatalogue } from '@/lib/data/inventory';
import { getErrorMessage } from '@/lib/data/errors';
import { formatPHP } from '@/lib/utils';

interface PurchaseOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

interface LineItem extends OrderItemInput {
  tempId: string;
  itemName: string;
  unit: string;
  estimatedTotal: number;
}

export function PurchaseOrderForm({ isOpen, onClose, onSaved }: PurchaseOrderFormProps) {
  const { createPurchaseOrder, suppliers } = useInventoryStore();
  const { user } = useAuthStore();
  const { farms } = useFarmsStore();

  const [form, setForm] = React.useState({
    farmId: '',
    supplierId: '',
    orderDate: new Date().toISOString().slice(0, 10),
    expectedDelivery: '',
    notes: '',
  });
  const [lineItems, setLineItems] = React.useState<LineItem[]>([]);
  const [catalogueItems, setCatalogueItems] = React.useState<InventoryCatalogueItem[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    setForm({ farmId: '', supplierId: '', orderDate: new Date().toISOString().slice(0, 10), expectedDelivery: '', notes: '' });
    setLineItems([]);
    setError(null);
    if (user?.orgId) {
      fetchInventoryCatalogue(user.orgId).then(setCatalogueItems).catch(() => {});
    }
  }, [isOpen, user?.orgId]);

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { tempId: crypto.randomUUID(), itemId: '', itemName: '', unit: '', qty: 1, price: null, estimatedTotal: 0 },
    ]);
  };

  const removeLineItem = (tempId: string) => {
    setLineItems((prev) => prev.filter((li) => li.tempId !== tempId));
  };

  const updateLineItem = (tempId: string, field: keyof Omit<LineItem, 'tempId'>, value: string | number | null) => {
    setLineItems((prev) =>
      prev.map((li) => {
        if (li.tempId !== tempId) return li;
        const updated = { ...li, [field]: value };
        if (field === 'itemId') {
          const cat = catalogueItems.find((c) => c.id === value);
          updated.itemName = cat?.name ?? '';
          updated.unit = cat?.unit ?? '';
        }
        updated.estimatedTotal = (updated.qty || 0) * (updated.price || 0);
        return updated;
      })
    );
  };

  const totalAmount = lineItems.reduce((sum, li) => sum + li.estimatedTotal, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.farmId) { setError('Please select a farm.'); return; }
    if (lineItems.length === 0) { setError('Add at least one line item.'); return; }
    const invalidItem = lineItems.find((li) => !li.itemId || li.qty <= 0);
    if (invalidItem) { setError('All line items need an item and valid quantity.'); return; }

    setIsSaving(true);
    setError(null);
    try {
      const input: SavePurchaseOrderInput = {
        orgId: user?.orgId,
        farmId: form.farmId,
        supplierId: form.supplierId || null,
        orderDate: form.orderDate || null,
        expectedDelivery: form.expectedDelivery || null,
        notes: form.notes.trim() || null,
        lineItems: lineItems.map((li) => ({ itemId: li.itemId, qty: li.qty, price: li.price })),
      };
      await createPurchaseOrder(input);
      onSaved?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create purchase order.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Create Purchase Order"
      description="Draft a new purchase order with line items."
      width="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-danger/5 border border-danger/20 text-danger text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Farm <span className="text-danger">*</span>
              </label>
              <select
                value={form.farmId}
                onChange={(e) => setForm((p) => ({ ...p, farmId: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select farm...</option>
                {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Supplier</label>
              <select
                value={form.supplierId}
                onChange={(e) => setForm((p) => ({ ...p, supplierId: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select supplier...</option>
                {suppliers.filter((s) => !s.is_archived).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Order Date</label>
              <input
                type="date"
                value={form.orderDate}
                onChange={(e) => setForm((p) => ({ ...p, orderDate: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Expected Delivery</label>
              <input
                type="date"
                value={form.expectedDelivery}
                onChange={(e) => setForm((p) => ({ ...p, expectedDelivery: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Line Items <span className="text-danger">*</span>
              </label>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="h-8 px-3">
                <Icon name="AddIcon" size={14} className="mr-1" />
                Add Item
              </Button>
            </div>

            {lineItems.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
                No items added. Click "Add Item" to start.
              </div>
            ) : (
              <div className="space-y-3">
                {lineItems.map((li) => (
                  <div key={li.tempId} className="flex items-start gap-3 p-3 border border-border rounded-xl bg-muted/10">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div className="col-span-3 sm:col-span-1">
                        <select
                          value={li.itemId}
                          onChange={(e) => updateLineItem(li.tempId, 'itemId', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Select item...</option>
                          {catalogueItems.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="relative">
                          <input
                            type="number"
                            min={0.01}
                            step="any"
                            value={li.qty}
                            onChange={(e) => updateLineItem(li.tempId, 'qty', parseFloat(e.target.value) || 0)}
                            placeholder="Qty"
                            className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          {li.unit && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{li.unit}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={li.price ?? ''}
                          onChange={(e) => updateLineItem(li.tempId, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="Unit price (₱)"
                          className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-sm font-bold tabular-nums text-foreground min-w-[80px] text-right">
                        {li.estimatedTotal > 0 ? formatPHP(li.estimatedTotal) : '—'}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg text-muted-foreground hover:text-danger"
                        onClick={() => removeLineItem(li.tempId)}
                      >
                        <Icon name="Delete02Icon" size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {lineItems.length > 0 && (
              <div className="flex justify-end mt-3">
                <div className="text-sm text-muted-foreground">
                  Estimated Total: <span className="font-bold text-foreground">{formatPHP(totalAmount)}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              placeholder="Additional notes..."
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>

        <div className="border-t border-border p-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Creating...' : 'Create PO'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
