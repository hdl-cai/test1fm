import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { SupplierRow, SaveSupplierInput } from '@/lib/data/suppliers';
import { getErrorMessage } from '@/lib/data/errors';

const CATEGORY_OPTIONS = [
  'Feed',
  'Medicine',
  'Supplements',
  'Equipment',
  'Packaging',
  'Cleaning & Hygiene',
  'Other',
];

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: SupplierRow | null;
  onSaved?: () => void;
}

export function SupplierForm({ isOpen, onClose, supplier, onSaved }: SupplierFormProps) {
  const { saveSupplier } = useInventoryStore();
  const { user } = useAuthStore();

  const [form, setForm] = React.useState({
    name: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    address: '',
    notes: '',
    supplyCategories: [] as string[],
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name,
        contactPerson: supplier.contact_person ?? '',
        contactNumber: supplier.contact_number ?? '',
        email: supplier.email ?? '',
        address: supplier.address ?? '',
        notes: supplier.notes ?? '',
        supplyCategories: supplier.supply_categories ?? [],
      });
    } else {
      setForm({ name: '', contactPerson: '', contactNumber: '', email: '', address: '', notes: '', supplyCategories: [] });
    }
    setError(null);
  }, [supplier, isOpen]);

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      supplyCategories: prev.supplyCategories.includes(cat)
        ? prev.supplyCategories.filter((c) => c !== cat)
        : [...prev.supplyCategories, cat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Supplier name is required.'); return; }
    setIsSaving(true);
    setError(null);
    try {
      const input: SaveSupplierInput = {
        id: supplier?.id,
        orgId: user?.orgId,
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim() || null,
        contactNumber: form.contactNumber.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        supplyCategories: form.supplyCategories,
        notes: form.notes.trim() || null,
      };
      await saveSupplier(input);
      onSaved?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save supplier.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={supplier ? 'Edit Supplier' : 'Add Supplier'}
      description="Manage supplier details and supply categories."
      width="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-danger/5 border border-danger/20 text-danger text-sm">{error}</div>
          )}

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Supplier Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. AgriFeeds Corp"
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Contact Person</label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={(e) => setForm((p) => ({ ...p, contactPerson: e.target.value }))}
                placeholder="Name"
                className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.contactNumber}
                onChange={(e) => setForm((p) => ({ ...p, contactNumber: e.target.value }))}
                placeholder="+63 9XX XXX XXXX"
                className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="supplier@example.com"
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              placeholder="Street, City, Province"
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Supply Categories</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    form.supplyCategories.includes(cat)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={3}
              placeholder="Additional notes about this supplier..."
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>

        <div className="border-t border-border p-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : supplier ? 'Update Supplier' : 'Add Supplier'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
