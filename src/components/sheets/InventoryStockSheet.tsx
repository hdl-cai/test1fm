/**
 * InventoryStockSheet Component
 *
 * Sheet for adding a new inventory item to the system.
 * Includes form fields for item name, category, stock, threshold, and farm assignment.
 */

import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/hooks/useIcon';
import { useInventoryStore } from '@/stores/useInventoryStore';
import type { InventoryItem } from '@/types';

interface InventoryStockSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'feed', label: 'Feed' },
  { value: 'medical', label: 'Medical' },
  { value: 'supplements', label: 'Supplements' },
];

const UNITS: Record<string, string[]> = {
  feed: ['kg', 'tons', 'bags'],
  medical: ['doses', 'bottles', 'liters', 'sachets', 'tablets'],
  supplements: ['kg', 'grams', 'liters'],
};

const FARMS = [
  { value: '', label: 'Global (Shared)' },
  { value: 'farm-001', label: 'Bukidnon Highlands' },
  { value: 'farm-002', label: 'Valencia Station' },
  { value: 'farm-003', label: 'Davao Farm' },
];

export function InventoryStockSheet({ isOpen, onClose }: InventoryStockSheetProps) {
  const { addItem } = useInventoryStore();

  const [formData, setFormData] = React.useState({
    name: '',
    category: '' as InventoryItem['category'] | '',
    currentStock: '',
    threshold: '',
    unit: '',
    farmId: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const categoryUnits = formData.category ? UNITS[formData.category] || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.currentStock || !formData.threshold || !formData.unit) {
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const currentStock = parseInt(formData.currentStock, 10);
    const threshold = parseInt(formData.threshold, 10);
    let status: InventoryItem['status'] = 'in_stock';
    if (currentStock === 0) status = 'out_of_stock';
    else if (currentStock <= threshold) status = 'low_stock';

    const newItemData: Omit<InventoryItem, 'id'> = {
      name: formData.name,
      category: formData.category as InventoryItem['category'],
      currentStock,
      unit: formData.unit,
      threshold,
      status,
      farmId: formData.farmId || undefined,
      lastRestocked: new Date(),
    };

    addItem(newItemData);

    setFormData({
      name: '',
      category: '',
      currentStock: '',
      threshold: '',
      unit: '',
      farmId: '',
    });

    setIsSubmitting(false);
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      category: '',
      currentStock: '',
      threshold: '',
      unit: '',
      farmId: '',
    });
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleCancel}
      title="Add New Inventory Item"
      description="Add a new item to your inventory"
      width="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="item-name" className="text-micro font-bold text-[#9AA09D] uppercase tracking-wider">
              Item Name
            </Label>
            <Input
              id="item-name"
              type="text"
              placeholder="e.g. Premium Starter Feed"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#131514] border-[#252726] text-white placeholder:text-[#9AA09D]/30 focus:border-[#36e278] focus:ring-[#36e278] h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-micro font-bold text-[#9AA09D] uppercase tracking-wider">
              Category
            </Label>
            <div className="relative">
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryItem['category'] | '', unit: '' })}
                className="w-full bg-[#131514] border border-[#252726] rounded-md h-11 pl-4 pr-10 text-sm text-white focus:border-[#36e278] focus:ring-1 focus:ring-[#36e278] focus:outline-none appearance-none cursor-pointer transition-colors transition-[width] transition-[height]"
                required
              >
                <option value="" disabled className="bg-[#131514]">Select category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-[#131514]">
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#9AA09D]">
                <Icon name="ArrowDown01Icon" size={18} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-stock" className="text-micro font-bold text-[#9AA09D] uppercase tracking-wider">
                Initial Stock
              </Label>
              <Input
                id="current-stock"
                type="number"
                placeholder="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                className="w-full bg-[#131514] border-[#252726] text-white placeholder:text-[#9AA09D]/30 focus:border-[#36e278] focus:ring-[#36e278] h-11"
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-micro font-bold text-[#9AA09D] uppercase tracking-wider">
                Unit
              </Label>
              <div className="relative">
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full bg-[#131514] border border-[#252726] rounded-md h-11 pl-4 pr-10 text-sm text-white focus:border-[#36e278] focus:ring-1 focus:ring-[#36e278] focus:outline-none appearance-none cursor-pointer transition-colors transition-opacity transition-[width] transition-[height] disabled:opacity-50"
                  required
                  disabled={!formData.category}
                >
                  <option value="" disabled className="bg-[#131514]">Select unit...</option>
                  {categoryUnits.map((unit) => (
                    <option key={unit} value={unit} className="bg-[#131514]">
                      {unit}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#9AA09D]">
                  <Icon name="ArrowDown01Icon" size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold" className="text-micro font-bold text-[#9AA09D] uppercase tracking-wider">
              Low Stock Threshold
            </Label>
            <Input
              id="threshold"
              type="number"
              placeholder="100"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
              className="w-full bg-[#131514] border-[#252726] text-white placeholder:text-[#9AA09D]/30 focus:border-[#36e278] focus:ring-[#36e278] h-11"
              required
              min="0"
            />
            <p className="text-micro text-[#9AA09D] font-medium">System will alert when stock falls below this value.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="farm" className="text-micro font-bold text-[#9AA09D] uppercase tracking-wider">
              Farm Assignment
            </Label>
            <div className="relative">
              <select
                id="farm"
                value={formData.farmId}
                onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                className="w-full bg-[#131514] border border-[#252726] rounded-md h-11 pl-4 pr-10 text-sm text-white focus:border-[#36e278] focus:ring-1 focus:ring-[#36e278] focus:outline-none appearance-none cursor-pointer transition-colors transition-[width] transition-[height]"
              >
                {FARMS.map((farm) => (
                  <option key={farm.value} value={farm.value} className="bg-[#131514]">
                    {farm.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#9AA09D]">
                <Icon name="ArrowDown01Icon" size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#252726] flex flex-col gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-[#36e278] hover:bg-[#36e278]/90 text-black font-bold rounded-lg transition-colors transition-opacity transition-shadow transition-[width] transition-[height] flex items-center justify-center gap-2 shadow-lg shadow-[#36e278]/10 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Icon name="CycleIcon" size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Icon name="FloppyDiskIcon" size={20} />
                Save Item
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="w-full h-12 border border-[#252726] text-white font-bold hover:bg-[#1C1E1D] rounded-lg transition-colors transition-[width] transition-[height]"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

export default InventoryStockSheet;
