/**
 * Inventory Page
 *
 * Main page for inventory management. Displays:
 * - Deliveries: Delivery log from Supabase
 * - Catalogue: Supply item CRUD
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { TableHeader } from '@/components/ui/table-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, LineTabsList, LineTabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Icon } from '@/hooks/useIcon';
import { cn, formatPHP } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCyclesStore } from '@/stores/useCyclesStore';
// V2: InventoryStockSheet, NewOrderSheet, FeedPhaseTracker quarantined
import { DataTablePagination, FarmFilter } from '@/components/shared';
import { Loader2, AlertCircle } from 'lucide-react';
import { SupplyItemSheet } from '@/components/sheets/SupplyItemSheet';
import { supabase } from '@/lib/supabase';

type TabType = 'orders' | 'catalogue';




// V2: consumptionData chart removed

export default function Inventory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabType) || 'orders';

  const [ordersPage, setOrdersPage] = React.useState(1);
  const [cataloguePage, setCataloguePage] = React.useState(1);
  const itemsPerPage = 10;

  const setActiveTab = (value: TabType) => {
    setSearchParams({ tab: value });
  };

  // V2: useInventoryStore quarantined (stock tracking removed)
  const { fetchCycles } = useCyclesStore();
  const { user } = useAuthStore();

  // Catalogue state
  const [catalogueItems, setCatalogueItems] = React.useState<any[]>([]);
  const [isCatalogueLoading, setIsCatalogueLoading] = React.useState(false);
  const [isSupplySheetOpen, setIsSupplySheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any | null>(null);

  // Deliveries state (replaces mockOrders)
  const [deliveries, setDeliveries] = React.useState<any[]>([]);
  const [isDeliveriesLoading, setIsDeliveriesLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const orgId = user?.orgId;

  const loadCatalogue = React.useCallback(async () => {
    if (!orgId) return;
    setIsCatalogueLoading(true);
    const { data } = await supabase
      .from('inventory_items')
      .select('*, inventory_categories (name)')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('name');
    setCatalogueItems(data || []);
    setIsCatalogueLoading(false);
  }, [orgId]);

  const loadDeliveries = React.useCallback(async () => {
    if (!orgId) return;
    setIsDeliveriesLoading(true);
    setLoadError(null);
    const { data, error: fetchError } = await supabase
      .from('delivered_inputs')
      .select('*')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('delivery_date', { ascending: false });
    if (fetchError) {
      setLoadError(fetchError.message);
    }
    setDeliveries(data || []);
    setIsDeliveriesLoading(false);
  }, [orgId]);

  React.useEffect(() => {
    if (orgId) {
      fetchCycles(orgId);
      loadCatalogue();
      loadDeliveries();
    }
  }, [fetchCycles, loadCatalogue, loadDeliveries, orgId]);

  const handleArchiveItem = async (itemId: string) => {
    const { error: archiveError } = await supabase
      .from('inventory_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', itemId);
    if (!archiveError) loadCatalogue();
  };




  const totalOrdersPages = Math.ceil(deliveries.length / itemsPerPage);
  const paginatedOrders = deliveries.slice((ordersPage - 1) * itemsPerPage, ordersPage * itemsPerPage);

  const totalCataloguePages = Math.ceil(catalogueItems.length / itemsPerPage);
  const paginatedCatalogue = catalogueItems.slice((cataloguePage - 1) * itemsPerPage, cataloguePage * itemsPerPage);

  if (isDeliveriesLoading && isCatalogueLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
          Loading Inventory...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger">
          <AlertCircle size={24} />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">Failed to load inventory</h3>
          <p className="text-sm text-muted-foreground mt-1">{loadError}</p>
        </div>
        <Button onClick={() => { loadDeliveries(); loadCatalogue(); }} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <PageTitle>Inventory</PageTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Track feed, medicine, and supply levels across your farms.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FarmFilter className="min-w-[200px]" />
          {/* V2: New Order and Add Item buttons quarantined */}
        </div>
      </div>

      {/* V2: Usage chart quarantined */}

      <div className="">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
          <div className="px-6 pt-4 border-b border-border">
            <LineTabsList className="w-fit border-none">
              <LineTabsTrigger value="orders">
                <Icon name="ActivityIcon" size={14} />
                Deliveries
              </LineTabsTrigger>
              <LineTabsTrigger value="catalogue">
                <Icon name="BoxIcon" size={14} />
                Catalogue
              </LineTabsTrigger>
              {/* V2: Stock and Feed Plan tabs quarantined */}
            </LineTabsList>
          </div>


          {/* V2: Stock tab quarantined */}

          <TabsContent value="orders" className="p-6 animate-in fade-in duration-300 mt-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1 mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Delivery Log</h3>
                <span className="px-2 py-0.5 rounded-[4px] text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase font-data">
                  {deliveries.length} TOTAL
                </span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <TableHeader className="px-6 py-4 text-left">Item</TableHeader>
                      <TableHeader className="px-6 py-4 text-left">Type</TableHeader>
                      <TableHeader className="px-6 py-4 text-right">Qty</TableHeader>
                      <TableHeader className="px-6 py-4 text-right">Cost</TableHeader>
                      <TableHeader className="px-6 py-4 text-left">Date</TableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {isDeliveriesLoading ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                        </td>
                      </tr>
                    ) : paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20">
                          <EmptyState icon="BoxIcon" title="No Deliveries" description="No deliveries have been logged yet." className="bg-transparent" />
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((d) => (
                        <tr key={d.id} className="group hover:bg-row-hover transition-colors bg-background">
                          <td className="px-6 py-4 font-bold text-foreground">{d.item_name}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "badge",
                              d.item_type === 'feed' ? 'badge-warning' :
                                d.item_type === 'medicine' ? 'badge-info' : 'badge-muted'
                            )}>
                              {d.item_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right tabular-nums font-bold">{parseFloat(d.quantity_delivered).toLocaleString()} {d.unit}</td>
                          <td className="px-6 py-4 text-right tabular-nums font-bold">{formatPHP(parseFloat(d.total_cost || 0))}</td>
                          <td className="px-6 py-4 text-muted-foreground text-sm">{new Date(d.delivery_date).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6">
              <DataTablePagination
                currentPage={ordersPage}
                totalPages={totalOrdersPages}
                onPageChange={setOrdersPage}
                pageSize={itemsPerPage}
                totalItems={deliveries.length}
                itemName="Deliveries"
              />
            </div>
          </TabsContent>

          {/* Catalogue Tab */}
          <TabsContent value="catalogue" className="p-6 animate-in fade-in duration-300 mt-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1 mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Supply Catalogue</h3>
                <span className="px-2 py-0.5 rounded-[4px] text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase font-data">
                  {catalogueItems.length} ITEMS
                </span>
              </div>
              <Button
                onClick={() => { setEditingItem(null); setIsSupplySheetOpen(true); }}
                className="active:scale-95 h-10 px-4"
              >
                <Icon name="AddIcon" size={16} className="mr-2" />
                Add Supply Item
              </Button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <TableHeader className="px-6 py-4 text-left">Name</TableHeader>
                      <TableHeader className="px-6 py-4 text-left">Category</TableHeader>
                      <TableHeader className="px-6 py-4 text-left">Unit</TableHeader>
                      <TableHeader className="px-6 py-4 text-right">Threshold</TableHeader>
                      <TableHeader className="px-6 py-4 text-center">Actions</TableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {isCatalogueLoading ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                        </td>
                      </tr>
                    ) : paginatedCatalogue.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20">
                          <EmptyState icon="BoxIcon" title="No Catalogue Items" description="Add supply items to build your catalogue." className="bg-transparent" />
                        </td>
                      </tr>
                    ) : (
                      paginatedCatalogue.map((item) => (
                        <tr key={item.id} className="group hover:bg-row-hover transition-colors bg-background">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground">{item.name}</span>
                              <span className="text-micro text-muted-foreground/40 uppercase tracking-widest">{item.item_id_code}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="badge badge-info">{item.inventory_categories?.name || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground font-medium">{item.unit}</td>
                          <td className="px-6 py-4 text-right tabular-nums font-bold text-muted-foreground">
                            {item.low_stock_threshold ? parseFloat(item.low_stock_threshold).toLocaleString() : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground border border-border/40 hover:border-border/60"
                                title="Edit"
                                onClick={() => { setEditingItem(item); setIsSupplySheetOpen(true); }}
                              >
                                <Icon name="Edit02Icon" size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-9 h-9 rounded-xl text-muted-foreground hover:text-danger border border-border/40 hover:border-danger/40"
                                title="Archive"
                                onClick={() => handleArchiveItem(item.id)}
                              >
                                <Icon name="Delete02Icon" size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6">
              <DataTablePagination
                currentPage={cataloguePage}
                totalPages={totalCataloguePages}
                onPageChange={setCataloguePage}
                pageSize={itemsPerPage}
                totalItems={catalogueItems.length}
                itemName="Items"
              />
            </div>
          </TabsContent>

          {/* V2: Strategy/Feed Plan tab quarantined */}
        </Tabs>
      </div>

      {/* V2: InventoryStockSheet and NewOrderSheet quarantined */}
      <SupplyItemSheet
        isOpen={isSupplySheetOpen}
        onClose={() => { setIsSupplySheetOpen(false); setEditingItem(null); }}
        onSaved={loadCatalogue}
        editItem={editingItem}
      />
    </div>
  );
}
