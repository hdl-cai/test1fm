/**
 * NewOrderSheet Component
 *
 * Sheet for creating a new inventory order.
 * Includes form fields for order type, supplier, items, and delivery details.
 */

import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/hooks/useIcon';
import type { Order, OrderItem } from '@/types';

interface NewOrderSheetProps {
  isOpen: boolean;
  onClose: () => void;
}



const SUPPLIERS = [
  { value: 'AgriSupply Co.', label: 'AgriSupply Co.' },
  { value: 'VetPharma Inc.', label: 'VetPharma Inc.' },
  { value: 'FeedAdditives Ltd.', label: 'FeedAdditives Ltd.' },
  { value: 'PoultryCare Supplies', label: 'PoultryCare Supplies' },
];

const AVAILABLE_ITEMS = [
  { id: 'inv-001', name: 'Premium Starter Feed', category: 'feed', unit: 'kg', price: 2.5 },
  { id: 'inv-004', name: 'Grower Feed Standard', category: 'feed', unit: 'kg', price: 2.2 },
  { id: 'inv-007', name: 'Finisher Feed A', category: 'feed', unit: 'kg', price: 2.3 },
  { id: 'inv-009', name: 'Broiler Premix', category: 'feed', unit: 'kg', price: 5.0 },
  { id: 'inv-013', name: 'Newcastle Vaccine', category: 'medical', unit: 'doses', price: 5.0 },
  { id: 'inv-014', name: 'Gumboro Vaccine', category: 'medical', unit: 'doses', price: 4.5 },
  { id: 'inv-016', name: 'Antibiotics - Enrofloxacin', category: 'medical', unit: 'bottles', price: 25.0 },
  { id: 'inv-019', name: 'Lysine Supplement', category: 'supplements', unit: 'kg', price: 15.0 },
  { id: 'inv-020', name: 'Methionine', category: 'supplements', unit: 'kg', price: 18.0 },
];



