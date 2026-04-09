import * as React from 'react';
import type { NetProfitPoint } from '@/lib/data/analytics';

type SortKey = 'cycle_label' | 'end_date' | 'revenue' | 'expenses' | 'net_profit' | 'margin';
type SortDir = 'asc' | 'desc';

interface Props {
  data: NetProfitPoint[];
}

function fmt(n: number) {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <span className="text-muted-foreground/40 ml-1">↕</span>;
  return <span className="text-primary ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

export function CyclePnLTable({ data }: Props) {
  const [sortKey, setSortKey] = React.useState<SortKey>('end_date');
  const [sortDir, setSortDir] = React.useState<SortDir>('desc');

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const rows = [...data]
    .map(r => ({ ...r, margin: r.revenue > 0 ? (r.net_profit / r.revenue) * 100 : 0 }))
    .sort((a, b) => {
      const av = a[sortKey as keyof typeof a] as string | number;
      const bv = b[sortKey as keyof typeof b] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const th = 'px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap';
  const td = 'px-4 py-3 text-sm';

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No completed cycles yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className={th} onClick={() => handleSort('cycle_label')}>
              Cycle <SortIcon col="cycle_label" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} onClick={() => handleSort('end_date')}>
              End Date <SortIcon col="end_date" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th + ' text-right'} onClick={() => handleSort('revenue')}>
              Revenue <SortIcon col="revenue" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th + ' text-right'} onClick={() => handleSort('expenses')}>
              Expenses <SortIcon col="expenses" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th + ' text-right'} onClick={() => handleSort('net_profit')}>
              Net Profit <SortIcon col="net_profit" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th + ' text-right'} onClick={() => handleSort('margin')}>
              Margin % <SortIcon col="margin" sortKey={sortKey} sortDir={sortDir} />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-muted/30 transition-colors">
              <td className={td + ' font-medium'}>{r.cycle_label}</td>
              <td className={td + ' text-muted-foreground'}>
                {r.end_date ? new Date(r.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </td>
              <td className={td + ' text-right tabular-nums'}>{fmt(r.revenue)}</td>
              <td className={td + ' text-right tabular-nums'}>{fmt(r.expenses)}</td>
              <td className={td + ' text-right tabular-nums font-medium ' + (r.net_profit >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                {fmt(r.net_profit)}
              </td>
              <td className={td + ' text-right tabular-nums ' + (r.margin >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                {r.margin.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
