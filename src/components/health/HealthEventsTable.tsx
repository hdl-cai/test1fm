/**
 * HealthEventsTable
 * Table of health records with type and date filters.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/hooks/useIcon';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTablePagination } from '@/components/shared';
import type { HealthRecordWithVeterinarianRow } from '@/lib/data-adapters';

const RECORD_TYPE_LABELS: Record<string, string> = {
  vaccination: 'Vaccination',
  treatment: 'Treatment',
  inspection: 'Inspection',
  disease_observation: 'Disease Obs.',
  vet_visit: 'Vet Visit',
  other: 'Other',
};

const OUTCOME_CONFIG: Record<string, { label: string; type: 'success' | 'warning' | 'danger' }> = {
  resolved: { label: 'Resolved', type: 'success' },
  ongoing: { label: 'Ongoing', type: 'warning' },
  escalated: { label: 'Escalated', type: 'danger' },
};

interface HealthEventsTableProps {
  records: HealthRecordWithVeterinarianRow[];
  onAddEvent: () => void;
  isAdmin: boolean;
}

export function HealthEventsTable({ records, onAddEvent, isAdmin }: HealthEventsTableProps) {
  const [typeFilter, setTypeFilter] = React.useState('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const filtered = React.useMemo(() => {
    let result = records;
    if (typeFilter) result = result.filter(r => r.record_type === typeFilter);
    if (dateFrom) result = result.filter(r => r.record_date >= dateFrom);
    if (dateTo) result = result.filter(r => r.record_date <= dateTo);
    return result;
  }, [records, typeFilter, dateFrom, dateTo]);

  React.useEffect(() => { setCurrentPage(1); }, [typeFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getVetName = (record: HealthRecordWithVeterinarianRow) => {
    const v = record.veterinarian;
    if (!v) return '—';
    return `${v.first_name ?? ''} ${v.last_name ?? ''}`.trim() || '—';
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Type filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-lg border border-border bg-card text-sm font-medium text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              <option value="">All Types</option>
              {Object.entries(RECORD_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <Icon name="ArrowDown01Icon" size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {/* Date range */}
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 w-36 text-sm"
            placeholder="From"
          />
          <span className="text-muted-foreground text-sm">—</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 w-36 text-sm"
            placeholder="To"
          />

          {(typeFilter || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setTypeFilter(''); setDateFrom(''); setDateTo(''); }}
              className="h-9 text-muted-foreground"
            >
              <Icon name="CancelIcon" size={12} className="mr-1" />
              Clear
            </Button>
          )}
        </div>

        {isAdmin && (
          <Button onClick={onAddEvent} size="sm">
            <Icon name="PlusSignIcon" size={14} className="mr-1.5" />
            Add Health Event
          </Button>
        )}
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Icon name="ActivityIcon" size={32} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No health events</p>
          {isAdmin && (
            <p className="text-xs text-muted-foreground mt-1">
              Add the first health event using the button above.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Type</th>
                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Subject</th>
                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">Medication</th>
                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">Birds Affected</th>
                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">Outcome</th>
                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginated.map((record) => {
                const outcome = record.outcome ? OUTCOME_CONFIG[record.outcome] : null;
                return (
                  <tr key={record.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <span className="text-xs font-bold text-muted-foreground tabular-nums">
                        {new Date(record.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        'text-xs font-bold px-2 py-1 rounded-md border',
                        'bg-muted/40 border-border text-muted-foreground'
                      )}>
                        {RECORD_TYPE_LABELS[record.record_type] ?? record.record_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-foreground">{record.subject}</p>
                      {record.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">{record.notes}</p>
                      )}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {record.medication_name ? (
                        <div>
                          <p className="text-xs font-medium text-foreground">{record.medication_name}</p>
                          {record.dosage && (
                            <p className="text-xs text-muted-foreground">{record.dosage}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-sm text-foreground">
                        {record.birds_affected != null ? record.birds_affected.toLocaleString() : '—'}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      {outcome ? (
                        <StatusBadge status={outcome.type} label={outcome.label} size="sm" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{getVetName(record)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={itemsPerPage}
          totalItems={filtered.length}
          itemName="Event"
        />
      )}
    </div>
  );
}