export function NewOrderSheet({ isOpen, onClose }: NewOrderSheetProps) {
  const [formData, setFormData] = React.useState({
    type: '' as Order['type'] | '',
    supplier: '',
    farmId: '',
    quantity: '',
    selectedItem: '',
    expectedDate: '2026-02-15',
  });
  const [orderItems, setOrderItems] = React.useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isQuickReorderOpen, setIsQuickReorderOpen] = React.useState(true);

  const selectedItem = AVAILABLE_ITEMS.find(item => item.id === formData.selectedItem);



  const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const addItem = () => {
    if (!selectedItem || !formData.quantity) return;

    const quantity = parseInt(formData.quantity, 10);
    const totalPrice = quantity * selectedItem.price;

    const newItem: OrderItem = {
      id: `oi-${Date.now()}`,
      inventoryItemId: selectedItem.id,
      name: selectedItem.name,
      quantity,
      unit: selectedItem.unit,
      unitPrice: selectedItem.price,
      totalPrice,
    };

    setOrderItems([...orderItems, newItem]);
    setFormData({ ...formData, selectedItem: '', quantity: '' });
  };

  const removeItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const handleQuickReorder = (order: { supplier: string; items: OrderItem[] }) => {
    const newItems = order.items.map(item => ({
      id: `oi-${Date.now()}-${Math.random()}`,
      inventoryItemId: item.inventoryItemId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));
    setOrderItems(newItems);
    setFormData({ ...formData, supplier: order.supplier });
    setIsQuickReorderOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplier || orderItems.length === 0) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock submission logic
    setIsSubmitting(false);
    onClose();
    setOrderItems([]);
    setFormData({
      type: '',
      supplier: '',
      farmId: '',
      quantity: '',
      selectedItem: '',
      expectedDate: '2026-02-15',
    });
  };

  const handleCancel = () => {
    setOrderItems([]);
    setFormData({
      type: '',
      supplier: '',
      farmId: '',
      quantity: '',
      selectedItem: '',
      expectedDate: '2026-02-15',
    });
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleCancel}
      title="Create New Order"
      description="Generate a purchase order for supplies"
      width="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full bg-background/95">
        <div className="flex-1 space-y-8 pr-2">
          {/* Quick Reorder Accordion */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setIsQuickReorderOpen(!isQuickReorderOpen)}
              className="w-full flex items-center justify-between px-5 py-4 bg-success/10 hover:bg-success/20 transition-colors group"
            >
              <div className="flex items-center gap-3 text-success">
                <Icon name="TimeHighIcon" size={18} />
                <span className="text-sm font-black uppercase tracking-[0.1em]">Quick Reorder</span>
              </div>
              <Icon
                name={isQuickReorderOpen ? "ArrowUp01Icon" : "ArrowDown01Icon"}
                size={18}
                className="text-[#9AA09D] group-hover:text-white transition-colors"
              />
            </button>
            {isQuickReorderOpen && (
              <div className="px-5 py-5 border-t border-border bg-muted/20">
                <h4 className="text-micro font-bold text-muted-foreground uppercase tracking-widest mb-4">Last 3 Orders</h4>
                <div className="space-y-3">
                  {[
                    { id: '1', supplier: 'Northern Feeds Corp', desc: 'Layer Mash x50 • Jan 24', total: 45000, items: [{ id: 'oi-1', inventoryItemId: 'inv-001', name: 'Layer Mash', quantity: 50, unit: 'bags', unitPrice: 900, totalPrice: 45000 }] },
                    { id: '2', supplier: 'BioVet Labs', desc: 'Vaccine Kit x10 • Jan 18', total: 12500, items: [{ id: 'oi-2', inventoryItemId: 'inv-013', name: 'Vaccine Kit', quantity: 10, unit: 'kits', unitPrice: 1250, totalPrice: 12500 }] },
                  ].map((order) => (
                    <div
                      key={order.id}
                      onClick={() => handleQuickReorder(order)}
                      className="bg-muted/20 border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer group"
                    >
                      <div>
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{order.supplier}</p>
                        <p className="text-micro text-muted-foreground mt-1">{order.desc}</p>
                      </div>
                      <span className="text-sm font-bold text-success font-data">₱{order.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-micro font-bold text-muted-foreground/70 uppercase tracking-[0.2em]">
                  Supplier
                </Label>
                <div className="relative">
                  <select
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full bg-card border border-border rounded-lg h-11 pl-4 pr-10 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled className="bg-card">Select supplier</option>
                    {SUPPLIERS.map((s) => (
                      <option key={s.value} value={s.value} className="bg-card">{s.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-muted-foreground">
                    <Icon name="ArrowDown01Icon" size={18} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected-date" className="text-micro font-bold text-muted-foreground/70 uppercase tracking-[0.2em]">
                  Expected Delivery
                </Label>
                <div className="relative">
                  <Input
                    id="expected-date"
                    type="date"
                    value={formData.expectedDate}
                    onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                    className="w-full bg-card border border-border rounded-lg h-11 pl-4 pr-10 text-sm text-foreground focus:border-primary outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-micro font-bold text-muted-foreground/70 uppercase tracking-[0.2em]">Order Items</Label>
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!selectedItem || !formData.quantity}
                  className="text-micro font-bold text-success hover:text-success/80 flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <Icon name="AddIcon" size={14} /> Add Item
                </button>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 space-y-5">
                <div className="grid grid-cols-12 gap-3 px-1">
                  <div className="col-span-6 text-micro font-bold text-muted-foreground uppercase tracking-widest">Item Name</div>
                  <div className="col-span-2 text-micro font-bold text-muted-foreground uppercase tracking-widest text-center">Qty</div>
                  <div className="col-span-3 text-micro font-bold text-muted-foreground uppercase tracking-widest">Price</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Items in Drawer */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {orderItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-center group">
                      <div className="col-span-6">
                        <div className="w-full bg-muted/20 border border-border text-foreground rounded px-3 py-2 text-xs font-medium truncate">
                          {item.name}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="w-full bg-muted/20 border border-border text-foreground rounded px-1 py-2 text-xs text-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="w-full bg-muted/20 border border-border text-success rounded px-3 py-2 text-xs font-bold font-data">
                          ₱{item.unitPrice.toLocaleString()}
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-danger transition-colors"
                        >
                          <Icon name="Delete01Icon" size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Item Inputs */}
                <div className="grid grid-cols-12 gap-3 mt-4 border-t border-border/50 pt-5">
                  <div className="col-span-6">
                    <div className="relative">
                      <select
                        value={formData.selectedItem}
                        onChange={(e) => setFormData({ ...formData, selectedItem: e.target.value })}
                        className="w-full bg-card border border-border rounded-md h-9 pl-3 pr-8 text-micro text-foreground focus:border-primary appearance-none"
                      >
                        <option value="">Select Item...</option>
                        {AVAILABLE_ITEMS.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-muted-foreground">
                        <Icon name="ArrowDown01Icon" size={14} />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full bg-card border-border text-foreground rounded h-9 px-2 text-micro text-center focus:border-primary"
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="w-full bg-muted/20 border border-border text-muted-foreground rounded h-9 px-3 flex items-center text-micro font-bold">
                      ₱{(selectedItem?.price || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border bg-card">
          <div className="flex items-center justify-between mb-6">
            <span className="text-micro font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">Total Estimated Amount</span>
            <span className="text-2xl font-black text-foreground tracking-widest font-data">₱{totalAmount.toLocaleString()}</span>
          </div>
          <div className="space-y-3">
            <Button
              type="submit"
              disabled={isSubmitting || orderItems.length === 0}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-lg shadow-lg shadow-primary/10 transition-colors transition-transform transition-opacity transition-shadow transition-[width] transition-[height] active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Icon name="CycleIcon" size={20} className="animate-spin mr-2" />
                  Generating PO...
                </>
              ) : (
                <>Submit Order</>
              )}
            </Button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full text-xs font-bold text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors transition-[width] py-2"
            >
              Cancel and Save as Draft
            </button>
          </div>
        </div>
      </form>
    </Sheet>
  );
}

export default NewOrderSheet;
