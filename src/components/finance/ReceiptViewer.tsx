import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared';
import {
    ReceiptIcon,
    Download01Icon,
    Share01Icon,
    PrinterIcon,
    CheckCircleIcon,
    CancelIcon,
    CalendarIcon,
    UserIcon,
    Money01Icon
} from '@/hooks/useIcon';
import type { Transaction } from '@/types';

interface ReceiptViewerProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
}

export function ReceiptViewer({
    isOpen,
    onClose,
    transaction,
    onApprove,
    onReject
}: ReceiptViewerProps) {
    if (!transaction) return null;

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
            title="Expense Receipt"
            description="Review financial details and verification documents"
            width="md"
        >
            <div className="space-y-8">
                {/* Status and ID */}
                <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border">
                    <div>
                        <p className="text-micro font-bold text-muted-foreground uppercase tracking-widest mb-1">Transaction ID</p>
                        <p className="text-sm font-mono text-foreground font-bold">{transaction.id}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-micro font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Status</p>
                        <StatusBadge status={transaction.status} />
                    </div>
                </div>

                {/* Amount Hero */}
                <div className="text-center py-6 bg-gradient-to-b from-muted to-transparent rounded-2xl border border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Total Amount</p>
                    <h2 className="text-4xl font-black text-foreground tracking-tight">{formatCurrency(transaction.amount)}</h2>
                    <p className="text-xs text-primary font-bold mt-2 uppercase tracking-tighter italic">Verified Payment</p>
                </div>

                {/* Transaction Metadata */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Details</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 group hover:border-border transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                    <CalendarIcon size={14} />
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">Date</span>
                            </div>
                            <span className="text-xs text-foreground font-bold">{formatDate(transaction.date)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 group hover:border-border transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                    <Money01Icon size={14} />
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">Category</span>
                            </div>
                            <span className="text-xs text-foreground font-bold px-2 py-0.5 rounded bg-muted border border-border uppercase tracking-wider">{transaction.category}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 group hover:border-border transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                    <UserIcon size={14} />
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">Requested By</span>
                            </div>
                            <span className="text-xs text-foreground font-bold">{transaction.requestedBy || 'System Admin'}</span>
                        </div>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-muted/20 border border-border border-dashed">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Description</p>
                        <p className="text-sm text-foreground leading-relaxed font-medium">
                            {transaction.description}
                        </p>
                    </div>
                </div>

                {/* Verification Image Placeholder */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Verification Image</h3>
                        <button className="text-micro font-bold text-primary flex items-center gap-1 hover:underline">
                            <Download01Icon size={10} />
                            Download Attachment
                        </button>
                    </div>
                    <div className="aspect-[4/3] rounded-2xl bg-muted/10 border border-border flex items-center justify-center relative overflow-hidden group shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-end p-4">
                            <p className="text-micro font-bold text-foreground uppercase tracking-widest">Digital Audit Trail ID: FR-90122</p>
                        </div>
                        <div className="text-center p-8">
                            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4 border border-border">
                                <ReceiptIcon size={32} className="text-muted-foreground/30" />
                            </div>
                            <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">Digital Snapshot of Receipt</p>
                            <p className="text-micro text-muted-foreground/30 mt-2 font-medium italic">Handwritten invoice provided by supplier</p>
                        </div>
                    </div>
                </div>

                <div className="flex w-full gap-3 mt-6 pt-6 border-t border-border">
                    {transaction.status === 'pending' ? (
                        <>
                            <Button
                                onClick={() => onReject?.(transaction.id)}
                                variant="outline"
                                className="flex-1 bg-transparent border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 font-bold uppercase tracking-widest text-micro h-10"
                            >
                                <CancelIcon size={14} className="mr-2" />
                                Reject
                            </Button>
                            <Button
                                onClick={() => onApprove?.(transaction.id)}
                                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-micro h-10 shadow-lg shadow-primary/20"
                            >
                                <CheckCircleIcon size={14} className="mr-2" />
                                Approve
                            </Button>
                        </>
                    ) : (
                        <div className="flex w-full gap-2">
                            <Button variant="outline" className="flex-1 bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted font-bold uppercase tracking-widest text-micro h-10">
                                <PrinterIcon size={14} className="mr-2" />
                                Print
                            </Button>
                            <Button variant="outline" className="flex-1 bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted font-bold uppercase tracking-widest text-micro h-10">
                                <Share01Icon size={14} className="mr-2" />
                                Share
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Sheet>
    );
}
