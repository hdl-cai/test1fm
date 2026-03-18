import { StatusBadge } from '@/components/shared';
import type { PayrollRecord } from '@/types';
import { EyeIcon, FilterIcon, CalendarIcon } from '@/hooks/useIcon';
import { Button } from '@/components/ui/button';

interface PayrollRecordTableProps {
    records: PayrollRecord[];
    onViewPayslip: (record: PayrollRecord) => void;
}

export function PayrollRecordTable({ records, onViewPayslip }: PayrollRecordTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Payroll Ledger</h3>
                    <span className="px-2 py-0.5 rounded-[4px] text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase font-data">
                        {records.length} TOTAL
                    </span>
                </div>
                <div className="flex bg-muted/30 rounded-lg p-1 border border-border">
                    <Button variant="ghost" className="flex items-center gap-2 px-3 py-1.5 rounded-md text-micro font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors duration-200 capitalize tracking-wide">
                        <CalendarIcon size={14} />
                        Current Month
                    </Button>
                    <Button variant="ghost" className="flex items-center gap-2 px-3 py-1.5 rounded-md text-micro font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors duration-200 capitalize tracking-wide">
                        <FilterIcon size={14} />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest">Employee</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest">Pay Period</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right">Base Salary</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right">Earnings</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right">Net Pay</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {records.map((record) => {
                                // Since we don't have getPersonById handy, we'll placeholder the name 
                                // if not present in record, but our store should ideally provide it.
                                // Fore now, using ID as fallback.
                                return (
                                    <tr key={record.id} className="hover:bg-row-hover transition-colors group bg-background">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary text-micro font-bold border border-border/50 shadow-inner">
                                                    {record.personId.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-foreground font-bold">Employee {record.personId.substring(0, 4)}</span>
                                                    <span className="text-micro text-muted-foreground font-medium uppercase tracking-tighter">ID: {record.id.substring(0, 8)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground font-medium font-data">
                                            {formatDate(record.periodStart)} - {formatDate(record.periodEnd)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted-foreground font-data">
                                            {formatCurrency(record.baseSalary)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-primary font-bold font-data">+{formatCurrency(record.bonuses)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-foreground tabular-nums font-data">{formatCurrency(record.totalAmount)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center scale-90">
                                                <StatusBadge status={record.status} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onViewPayslip(record)}
                                                    className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground transition-colors transition-transform transition-[width] transition-[height] active:scale-90 border border-border/40 hover:border-border/60"
                                                    title="Details"
                                                >
                                                    <EyeIcon size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
