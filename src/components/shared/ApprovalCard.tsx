/**
 * ApprovalCard Component
 * 
 * Displays a list of pending approvals with approve/reject actions
 * Used for dashboard pending approvals section
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckmarkCircle01Icon, Icon, Clock01Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';

export interface ApprovalItem {
  id: string;
  type: 'expense' | 'payroll' | 'cash_advance' | 'order';
  title: string;
  description: string;
  amount?: number;
  requestedBy: string;
  requestDate: string;
  priority: 'high' | 'normal' | 'low';
}

interface ApprovalCardProps {
  approvals: ApprovalItem[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  className?: string;
}

export function ApprovalCard({
  approvals,
  className,
}: ApprovalCardProps) {
  const formatAmount = (amount?: number) => {
    if (amount === undefined) return null;
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className={cn('bg-card border-border flex flex-col shadow-sm light:shadow-[var(--card-shadow)]', className)}>
      <CardHeader className="p-5 pb-4 shrink-0 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center border border-warning/20">
              <Clock01Icon size={16} className="text-warning" />
            </div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Pending Approvals</h3>
          </div>
          <span className="bg-warning/10 text-warning text-micro px-2.5 py-1 rounded-lg border border-warning/20 font-black uppercase tracking-widest shrink-0 shadow-sm shadow-warning/5">
            {approvals.length} PENDING
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden min-h-0">
        <ScrollArea className="h-full">
          <div className="p-5 space-y-3">
            {approvals.map((item) => {
              return (
                <div
                  key={item.id}
                  className="group/approval relative overflow-hidden bg-white/[0.02] dark:bg-black/20 rounded-xl p-4 border border-border/40 transition-colors transition-transform transition-shadow transition-[width] duration-300 hover:bg-white/[0.04] dark:hover:bg-black/30 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-background border border-border/50 text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      {item.type}
                    </span>
                    <span className="text-sm font-black text-foreground font-data">{formatAmount(item.amount)}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-foreground tracking-tight">{item.title}</h4>
                    <p className="text-micro text-muted-foreground mt-1 line-clamp-1 italic">{item.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]">Requester</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-micro font-bold text-primary border border-primary/10">
                          {item.requestedBy.charAt(0)}
                        </div>
                        <span className="text-micro font-semibold text-muted-foreground">{item.requestedBy}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="h-8 px-3 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/50 hover:text-foreground text-micro font-bold text-muted-foreground transition-colors transition-[height] flex items-center gap-1.5 uppercase tracking-wide">
                        <Icon name="Cancel01Icon" size={12} />
                        Reject
                      </button>
                      <button className="h-8 px-4 rounded-lg bg-success hover:bg-success/90 text-white text-micro font-bold transition-colors transition-transform transition-shadow transition-[width] transition-[height] flex items-center gap-1.5 uppercase tracking-wide shadow-md shadow-success/10 hover:shadow-lg hover:shadow-success/20 hover:-translate-y-0.5 active:translate-y-0">
                        <Icon name="CheckmarkCircle01Icon" size={12} />
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {approvals.length === 0 && (
              <div className="text-center py-12 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <CheckmarkCircle01Icon size={24} className="text-muted-foreground/30" />
                </div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">All Clear</p>
                <p className="text-micro text-muted-foreground/50 mt-1">No pending requests in queue</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ApprovalCard;
