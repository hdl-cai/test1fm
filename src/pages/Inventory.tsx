/**
 * Inventory Page
 *
 * Main page for inventory management. Displays:
 * - Inventory Stock: Current stock table with trends chart
 * - Order History: Past orders table
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { TableHeader } from '@/components/ui/table-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, LineTabsList, LineTabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCyclesStore } from '@/stores/useCyclesStore';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { useUIStore } from '@/stores/useUIStore';
import { InventoryStockSheet } from '@/components/sheets/InventoryStockSheet';
import { NewOrderSheet } from '@/components/sheets/NewOrderSheet';
import { FeedPhaseTracker } from '@/components/inventory/FeedPhaseTracker';
import { StatusBadge, DataTablePagination, FarmFilter } from '@/components/shared';
import { Loader2, AlertCircle } from 'lucide-react';
import type { Order } from '@/types';

type TabType = 'stock' | 'orders' | 'strategy';

const mockOrders: Order[] = [
  {
    id: 'ord-001',
    type: 'feed',
    items: [
      { id: 'oi-001', inventoryItemId: 'inv-001', name: 'Premium Starter Feed', quantity: 2000, unit: 'kg', unitPrice: 2.5, totalPrice: 5000 },
    ],
    status: 'completed',
    totalAmount: 5000,
    supplier: 'AgriSupply Co.',
    orderDate: new Date('2026-01-25'),
    expectedDelivery: new Date('2026-01-28'),
    deliveredDate: new Date('2026-01-27'),
    requestedBy: 'John Manager',
    farmId: 'farm-001',
  },
  {
    id: 'ord-002',
    type: 'medical',
    items: [
      { id: 'oi-002', inventoryItemId: 'inv-013', name: 'Newcastle Vaccine', quantity: 100, unit: 'doses', unitPrice: 5, totalPrice: 500 },
    ],
    status: 'completed',
    totalAmount: 500,
    supplier: 'VetPharma Inc.',
    orderDate: new Date('2026-01-20'),
    expectedDelivery: new Date('2026-01-25'),
    deliveredDate: new Date('2026-01-24'),
    requestedBy: 'Dr. Sarah Vet',
  },
  {
    id: 'ord-003',
    type: 'feed',
    items: [
      { id: 'oi-003', inventoryItemId: 'inv-004', name: 'Grower Feed Standard', quantity: 5000, unit: 'kg', unitPrice: 2.2, totalPrice: 11000 },
    ],
    status: 'pending',
    totalAmount: 11000,
    supplier: 'AgriSupply Co.',
    orderDate: new Date('2026-02-01'),
    expectedDelivery: new Date('2026-02-05'),
    requestedBy: 'John Manager',
    farmId: 'farm-001',
  },
  {
    id: 'ord-004',
    type: 'supplements',
    items: [
      { id: 'oi-004', inventoryItemId: 'inv-019', name: 'Lysine Supplement', quantity: 50, unit: 'kg', unitPrice: 15, totalPrice: 750 },
    ],
    status: 'on_route',
    totalAmount: 750,
    supplier: 'FeedAdditives Ltd.',
    orderDate: new Date('2026-01-28'),
    expectedDelivery: new Date('2026-02-02'),
    requestedBy: 'Mike Nutritionist',
  },
  {
    id: 'ord-005',
    type: 'medical',
    items: [
      { id: 'oi-005', inventoryItemId: 'inv-016', name: 'Antibiotics - Enrofloxacin', quantity: 20, unit: 'bottles', unitPrice: 25, totalPrice: 500 },
    ],
    status: 'cancelled',
    totalAmount: 500,
    supplier: 'VetPharma Inc.',
    orderDate: new Date('2026-01-15'),
    expectedDelivery: new Date('2026-01-20'),
    requestedBy: 'Dr. Sarah Vet',
    approvedBy: 'John Manager',
  },
];

const consumptionData = [
  { date: 'Jan 01', feed: 450, medical: 25, supplements: 18 },
  { date: 'Jan 05', feed: 520, medical: 30, supplements: 22 },
  { date: 'Jan 10', feed: 480, medical: 28, supplements: 20 },
  { date: 'Jan 15', feed: 610, medical: 35, supplements: 25 },
  { date: 'Jan 20', feed: 550, medical: 32, supplements: 24 },
  { date: 'Jan 25', feed: 590, medical: 40, supplements: 28 },
  { date: 'Jan 30', feed: 630, medical: 38, supplements: 30 },
];

export default function Inventory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabType) || 'stock';

  const [stockPage, setStockPage] = React.useState(1);
  const [ordersPage, setOrdersPage] = React.useState(1);
  const itemsPerPage = 10;

  const setActiveTab = (value: TabType) => {
    setSearchParams({ tab: value });
  };

  const { items, isLoading, error, fetchInventory } = useInventoryStore();
  const { fetchCycles } = useCyclesStore();
  const { user } = useAuthStore();
  const { openSheet, activeSheet, closeSheet } = useUIStore();

  React.useEffect(() => {
    if (user?.orgId) {
      fetchInventory(user.orgId);
      fetchCycles(user.orgId);
    }
  }, [user?.orgId, fetchInventory, fetchCycles]);

  const handleAddItem = () => openSheet('inventory-stock');
  const handleNewOrder = () => openSheet('new-order');

  const totalStockPages = Math.ceil(items.length / itemsPerPage);
  const paginatedStock = items.slice((stockPage - 1) * itemsPerPage, stockPage * itemsPerPage);

  const totalOrdersPages = Math.ceil(mockOrders.length / itemsPerPage);
  const paginatedOrders = mockOrders.slice((ordersPage - 1) * itemsPerPage, ordersPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
          Reconciling Inventory...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger">
          <AlertCircle size={24} />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">Failed to load inventory</h3>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        <Button onClick={() => user?.orgId && fetchInventory(user.orgId)} variant="outline">
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
          <div className="flex gap-2">
            <Button onClick={handleNewOrder} className="active:scale-95 h-10 px-4">
              <Icon name="AddIcon" size={16} className="mr-2" />
              New Order
            </Button>
            <Button onClick={handleAddItem} variant="outline" className="active:scale-95 h-10 px-4">
              <Icon name="AddIcon" size={16} className="mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4 relative z-10">
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Usage History</h3>
            <div className="flex items-center mt-2">
              <span className="flex items-center text-success text-micro font-bold uppercase bg-success/10 px-2 py-0.5 rounded-md border border-success/20 tracking-widest">
                <Icon name="ArrowUp01Icon" size={12} className="mr-1" />
                +12.5% vs last month
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-muted/30 rounded-xl p-1 border border-border">
              <button className="px-4 py-1.5 text-micro font-black uppercase tracking-widest rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                Categories
              </button>
            </div>
            <div className="flex bg-muted/30 rounded-xl p-1 border border-border">
              <button className="px-4 py-1.5 text-micro font-black uppercase tracking-widest rounded-lg bg-card shadow-lg text-foreground border border-border/50">
                Last 30 Days
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 mb-8 text-micro font-bold uppercase tracking-widest relative z-10">
          <div className="flex items-center text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-chart-1 mr-2"></span>
            Feed (kg)
          </div>
          <div className="flex items-center text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-chart-4 mr-2"></span>
            Medical (units)
          </div>
          <div className="flex items-center text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-chart-2 mr-2"></span>
            Supplements (kg)
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={consumptionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px', color: 'var(--foreground)' }}
                itemStyle={{ padding: '2px 0' }}
                cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
              />
              <Line type="monotone" dataKey="feed" stroke="hsl(var(--chart-1))" strokeWidth={3} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--chart-1))' }} name="Feed" />
              <Line type="monotone" dataKey="medical" stroke="hsl(var(--chart-4))" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--chart-4))' }} name="Medical" />
              <Line type="monotone" dataKey="supplements" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="2 2" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--chart-2))' }} name="Supplements" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
          <div className="px-6 pt-4 border-b border-border">
            <LineTabsList className="w-fit border-none">
              <LineTabsTrigger value="stock">
                <Icon name="BoxIcon" size={14} />
                Stock
              </LineTabsTrigger>
              <LineTabsTrigger value="orders">
                <Icon name="ActivityIcon" size={14} />
                Orders
              </LineTabsTrigger>
              <LineTabsTrigger value="strategy">
                <Icon name="AnalyticsIcon" size={14} />
                Feed Plan
              </LineTabsTrigger>
            </LineTabsList>
          </div>

          <TabsContent value="stock" className="p-6 animate-in fade-in duration-300 mt-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1 mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Current Stock</h3>
                <span className="px-2 py-0.5 rounded-[4px] text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase font-data">
                  {items.length} TOTAL
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Icon
                    name="Search01Icon"
                    size={14}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    className="pl-9 w-64 bg-muted/30 border border-border text-foreground placeholder-muted-foreground/50 focus:border-primary focus:ring-0 text-xs rounded-lg h-9 outline-none transition-colors"
                    placeholder="Search stock..."
                    type="text"
                  />
                </div>
                <Button variant="outline" className="h-9 px-3 text-xs bg-muted/30 border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors rounded-lg active:scale-95">
                  <Icon name="FilterIcon" className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <TableHeader className="px-6 py-4 text-left">Item Name</TableHeader>
                      <TableHeader className="px-6 py-4 text-left">Category</TableHeader>
                      <TableHeader className="px-6 py-4 text-right">Stock Level</TableHeader>
                      <TableHeader className="px-6 py-4 text-right">Threshold</TableHeader>
                      <TableHeader className="px-6 py-4 text-left">Status</TableHeader>
                      <TableHeader className="px-6 py-4 text-center">Actions</TableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-20">
                          <EmptyState icon="BoxIcon" title="No Inventory Items" description="Add your first inventory item to start tracking stock levels." className="bg-transparent" />
                        </td>
                      </tr>
                    ) : (
                      paginatedStock.map((item) => (
                        <tr key={item.id} className="group hover:bg-row-hover transition-colors cursor-pointer bg-background">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground transition-colors font-data">{item.name}</span>
                              <span className="text-micro text-muted-foreground/40 font-data mt-0.5 uppercase tracking-widest">{item.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "badge",
                              item.category === 'feed' ? 'badge-warning' :
                                item.category === 'medical' ? 'badge-info' :
                                  item.category === 'supplements' ? 'badge-success' :
                                    item.category === 'equipment' ? 'badge-info' : 'badge-muted'
                            )}>
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-foreground font-data tabular-nums">{item.currentStock.toLocaleString()}</span>
                              <span className="text-micro text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">{item.unit}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-muted-foreground font-data tabular-nums">{item.threshold.toLocaleString()}</span>
                              <span className="text-micro text-muted-foreground/40 font-semibold uppercase tracking-widest mt-0.5">{item.unit}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-start">
                              <StatusBadge status={item.status as any} size="sm" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground transition-colors border border-border/40 hover:border-border/60" title="Actions" aria-label="Item Actions">
                                <Icon name="MoreVerticalCircle01Icon" size={16} />
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
                currentPage={stockPage}
                totalPages={totalStockPages}
                onPageChange={setStockPage}
                pageSize={itemsPerPage}
                totalItems={items.length}
                itemName="Items"
              />
            </div>
          </TabsContent>

          <TabsContent value="orders" className="p-6 animate-in fade-in duration-300 mt-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1 mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Past Orders</h3>
                <span className="px-2 py-0.5 rounded-[4px] text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase font-data">
                  {mockOrders.length} TOTAL
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Icon
                    name="Search01Icon"
                    size={14}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    className="pl-9 w-64 bg-muted/30 border border-border text-foreground placeholder-muted-foreground/50 focus:border-primary focus:ring-0 text-xs rounded-lg h-9 outline-none transition-colors"
                    placeholder="Search orders..."
                    type="text"
                  />
                </div>
                <Button variant="outline" className="h-9 px-3 text-xs bg-muted/30 border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors rounded-lg active:scale-95">
                  <Icon name="FilterIcon" className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <TableHeader className="px-6 py-4 text-left">Order ID</TableHeader>
                      <TableHeader className="px-6 py-4 text-left">Supplier</TableHeader>
                      <TableHeader className="px-6 py-4 text-left">Items</TableHeader>
                      <TableHeader className="px-6 py-4 text-right">Total Amount</TableHeader>
                      <TableHeader className="px-6 py-4 text-left">Status</TableHeader>
                      <TableHeader className="px-6 py-4 text-center">Actions</TableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {paginatedOrders.map((order) => (
                      <tr key={order.id} className="group hover:bg-row-hover transition-colors cursor-pointer bg-background">
                        <td className="px-6 py-4 text-micro text-muted-foreground/40 font-black uppercase tracking-widest font-data">{order.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex items-center justify-center w-9 h-9 rounded-xl text-micro font-black border shadow-inner transition-transform", order.type === 'feed' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : order.type === 'medical' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20")}>
                              {(order.supplier || '??').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-foreground transition-colors">{order.supplier || 'Unknown Supplier'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">{order.items[0]?.name} {order.items.length > 1 ? <span className="text-primary">+{order.items.length - 1} more</span> : ''}</span>
                            <span className="text-micro text-muted-foreground font-medium italic font-data">Ordered {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Unknown Date'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-foreground tabular-nums font-data">₱{order.totalAmount.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-start">
                            <StatusBadge status={order.status as any} size="sm" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground transition-colors transition-[width] transition-[height] border border-border/40 hover:border-border/60" title="Actions" aria-label="Order Actions">
                              <Icon name="MoreVerticalCircle01Icon" size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                totalItems={mockOrders.length}
                itemName="Orders"
              />
            </div>
          </TabsContent>

          <TabsContent value="strategy" className="p-6 animate-in fade-in duration-300 mt-0">
            <FeedPhaseTracker />
          </TabsContent>
        </Tabs>
      </div>

      <InventoryStockSheet isOpen={activeSheet === 'inventory-stock'} onClose={closeSheet} />
      <NewOrderSheet isOpen={activeSheet === 'new-order'} onClose={closeSheet} />
    </div>
  );
}
