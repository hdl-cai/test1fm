import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert } from '@/types/supabase';
import { requireOrgId } from './context';
import { toDataLayerError } from './errors';

export type PurchaseOrderRow = Tables<'inventory_orders'>;
export type OrderItemRow = Tables<'inventory_order_items'>;

export type POStatus = 'draft' | 'submitted' | 'delivered' | 'cancelled';

export interface OrderItemInput {
  itemId: string;
  qty: number;
  price?: number | null;
}

export interface PurchaseOrderLineItem extends OrderItemRow {
  inventory_items?: { name: string; unit: string } | null;
}

export interface PurchaseOrderWithDetails extends PurchaseOrderRow {
  suppliers?: { name: string } | null;
  farms?: { name: string } | null;
  inventory_order_items?: PurchaseOrderLineItem[];
}

export interface SavePurchaseOrderInput {
  id?: string;
  orgId?: string | null;
  farmId: string;
  supplierId?: string | null;
  orderDate?: string | null;
  expectedDelivery?: string | null;
  notes?: string | null;
  lineItems: OrderItemInput[];
}

export async function fetchPurchaseOrders(orgId: string): Promise<PurchaseOrderWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('inventory_orders')
      .select(`
        *,
        suppliers (name),
        farms (name),
        inventory_order_items (
          id, order_id, item_id, qty, price,
          inventory_items (name, unit)
        )
      `)
      .eq('org_id', requireOrgId(orgId))
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PurchaseOrderWithDetails[];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch purchase orders.', 'purchase-orders.fetchPurchaseOrders');
  }
}

export async function createPurchaseOrder(input: SavePurchaseOrderInput): Promise<PurchaseOrderRow> {
  try {
    const orgId = requireOrgId(input.orgId);
    const { data: session } = await supabase.auth.getUser();
    const userId = session.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const totalAmount = input.lineItems.reduce(
      (sum, item) => sum + item.qty * (item.price ?? 0),
      0,
    );

    const payload: TablesInsert<'inventory_orders'> = {
      org_id: orgId,
      farm_id: input.farmId,
      supplier_id: input.supplierId ?? null,
      order_date: input.orderDate ?? new Date().toISOString().slice(0, 10),
      expected_delivery: input.expectedDelivery ?? null,
      notes: input.notes ?? null,
      status: 'draft',
      total_amount: totalAmount,
      created_by: userId,
    };

    const { data: order, error: orderError } = await supabase
      .from('inventory_orders')
      .insert(payload)
      .select()
      .single();

    if (orderError) throw orderError;

    if (input.lineItems.length > 0) {
      const itemsPayload = input.lineItems.map((li) => ({
        order_id: order.id,
        item_id: li.itemId,
        qty: li.qty,
        price: li.price ?? null,
      }));

      const { error: itemsError } = await supabase
        .from('inventory_order_items')
        .insert(itemsPayload);

      if (itemsError) throw itemsError;
    }

    return order as PurchaseOrderRow;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to create purchase order.', 'purchase-orders.createPurchaseOrder');
  }
}

export async function updatePOStatus(orderId: string, status: POStatus): Promise<void> {
  try {
    const { error } = await supabase
      .from('inventory_orders')
      .update({ status })
      .eq('id', orderId);
    if (error) throw error;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to update purchase order status.', 'purchase-orders.updatePOStatus');
  }
}

export async function fetchStockLevels(orgId: string) {
  try {
    const { data: items, error: itemsError } = await supabase
      .from('inventory_items')
      .select(`
        id, name, unit, low_stock_threshold, item_id_code,
        inventory_categories (name),
        inventory_stock (current_qty, last_updated)
      `)
      .eq('org_id', requireOrgId(orgId))
      .is('deleted_at', null)
      .order('name');

    if (itemsError) throw itemsError;

    return (items || []).map((item) => {
      const stockRows = (item.inventory_stock || []) as { current_qty: number; last_updated: string }[];
      const totalQty = stockRows.reduce((sum, s) => sum + (s.current_qty || 0), 0);
      const lastUpdated = stockRows.length > 0
        ? new Date(Math.max(...stockRows.map((s) => new Date(s.last_updated).getTime()))).toISOString()
        : null;

      let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      const threshold = item.low_stock_threshold ?? 0;
      if (totalQty <= 0) status = 'out_of_stock';
      else if (totalQty <= threshold) status = 'low_stock';

      return {
        id: item.id,
        name: item.name,
        unit: item.unit,
        category: (item.inventory_categories as { name?: string } | null)?.name ?? 'Other',
        currentQty: totalQty,
        threshold,
        status,
        lastUpdated,
        itemIdCode: item.item_id_code,
      };
    });
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch stock levels.', 'purchase-orders.fetchStockLevels');
  }
}

export type StockLevelItem = Awaited<ReturnType<typeof fetchStockLevels>>[number];
