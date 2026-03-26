import { supabase } from '@/lib/supabase';
import type { InventoryItem } from '@/types';
import type { Tables, TablesInsert } from '@/types/supabase';
import { requireOrgId } from './context';
import { toDataLayerError } from './errors';

export interface InventoryCategory {
  id: string;
  name: string;
}

export interface InventoryCatalogueItem {
  id: string;
  name: string;
  category_id: string;
  unit: string;
  low_stock_threshold: number | null;
  item_id_code: string;
  inventory_categories?: {
    name?: string;
  } | null;
}

export interface InventoryData {
  categories: InventoryCategory[];
  items: InventoryItem[];
}

export interface DeliveryLog {
  id: string;
  item_name: string | null;
  item_type: string | null;
  quantity_delivered: string | number | null;
  unit: string | null;
  total_cost: string | number | null;
  delivery_date: string;
}

type InventoryItemRow = Pick<Tables<'inventory_items'>, 'id' | 'name' | 'unit' | 'low_stock_threshold'> & {
  inventory_categories?: {
    name?: string | null;
  } | null;
};

type InventoryStockRow = Pick<Tables<'inventory_stock'>, 'item_id' | 'current_qty' | 'last_updated'>;

export async function fetchInventoryData(orgId: string): Promise<InventoryData> {
  try {
    const resolvedOrgId = requireOrgId(orgId);
    const [{ data: categories, error: categoriesError }, { data: itemsData, error: itemsError }, { data: stockData, error: stockError }] =
      await Promise.all([
        supabase.from('inventory_categories').select('id, name'),
        supabase
          .from('inventory_items')
          .select(`
            *,
            inventory_categories (name)
          `)
          .eq('org_id', resolvedOrgId),
        supabase.from('inventory_stock').select('*').eq('org_id', resolvedOrgId),
      ]);

    if (categoriesError) throw categoriesError;
    if (itemsError) throw itemsError;
    if (stockError) throw stockError;

    const items: InventoryItem[] = ((itemsData || []) as InventoryItemRow[]).map((item) => {
      const itemStocks = ((stockData || []) as InventoryStockRow[]).filter((stock) => stock.item_id === item.id);
      const totalStock = itemStocks.reduce((sum, stock) => sum + (stock.current_qty || 0), 0);
      const lastUpdated =
        itemStocks.length > 0
          ? new Date(Math.max(...itemStocks.map((stock) => new Date(stock.last_updated).getTime())))
          : undefined;

      const categoryName = item.inventory_categories?.name?.toLowerCase() || 'other';
      const category: InventoryItem['category'] =
        categoryName === 'feed' ? 'feed' : categoryName === 'medical' ? 'medical' : categoryName === 'supplements' ? 'supplements' : 'feed';

      let status: InventoryItem['status'] = 'in_stock';
      if (totalStock <= 0) status = 'out_of_stock';
      else if (totalStock <= (item.low_stock_threshold || 0)) status = 'low_stock';

      return {
        id: item.id,
        name: item.name,
        category,
        currentStock: totalStock,
        unit: item.unit,
        threshold: item.low_stock_threshold || 0,
        status,
        lastRestocked: lastUpdated,
      };
    });

    return {
      categories: categories || [],
      items,
    };
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch inventory.', 'inventory.fetchInventoryData');
  }
}

export async function fetchInventoryCategories() {
  try {
    const { data, error } = await supabase.from('inventory_categories').select('id, name').order('name');
    if (error) {
      throw error;
    }

    return (data || []) as InventoryCategory[];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch inventory categories.', 'inventory.fetchInventoryCategories');
  }
}

export async function fetchInventoryCatalogue(orgId: string) {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*, inventory_categories (name)')
      .eq('org_id', requireOrgId(orgId))
      .is('deleted_at', null)
      .order('name');

    if (error) {
      throw error;
    }

    return (data || []) as InventoryCatalogueItem[];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch inventory catalogue.', 'inventory.fetchInventoryCatalogue');
  }
}

export async function fetchDeliveryLogs(orgId: string) {
  try {
    const { data, error } = await supabase
      .from('delivered_inputs')
      .select('*')
      .eq('org_id', requireOrgId(orgId))
      .is('deleted_at', null)
      .order('delivery_date', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as DeliveryLog[];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch delivery logs.', 'inventory.fetchDeliveryLogs');
  }
}

export async function archiveInventoryItem(itemId: string) {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to archive inventory item.', 'inventory.archiveInventoryItem');
  }
}

export async function saveInventoryItem(input: {
  orgId?: string | null;
  id?: string;
  name: string;
  categoryId: string;
  unit: string;
  lowStockThreshold?: number | null;
  itemIdCode?: string | null;
}) {
  try {
    const payload: TablesInsert<'inventory_items'> = {
      org_id: requireOrgId(input.orgId),
      name: input.name,
      category_id: input.categoryId,
      unit: input.unit,
      low_stock_threshold: input.lowStockThreshold ?? null,
      item_id_code: input.itemIdCode ?? '',
    };

    if (input.id) {
      const { error } = await supabase
        .from('inventory_items')
        .update(payload)
        .eq('id', input.id);

      if (error) {
        throw error;
      }

      return;
    }

    const { error } = await supabase.from('inventory_items').insert(payload);
    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to save inventory item.', 'inventory.saveInventoryItem');
  }
}
