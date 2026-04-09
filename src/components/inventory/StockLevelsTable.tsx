import * as React from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { TableHeader } from '@/components/ui/table-header';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { StockLevelItem } from '@/lib/data/purchase-orders';

interface StockLevelsTableProps {
  items: StockLevelItem[];
  isLoading: boolean;
}

const STATUS_CONFIG = {
  in_stock: { label: 'In Stock', className: 'badge-success' },
  low_stock: { label: 'Low Stock', className: 'badge-warning' },
  out_of_stock: { label: 'Out of Stock', className: 'badge-danger' },
};

export function StockLevelsTable({ items, isLoading }: StockLevelsTableProps) {
  const [search, setSearch] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const lowCount = items.filter((i) => i.status === 'low_stock').length;
  const outCount = items.filter((i) => i.status === 'out_of_stock').length;

  return (
    <div className="space-y-6">
      {/* Alert row */}
      {(lowCount > 0 || outCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {outCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-danger/5 border border-danger/20 text-danger text-sm font-medium">
              <Icon name="AlertCircleIcon" size={16} />
              {outCount} item{outCount > 1 ? 's' : ''} out of stock
            </div>
          )}
          {lowCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warning/5 border border-warning/20 text-warning text-sm font-medium">
              <Icon name="AlertTriangleIcon" size={16} />
              {lowCount} item{lowCount > 1 ? 's' : ''} running low
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icon name="Search01Icon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'in_stock', 'low_stock', 'out_of_stock'] as const).map((s) => (
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
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <TableHeader className="px-6 py-4 text-left">Item</TableHeader>
                <TableHeader className="px-6 py-4 text-left">Category</TableHeader>
                <TableHeader className="px-6 py-4 text-right">Current Stock</TableHeader>
                <TableHeader className="px-6 py-4 text-right">Threshold</TableHeader>
                <TableHeader className="px-6 py-4 text-center">Status</TableHeader>
                <TableHeader className="px-6 py-4 text-left">Last Restocked</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20">
                    <EmptyState
                      icon="BoxIcon"
                      title="No Items"
                      description="No stock items match your filter."
                      className="bg-transparent"
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const cfg = STATUS_CONFIG[item.status];
                  return (
                    <tr key={item.id} className="group hover:bg-row-hover transition-colors bg-background">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-foreground">{item.name}</p>
                          {item.itemIdCode && (
                            <p className="text-micro text-muted-foreground/40 uppercase tracking-widest">{item.itemIdCode}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge badge-info">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-bold text-foreground">
                        {item.currentQty.toLocaleString()} <span className="text-muted-foreground font-normal text-xs">{item.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-muted-foreground">
                        {item.threshold > 0 ? `${item.threshold.toLocaleString()} ${item.unit}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn('badge', cfg.className)}>{cfg.label}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
