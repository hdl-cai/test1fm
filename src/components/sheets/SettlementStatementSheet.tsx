import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Icon, Download01Icon, CheckCircleIcon, HistoryIcon } from '@/hooks/useIcon';
import { getFarmById } from '@/data/farms';
import type { ProductionCycle } from '@/types';

interface SettlementStatementSheetProps {
    isOpen: boolean;
    onClose: () => void;
    cycle: ProductionCycle;
}

export function SettlementStatementSheet({ isOpen, onClose, cycle }: SettlementStatementSheetProps) {
    const farm = getFarmById(cycle.farmId);
    const [isAuthorizing, setIsAuthorizing] = React.useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-PH').format(num);
    };

    const handleAuthorize = async () => {
        setIsAuthorizing(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsAuthorizing(false);
        onClose();
    };

    // Technical calculations (mocked for UI)
    const aggregateValue = cycle.birdCount * cycle.averageWeight! * 125; // Technical mock
    const deductions = [
        { label: 'Starter Feed B-1', category: 'Feed Inventory', amount: 5400.00 },
        { label: 'Veterinary Care', category: 'Medical / Health', amount: 1250.00 },
        { label: 'Cash Advance #104', category: 'Operations', amount: 3500.00 },
        { label: 'Maintenance Fee', category: 'Farm Service', amount: 669.50 },
    ];
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    const netYield = aggregateValue - totalDeductions;

    return (
        <Sheet
            isOpen={isOpen}
            onClose={onClose}
            title="Payment Summary"
            description={`Final statement for: ${cycle.batchName}`}
            width="xl"
        >
            <div className="space-y-8 pb-10">
                {/* Header Information */}
                <div className="bg-muted/20 border border-border/40 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-micro font-bold text-muted-foreground uppercase tracking-widest">Farm Name</p>
                        <p className="text-sm font-bold text-foreground mt-0.5">{farm?.name || 'Unassigned Farm'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-micro font-bold text-muted-foreground uppercase tracking-widest">Cycle ID</p>
                        <p className="text-sm font-mono font-bold text-primary mt-0.5">{cycle.id.toUpperCase()}</p>
                    </div>
                </div>

                {/* Gross Revenue Summary */}
                <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-micro font-bold text-muted-foreground uppercase tracking-widest mb-4">Earnings Summary</h3>
                        <div className="flex flex-col gap-1">
                            <span className="text-4xl font-bold text-foreground tabular-nums tracking-tight">
                                {formatCurrency(aggregateValue)}
                            </span>
                            <span className="text-caption text-muted-foreground font-medium">Total Production Value</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/40">
                            <div>
                                <p className="text-micro font-bold text-muted-foreground uppercase tracking-widest mb-1 italic">Total Live Weight</p>
                                <p className="text-sm font-bold text-foreground tabular-nums">
                                    {formatNumber(cycle.birdCount * cycle.averageWeight!)} <span className="text-micro text-muted-foreground ml-1">KG</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-micro font-bold text-muted-foreground uppercase tracking-widest mb-1 italic">Sale Price</p>
                                <p className="text-sm font-bold text-foreground tabular-nums">
                                    {formatCurrency(125.00)} <span className="text-micro text-muted-foreground ml-1">/ KG</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Background decoration consistent with redesign */}
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Icon name="Money01Icon" size={120} />
                    </div>
                </div>

                {/* Deduction Records */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Deduction Records</h3>
                        <span className="text-micro font-bold text-muted-foreground uppercase border border-border/40 px-2 py-0.5 rounded italic">Records Verified</span>
                    </div>

                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/20">
                                    <th className="px-4 py-3 text-micro font-bold text-muted-foreground uppercase tracking-widest italic">Description</th>
                                    <th className="px-4 py-3 text-micro font-bold text-muted-foreground uppercase tracking-widest italic">Category</th>
                                    <th className="px-4 py-3 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right italic">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {deductions.map((d, i) => (
                                    <tr key={i} className="hover:bg-row-hover transition-colors group">
                                        <td className="px-4 py-3 text-sm font-bold text-foreground">{d.label}</td>
                                        <td className="px-4 py-3 text-micro font-bold text-muted-foreground uppercase tracking-widest">{d.category}</td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-rose-500 tabular-nums">
                                            -{formatCurrency(d.amount)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-muted/10 border-t border-border">
                                    <td colSpan={2} className="px-4 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest">Total Deductions</td>
                                    <td className="px-4 py-4 text-right text-sm font-bold text-rose-500 tabular-nums italic">
                                        -{formatCurrency(totalDeductions)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Calculated Net Yield Component */}
                <div className="bg-success/5 border border-success/20 rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:bg-success/10 transition-colors transition-[width]">
                    <div className="absolute top-0 left-0 w-1 h-full bg-success" />

                    <h3 className="text-micro font-bold text-success uppercase tracking-widest mb-2">Final Net Payout</h3>
                    <div className="text-4xl font-black text-foreground tabular-nums tracking-tighter mb-6 group-hover:scale-110 transition-transform">
                        {formatCurrency(netYield)}
                    </div>

                    {/* Timeline Tracker */}
                    <div className="w-full flex justify-between items-center max-w-xs mt-4">
                        <div className="flex flex-col items-center gap-2 group/step">
                            <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white border-2 border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                                <CheckCircleIcon size={14} />
                            </div>
                            <span className="text-micro font-bold text-muted-foreground uppercase tracking-tight">Calculated</span>
                        </div>
                        <div className="flex-1 h-[2px] bg-success/30 mx-2 -mt-6" />
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white border-2 border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                                <CheckCircleIcon size={14} />
                            </div>
                            <span className="text-micro font-bold text-muted-foreground uppercase tracking-tight">Verified</span>
                        </div>
                        <div className="flex-1 h-[2px] bg-muted mx-2 -mt-6" />
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted border-2 border-border flex items-center justify-center text-muted-foreground">
                                <HistoryIcon size={12} className="animate-pulse" />
                            </div>
                            <span className="text-micro font-bold text-muted-foreground uppercase tracking-tight italic">Pending</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 text-micro font-bold text-muted-foreground uppercase tracking-widest h-12 hover:bg-muted/30"
                    >
                        Close
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 h-12 text-micro font-bold uppercase tracking-widest border-border/40 hover:border-primary/60 hover:text-primary transition-colors transition-transform transition-[height] active:scale-95"
                    >
                        <Download01Icon size={16} className="mr-2" />
                        Download Report
                    </Button>
                    <Button
                        onClick={handleAuthorize}
                        disabled={isAuthorizing}
                        className="flex-[2] h-12 bg-success hover:bg-success-dark text-white text-micro font-bold uppercase tracking-widest rounded-xl transition-colors transition-transform transition-opacity transition-shadow transition-[width] transition-[height] shadow-lg shadow-success/20 active:scale-95 disabled:opacity-50"
                    >
                        {isAuthorizing ? (
                            <span className="flex items-center gap-2">
                                <HistoryIcon size={16} className="animate-spin" />
                                Processing…
                            </span>
                        ) : (
                            "Confirm & Issue Statement"
                        )}
                    </Button>
                </div>
            </div>
        </Sheet>
    );
}

export default SettlementStatementSheet;
