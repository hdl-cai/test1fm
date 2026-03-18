import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared';
import {
    CreditCardIcon,
    CheckCircleIcon,
    CancelIcon,
    CalendarIcon,
    UserIcon,
    Money01Icon,
    ClipboardIcon,
    HistoryIcon
} from '@/hooks/useIcon';
import type { CashAdvance } from '@/types';

interface CashAdvanceReviewSheetProps {
    isOpen: boolean;
    onClose: () => void;
    advance: CashAdvance | null;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
}

export function CashAdvanceReviewSheet({
    isOpen,
    onClose,
    advance,
    onApprove,
    onReject
}: CashAdvanceReviewSheetProps) {
    if (!advance) return null;

    if (!advance) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Sheet
            isOpen={isOpen}
            onClose={onClose}
            title="Cash Advance Request"
            description="Review and process employee cash advance requests"
            width="md"
        >
            <div className="space-y-8">
                {/* Employee Header */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-amber-500 text-lg font-black border border-border/50 shadow-inner">
                        {advance.personId.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground text-lg leading-tight">Employee {advance.personId.substring(0, 4)}</h4>
                        <p className="text-xs text-amber-500 font-black uppercase tracking-widest mt-0.5">Personnel ID: {advance.id.substring(0, 8)}</p>
                    </div>
                </div>

                {/* Amount Section */}
                <div className="text-center py-6 bg-gradient-to-b from-muted to-transparent rounded-2xl border border-border relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                    <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-widest">Requested Amount</p>
                    <h2 className="text-5xl font-black text-foreground tracking-tighter">{formatCurrency(advance.amount)}</h2>
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 opacity-[0.03] rotate-12">
                        <CreditCardIcon size={80} />
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4 relative z-10">
                        <StatusBadge status={advance.status} />
                    </div>
                </div>

                {/* Request Details */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Request Details</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 group hover:border-border transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-amber-500 transition-colors">
                                    <CalendarIcon size={14} />
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">Request Date</span>
                            </div>
                            <span className="text-xs text-foreground font-bold">{formatDate(advance.requestDate)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 group hover:border-border transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-amber-500 transition-colors">
                                    <ClipboardIcon size={14} />
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">Proposed Deduction</span>
                            </div>
                            <span className="text-xs text-foreground font-bold px-2 py-0.5 rounded bg-muted border border-border uppercase tracking-wider">Payroll Deduction</span>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/20 border border-border border-dashed mt-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Money01Icon size={12} className="text-muted-foreground/50" />
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Reason for Request</p>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed font-medium italic">
                                "{advance.reason}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Employment History & Reliability */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Risk Assessment</h3>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <HistoryIcon size={14} />
                                <span>Previous Advances</span>
                            </div>
                            <span className="text-foreground font-bold">2 Repaid, 0 Pending</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <UserIcon size={14} />
                                <span>Tenure</span>
                            </div>
                            <span className="text-foreground font-bold">14 Months</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-primary w-[92%] rounded-full shadow-[0_0_8px_rgba(var(--color-primary),0.5)]" />
                        </div>
                        <p className="text-micro text-primary font-bold uppercase text-right tracking-tight">Reliability Score: 92%</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex w-full gap-3 mt-6 pt-6 border-t border-border">
                    {advance.status === 'pending' ? (
                        <>
                            <Button
                                onClick={() => onReject?.(advance.id)}
                                variant="outline"
                                className="flex-1 bg-transparent border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 font-bold uppercase tracking-widest text-micro h-11"
                            >
                                <CancelIcon size={14} className="mr-2" />
                                Reject Request
                            </Button>
                            <Button
                                onClick={() => onApprove?.(advance.id)}
                                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest text-micro h-11 shadow-lg shadow-amber-600/20 transition-colors transition-transform transition-shadow transition-[width] transition-[height] active:scale-95"
                            >
                                <CheckCircleIcon size={14} className="mr-2" />
                                Approve Advance
                            </Button>
                        </>
                    ) : (
                        <div className="w-full">
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="w-full bg-muted border border-border text-foreground font-bold uppercase tracking-widest text-micro h-11 hover:bg-card transition-colors"
                            >
                                Close Record
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Sheet>
    );
}
