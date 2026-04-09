import * as React from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { TableHeader } from '@/components/ui/table-header';
import { Icon } from '@/hooks/useIcon';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { SupplierForm } from './SupplierForm';
import type { SupplierRow } from '@/lib/data/suppliers';
import { getErrorMessage } from '@/lib/data/errors';
import { Loader2 } from 'lucide-react';

interface SupplierTableProps {
  orgId: string;
}

export function SupplierTable({ orgId }: SupplierTableProps) {
  const { suppliers, isLoadingSuppliers, fetchSuppliers, archiveSupplier, restoreSupplier } = useInventoryStore();
  const [showArchived, setShowArchived] = React.useState(false);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingSupplier, setEditingSupplier] = React.useState<SupplierRow | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const reload = React.useCallback(() => {
    fetchSuppliers(orgId, showArchived);
  }, [fetchSuppliers, orgId, showArchived]);

  React.useEffect(() => { reload(); }, [reload]);

  const handleArchive = async (id: string) => {
    try {
      await archiveSupplier(id);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to archive supplier.'));
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreSupplier(id);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to restore supplier.'));
    }
  };

  const visible = showArchived ? suppliers : suppliers.filter((s) => !s.is_archived);

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-danger/5 border border-danger/20 text-danger text-sm">{error}</div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Supplier Directory</h3>
          <span className="px-2 py-0.5 rounded-lg text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase font-data">
            {visible.length} SUPPLIERS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded"
            />
            Show archived
          </label>
          <Button onClick={() => { setEditingSupplier(null); setIsFormOpen(true); }} className="h-10 px-4">
            <Icon name="AddIcon" size={16} className="mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <TableHeader className="px-6 py-4 text-left">Supplier</TableHeader>
                <TableHeader className="px-6 py-4 text-left">Contact</TableHeader>
                <TableHeader className="px-6 py-4 text-left">Supply Categories</TableHeader>
                <TableHeader className="px-6 py-4 text-left">Notes</TableHeader>
                <TableHeader className="px-6 py-4 text-center">Actions</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoadingSuppliers ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20">
                    <EmptyState
                      icon="BuildingIcon"
                      title="No Suppliers"
                      description="Add suppliers to track who you source from."
                      className="bg-transparent"
                    />
                  </td>
                </tr>
              ) : (
                visible.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className={`group hover:bg-row-hover transition-colors bg-background ${supplier.is_archived ? 'opacity-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">{supplier.name}</p>
                      {supplier.is_archived && (
                        <span className="badge badge-muted mt-1">Archived</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        {supplier.contact_person && (
                          <p className="text-sm text-foreground">{supplier.contact_person}</p>
                        )}
                        {supplier.contact_number && (
                          <p className="text-xs text-muted-foreground">{supplier.contact_number}</p>
                        )}
                        {supplier.email && (
                          <p className="text-xs text-muted-foreground">{supplier.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(supplier.supply_categories ?? []).length > 0
                          ? (supplier.supply_categories ?? []).map((cat) => (
                              <span key={cat} className="badge badge-info">{cat}</span>
                            ))
                          : <span className="text-muted-foreground text-sm">—</span>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-[200px] truncate">
                      {supplier.notes || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground border border-border/40 hover:border-border/60"
                          title="Edit"
                          onClick={() => { setEditingSupplier(supplier); setIsFormOpen(true); }}
                        >
                          <Icon name="Edit02Icon" size={16} />
                        </Button>
                        {supplier.is_archived ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-9 h-9 rounded-xl text-muted-foreground hover:text-success border border-border/40 hover:border-success/40"
                            title="Restore"
                            onClick={() => handleRestore(supplier.id)}
                          >
                            <Icon name="RefreshIcon" size={16} />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-9 h-9 rounded-xl text-muted-foreground hover:text-danger border border-border/40 hover:border-danger/40"
                            title="Archive"
                            onClick={() => handleArchive(supplier.id)}
                          >
                            <Icon name="Delete02Icon" size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SupplierForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingSupplier(null); }}
        supplier={editingSupplier}
        onSaved={reload}
      />
    </div>
  );
}
