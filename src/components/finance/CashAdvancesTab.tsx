import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn, formatPHP } from '@/lib/utils';
import { usePayrollStore } from '@/stores/usePayrollStore';
import { CashAdvanceRequestForm } from './CashAdvanceRequestForm';
import { CashAdvanceReviewTable } from './CashAdvanceReviewTable';
import { CreditCardIcon, PlusSignIcon, CalendarIcon } from '@/hooks/useIcon';

interface CashAdvancesTabProps {
  orgId: string;
  userId: string;
  userRole: string;
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

export function CashAdvancesTab({ orgId, userId, userRole }: CashAdvancesTabProps) {
  const isAdmin = userRole === 'admin' || userRole === 'owner';

  const {
    cashAdvances, myCashAdvances, isSaving,
    fetchAll, fetchMyAdvances, submitAdvance, reviewAdvance,
  } = usePayrollStore();

  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    void fetchAll(orgId);
    void fetchMyAdvances(userId, orgId);
  }, [fetchAll, fetchMyAdvances, orgId, userId]);

  const handleSubmit = async (data: { amount: number; reason: string; requestDate: string }) => {
    await submitAdvance?.({ orgId, userId, ...data });
  };

  const handleApprove = (id: string, note?: string) => {
    reviewAdvance?.({ id, status: 'approved', reviewNote: note, reviewedBy: userId });
  };

  const handleReject = (id: string, note?: string) => {
    reviewAdvance?.({ id, status: 'rejected', reviewNote: note, reviewedBy: userId });
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-8 p-1">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">My Requests</h3>
            <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-muted/50 text-muted-foreground border border-border/50">{myCashAdvances?.length ?? 0}</span>
          </div>
          <Button size="sm" onClick={() => setShowRequestForm(true)} className="text-xs">
            <PlusSignIcon size={12} className="mr-1.5" /> Request Cash Advance
          </Button>
        </div>

        {(!myCashAdvances || myCashAdvances.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-xl">
            <CreditCardIcon size={32} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No cash advance requests</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Submit a request to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myCashAdvances.map((adv) => (
              <div key={adv.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-border/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border border-border/50">
                    <CreditCardIcon size={14} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground tabular-nums">{formatPHP(adv.amount)}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarIcon size={10} /> {formatDate(adv.request_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {adv.reason && (
                    <p className="text-xs text-muted-foreground italic max-w-40 truncate hidden sm:block">"{adv.reason}"</p>
                  )}
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase border', getStatusBadgeClass(adv.status))}>
                    {adv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">All Requests</h3>
            <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-muted/50 text-muted-foreground border border-border/50">{cashAdvances?.length ?? 0}</span>
          </div>
          <CashAdvanceReviewTable
            advances={cashAdvances ?? []}
            onApprove={handleApprove}
            onReject={handleReject}
            isSaving={isSaving}
          />
        </div>
      )}

      <CashAdvanceRequestForm
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />
    </div>
  );
}

