import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatPHP } from '@/lib/utils';
import type { CashAdvanceWithEmployee } from '@/lib/data/payroll';
import {
  CheckCircleIcon,
  CancelIcon,
  HistoryIcon,
  ClipboardIcon,
} from '@/hooks/useIcon';

interface CashAdvanceReviewTableProps {
  advances: CashAdvanceWithEmployee[];
  onApprove: (id: string, note?: string) => void;
  onReject: (id: string, note?: string) => void;
  isSaving?: boolean;
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    case 'approved': return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/30';
    case 'deducted': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    default: return 'bg-muted/50 text-muted-foreground border-border/50';
  }
}

interface ActionPanelProps {
  id: string;
  onApprove: (id: string, note?: string) => void;
  onReject: (id: string, note?: string) => void;
  isSaving?: boolean;
}

function ActionPanel({ id, onApprove, onReject, isSaving }: ActionPanelProps) {
  const [mode, setMode] = useState<null | 'approve' | 'reject'>(null);
  const [note, setNote] = useState('');

  if (mode === 'approve') {
    return (
      <div className="mt-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg space-y-2">
        <p className="text-xs text-green-400 font-bold uppercase tracking-widest">Add note (optional)</p>
        <Input placeholder="Optional approval note…" value={note} onChange={(e) => setNote(e.target.value)} className="h-8 text-xs" />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setMode(null)} className="text-xs">Cancel</Button>
          <Button size="sm" disabled={isSaving} onClick={() => { onApprove(id, note || undefined); setMode(null); setNote(''); }}
            className="text-xs bg-green-600 hover:bg-green-500 text-white">
            <CheckCircleIcon size={12} className="mr-1" /> Confirm Approve
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'reject') {
    return (
      <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg space-y-2">
        <p className="text-xs text-red-400 font-bold uppercase tracking-widest">Rejection reason (required)</p>
        <Input placeholder="Reason for rejection…" value={note} onChange={(e) => setNote(e.target.value)} className="h-8 text-xs border-red-500/30" />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setMode(null)} className="text-xs">Cancel</Button>
          <Button size="sm" disabled={isSaving || !note.trim()} onClick={() => { onReject(id, note); setMode(null); setNote(''); }}
            className="text-xs bg-red-600 hover:bg-red-500 text-white">
            <CancelIcon size={12} className="mr-1" /> Confirm Reject
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-3">
      <Button size="sm" variant="outline" onClick={() => setMode('reject')} disabled={isSaving}
        className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50">
        <CancelIcon size={12} className="mr-1" /> Reject
      </Button>
      <Button size="sm" onClick={() => setMode('approve')} disabled={isSaving}
        className="text-xs bg-green-600 hover:bg-green-500 text-white">
        <CheckCircleIcon size={12} className="mr-1" /> Approve
      </Button>
    </div>
  );
}

type TabType = 'pending' | 'history';
type FilterType = 'all' | 'approved' | 'rejected' | 'deducted';

export function CashAdvanceReviewTable({
  advances,
  onApprove,
  onReject,
  isSaving,
}: CashAdvanceReviewTableProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [filter, setFilter] = useState<FilterType>('all');

  const pendingAdvances = advances.filter((a) => a.status === 'pending');
  const historyAdvances = advances.filter((a) => a.status !== 'pending');
  const filteredHistory = filter === 'all' ? historyAdvances : historyAdvances.filter((a) => a.status === filter);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="flex bg-muted/30 rounded-lg p-1 border border-border w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={cn('flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors',
            activeTab === 'pending' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
        >
          <ClipboardIcon size={12} /> Pending
          {pendingAdvances.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">{pendingAdvances.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn('flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors',
            activeTab === 'history' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
        >
          <HistoryIcon size={12} /> History
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="space-y-3">
          {pendingAdvances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircleIcon size={32} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No pending requests</p>
              <p className="text-xs text-muted-foreground/60 mt-1">All cash advances have been reviewed</p>
            </div>
          ) : (
            pendingAdvances.map((adv) => (
              <div key={adv.id} className="p-4 rounded-xl bg-card border border-border hover:border-border/80 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border border-border/50 text-xs font-bold text-foreground shrink-0">
                      {adv.employee ? adv.employee.first_name[0] : '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {adv.employee ? `${adv.employee.first_name} ${adv.employee.last_name}` : adv.employee_id.slice(0, 8)}
                      </p>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">{adv.employee?.role ?? '—'}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-foreground tabular-nums">{formatPHP(adv.amount)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(adv.request_date)}</p>
                  </div>
                </div>
                {adv.reason && <p className="mt-2 text-xs text-muted-foreground italic line-clamp-2">"{adv.reason}"</p>}
                <ActionPanel id={adv.id} onApprove={onApprove} onReject={onReject} isSaving={isSaving} />
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{filteredHistory.length} records</p>
            <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
              <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="deducted">Deducted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HistoryIcon size={32} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No records found</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest">Employee</th>
                    <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-right">Amount</th>
                    <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                    <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest">Note</th>
                    <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest">Deducted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredHistory.map((adv) => (
                    <tr key={adv.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {adv.employee ? `${adv.employee.first_name} ${adv.employee.last_name}` : adv.employee_id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase">{adv.employee?.role}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">{formatPHP(adv.amount)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(adv.request_date)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase border', getStatusBadgeClass(adv.status))}>
                          {adv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[120px] truncate">{adv.review_note ?? '—'}</td>
                      <td className="px-4 py-3">
                        {adv.deducted_in_payroll_id
                          ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase border bg-blue-500/10 text-blue-400 border-blue-500/30">Deducted</span>
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

