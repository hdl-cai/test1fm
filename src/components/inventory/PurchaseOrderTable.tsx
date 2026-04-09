import * as React from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { TableHeader } from '@/components/ui/table-header';
import { Icon } from '@/hooks/useIcon';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { useCyclesStore } from '@/stores/useCyclesStore';
import { PurchaseOrderForm } from './PurchaseOrderForm';
import { DeliveryLogSheet } from '@/components/sheets/DeliveryLogSheet';
import type { PurchaseOrderWithDetails, POStatus } from '@/lib/data/purchase-orders';
import { cn, formatPHP } from '@/lib/utils';
import { getErrorMessage } from '@/lib/data/errors';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';

interface PurchaseOrderTableProps {
  orgId: string;
}

const STATUS_CONFIG: Record<POStatus, { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'badge-muted' },
  submitted: { label: 'Submitted', className: 'badge-info' },
  delivered: { label: 'Delivered', className: 'badge-success' },
  cancelled: { label: 'Cancelled', className: 'badge-danger' },
};

const STATUS_TRANSITIONS: Record<POStatus, POStatus[]> = {
  draft:     ['submitted', 'cancelled'],
  submitted: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export function PurchaseOrderTable({ orgId }: PurchaseOrderTableProps) {
  const { purchaseOrders, isLoadingPOs, fetchPurchaseOrders, updatePOStatus } = useInventoryStore();
  const { cycles } = useCyclesStore();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<'all' | POStatus>('all');
  const [deliveryPO, setDeliveryPO] = React.useState<PurchaseOrderWithDetails | null>(null);

  const reload = React.useCallback(() => {
    fetchPurchaseOrders(orgId);
  }, [fetchPurchaseOrders, orgId]);

  React.useEffect(() => { reload(); }, [reload]);

  const handleStatusChange = async (orderId: string, status: POStatus) => {
    if (status === 'delivered') {
      const po = purchaseOrders.find(p => p.id === orderId) ?? null;
      setDeliveryPO(po);
      return;
    }
    try {
      await updatePOStatus(orderId, status);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update status.'));
    }
  };

  const handleDeliverySaved = async () => {
    if (!deliveryPO) return;
    try {
      await updatePOStatus(deliveryPO.id, 'delivered');
      reload();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to mark PO as delivered.'));
    }
    setDeliveryPO(null);
  };

  // Find an active cycle for the delivery PO's farm
  const deliveryCycle = deliveryPO
    ? cycles.find(c => c.farmId === deliveryPO.farm_id && c.status === 'active') ?? null
    : null;

  const filtered = purchaseOrders.filter((po) =>
    filterStatus === 'all' || po.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-danger/5 border border-danger/20 text-danger text-sm">{error}</div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Purchase Orders</h3>
          <span className="px-2 py-0.5 rounded-lg text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase font-data">
            {filtered.length} ORDERS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {(['all', 'draft', 'submitted', 'delivered', 'cancelled'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  'px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors uppercase tracking-wider',
                  filterStatus === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-border hover:border-primary/30'
                )}
              >
                {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="h-10 px-4">
            <Icon name="AddIcon" size={16} className="mr-2" />
            New PO
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <TableHeader className="px-4 py-4 w-8" />
                <TableHeader className="px-6 py-4 text-left">PO #</TableHeader>
                <TableHeader className="px-6 py-4 text-left">Farm</TableHeader>
                <TableHeader className="px-6 py-4 text-left">Supplier</TableHeader>
                <TableHeader className="px-6 py-4 text-left">Order Date</TableHeader>
                <TableHeader className="px-6 py-4 text-left">Expected</TableHeader>
                <TableHeader className="px-6 py-4 text-right">Amount</TableHeader>
                <TableHeader className="px-6 py-4 text-center">Status</TableHeader>
                <TableHeader className="px-6 py-4 text-center">Actions</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoadingPOs ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20">
                    <EmptyState
                      icon="ClipboardIcon"
                      title="No Purchase Orders"
                      description="Create a purchase order to track your supply procurement."
                      className="bg-transparent"
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((po) => (
                  <PORow
                    key={po.id}
                    po={po}
                    isExpanded={expandedId === po.id}
                    onToggleExpand={() => setExpandedId(expandedId === po.id ? null : po.id)}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PurchaseOrderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={reload}
      />

      {deliveryPO && deliveryCycle && (
        <DeliveryLogSheet
          isOpen={true}
          onClose={() => setDeliveryPO(null)}
          cycleId={deliveryCycle.id}
          farmId={deliveryPO.farm_id}
          orgId={orgId}
          onSaved={handleDeliverySaved}
        />
      )}
    </div>
  );
}

function PORow({
  po,
  isExpanded,
  onToggleExpand,
  onStatusChange,
}: {
  po: PurchaseOrderWithDetails;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (id: string, status: POStatus) => void;
}) {
  const status = po.status as POStatus;
  const cfg = STATUS_CONFIG[status] ?? { label: po.status, className: 'badge-muted' };
  const transitions = STATUS_TRANSITIONS[status] ?? [];
  const hasItems = (po.inventory_order_items?.length ?? 0) > 0;
  const poNumber = po.id.slice(0, 8).toUpperCase();

  return (
    <>
      <tr className="group hover:bg-row-hover transition-colors bg-background">
        <td className="px-4 py-4">
          {hasItems && (
            <button
              onClick={onToggleExpand}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded
                ? <ChevronDown size={16} />
                : <ChevronRight size={16} />
              }
            </button>
          )}
        </td>
        <td className="px-6 py-4">
          <span className="font-mono text-sm font-bold text-foreground">{poNumber}</span>
        </td>
        <td className="px-6 py-4 text-sm text-foreground">
          {(po.farms as { name: string } | null)?.name ?? '—'}
        </td>
        <td className="px-6 py-4 text-sm text-foreground">
          {(po.suppliers as { name: string } | null)?.name ?? <span className="text-muted-foreground">No supplier</span>}
        </td>
        <td className="px-6 py-4 text-sm text-muted-foreground">
          {po.order_date ? new Date(po.order_date).toLocaleDateString() : '—'}
        </td>
        <td className="px-6 py-4 text-sm text-muted-foreground">
          {po.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString() : '—'}
        </td>
        <td className="px-6 py-4 text-right tabular-nums font-bold text-foreground">
          {po.total_amount ? formatPHP(po.total_amount) : '—'}
        </td>
        <td className="px-6 py-4 text-center">
          <span className={cn('badge', cfg.className)}>{cfg.label}</span>
        </td>
        <td className="px-6 py-4">
          <div className="flex justify-center gap-1">
            {transitions.map((nextStatus) => (
              <button
                key={nextStatus}
                onClick={() => onStatusChange(po.id, nextStatus)}
                className={cn(
                  'px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors',
                  nextStatus === 'cancelled'
                    ? 'text-danger border-danger/30 hover:bg-danger/5'
                    : 'text-primary border-primary/30 hover:bg-primary/5'
                )}
              >
                {STATUS_CONFIG[nextStatus].label}
              </button>
            ))}
          </div>
        </td>
      </tr>

      {isExpanded && hasItems && (
        <tr className="bg-muted/10">
          <td colSpan={9} className="px-12 py-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Line Items</p>
              <div className="grid grid-cols-4 gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                <span>Item</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Unit Price</span>
                <span className="text-right">Total</span>
              </div>
              {(po.inventory_order_items ?? []).map((item) => {
                const itemInfo = item.inventory_items as { name: string; unit: string } | null;
                return (
                  <div key={item.id} className="grid grid-cols-4 gap-2 text-sm px-2 py-1.5 rounded-lg hover:bg-muted/20">
                    <span className="font-medium text-foreground">{itemInfo?.name ?? item.item_id}</span>
                    <span className="text-right tabular-nums">{item.qty.toLocaleString()} {itemInfo?.unit ?? ''}</span>
                    <span className="text-right tabular-nums text-muted-foreground">
                      {item.price ? formatPHP(item.price) : '—'}
                    </span>
                    <span className="text-right tabular-nums font-bold">
                      {item.price ? formatPHP(item.qty * item.price) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
