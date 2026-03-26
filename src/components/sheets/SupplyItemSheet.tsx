/**
 * SupplyItemSheet
 * 
 * Sheet form for creating/editing an inventory_items entry.
 * Fields: Name, Category (from inventory_categories), Unit, Low Stock Threshold.
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { Icon } from '@/hooks/useIcon';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

interface SupplyItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  editItem?: {
    id: string;
    name: string;
    category_id: string;
    unit: string;
    low_stock_threshold: number | null;
    item_id_code: string;
  } | null;
}

interface InventoryCategory {
  id: string;
  name: string;
}

export function SupplyItemSheet({ isOpen, onClose, onSaved, editItem }: SupplyItemSheetProps) {
  const orgId = useAuthStore((state) => state.user?.orgId);

  const [name, setName] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [unit, setUnit] = React.useState('');
  const [threshold, setThreshold] = React.useState('');
  const [categories, setCategories] = React.useState<InventoryCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch categories
  React.useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('inventory_categories')
        .select('id, name')
        .order('name');
      if (data) setCategories(data);
    }
    load();
  }, []);

  // Populate form for edit mode
  React.useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setCategoryId(editItem.category_id);
      setUnit(editItem.unit);
      setThreshold(editItem.low_stock_threshold?.toString() || '');
    } else {
      setName('');
      setCategoryId('');
      setUnit('');
      setThreshold('');
    }
    setError(null);
  }, [editItem, isOpen]);

  const generateItemCode = () => {
    const prefix = 'INV';
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${random}`;
  };

  const handleSubmit = async () => {
    if (!name.trim() || !categoryId || !unit.trim() || !orgId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        org_id: orgId,
        name: name.trim(),
        category_id: categoryId,
        unit: unit.trim(),
        low_stock_threshold: threshold ? parseFloat(threshold) : null,
        item_id_code: editItem?.item_id_code || generateItemCode(),
      };

      if (editItem) {
        const { error: updateError } = await supabase
          .from('inventory_items')
          .update(payload)
          .eq('id', editItem.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('inventory_items')
          .insert(payload);
        if (insertError) throw insertError;
      }

      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save supply item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Edit Supply Item' : 'Add Supply Item'}
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Item Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Premium Starter Feed"
            className="w-full bg-muted/20 border-border border rounded-xl py-3 px-4 text-sm text-foreground focus:border-primary focus:ring-0 focus:outline-none placeholder:text-muted-foreground/30 transition-colors"
          />
        </div>

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

        {/* Unit */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Unit of Measure *</label>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="e.g., kg, bags, bottles, doses"
            className="w-full bg-muted/20 border-border border rounded-xl py-3 px-4 text-sm text-foreground focus:border-primary focus:ring-0 focus:outline-none placeholder:text-muted-foreground/30 transition-colors"
          />
        </div>

        {/* Low Stock Threshold */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Low Stock Threshold</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="Optional — alert when stock drops below this"
            min="0"
            step="1"
            className="w-full bg-muted/20 border-border border rounded-xl py-3 px-4 text-sm text-foreground focus:border-primary focus:ring-0 focus:outline-none placeholder:text-muted-foreground/30 transition-colors tabular-nums"
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !name.trim() || !categoryId || !unit.trim()}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Icon name="CycleIcon" size={16} className="animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            editItem ? 'Update Item' : 'Add Item'
          )}
        </Button>
      </div>
    </Sheet>
  );
}
