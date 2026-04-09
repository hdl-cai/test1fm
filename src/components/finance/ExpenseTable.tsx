import * as React from 'react';
import { StatusBadge, DataTablePagination } from '@/components/shared';
import { EyeIcon, FilterIcon, CalendarIcon, CycleIcon } from '@/hooks/useIcon';
import type { Transaction } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ExpenseTableProps {
    expenses: Transaction[];
    onReview: (expense: Transaction) => void;
    onStartAudit?: () => void;
}

export function ExpenseTable({ expenses, onReview, onStartAudit }: ExpenseTableProps) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(expenses.length / itemsPerPage);

    const paginatedExpenses = React.useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return expenses.slice(start, start + itemsPerPage);
    }, [expenses, currentPage]);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);
    };

    const getCategoryBorder = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('feed')) return 'border-l-warning';
        if (cat.includes('medicine') || cat.includes('health') || cat.includes('medical')) return 'border-l-info';
        if (cat.includes('utility') || cat.includes('water') || cat.includes('electric')) return 'border-l-muted-foreground';
        if (cat.includes('maintenance')) return 'border-l-info';
        if (cat.includes('equipment')) return 'border-l-info';
        if (cat.includes('transport')) return 'border-l-muted-foreground';
        if (cat.includes('insurance')) return 'border-l-info';
        return 'border-l-border';
    };

    const getCategoryBadge = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('feed')) return 'badge-warning';
        if (cat.includes('medicine') || cat.includes('health') || cat.includes('medical')) return 'badge-info';
        if (cat.includes('utility') || cat.includes('water') || cat.includes('electric')) return 'badge-muted';
        if (cat.includes('maintenance')) return 'badge-info';
        if (cat.includes('equipment')) return 'badge-info';
        if (cat.includes('transport')) return 'badge-muted';
        if (cat.includes('insurance')) return 'badge-info';
        return 'badge-muted';
    };

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Expense Ledger</h3>
                    <span className="px-2 py-0.5 rounded-lg text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase font-data">
                        {expenses.length} TOTAL
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onStartAudit}
                        className="flex items-center gap-2 px-4 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-colors transition-transform transition-shadow transition-[width] transition-[height] active:scale-95 shadow-lg shadow-primary/10 group"
                    >
                        <CycleIcon size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                        Settlement Statement Audit
                    </button>
                    <div className="flex bg-muted/30 rounded-lg p-1 border border-border">
                        <Button variant="ghost" className="flex items-center gap-2 px-3 py-1.5 rounded-md text-micro font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors duration-200 capitalize tracking-wide">
                            <CalendarIcon size={14} />
                            All Time
                        </Button>
                        <Button variant="ghost" className="flex items-center gap-2 px-3 py-1.5 rounded-md text-micro font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors duration-200 capitalize tracking-wide">
                            <FilterIcon size={14} />
                            Filter
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest">Date & ID</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right">Amount</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {paginatedExpenses.map((expense) => (
                                <tr key={expense.id} className={cn(
                                    "hover:bg-row-hover transition-all group bg-background border-l-4",
                                    getCategoryBorder(expense.category)
                                )}>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-foreground font-medium">{formatDate(expense.date)}</span>
                                            <span className="text-micro font-data text-muted-foreground uppercase mt-0.5 tracking-tighter">#{expense.id.split('-')[1]}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-foreground font-bold transition-colors">{expense.description}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "badge",
                                            getCategoryBadge(expense.category)
                                        )}>
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-bold text-foreground tabular-nums font-data">{formatCurrency(expense.amount)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center scale-90">
                                            <StatusBadge status={expense.status} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onReview(expense)}
                                                className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground transition-colors transition-transform transition-[width] transition-[height] active:scale-90 border border-border/40 hover:border-border/60"
                                                title="Review"
                                            >
                                                <EyeIcon size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {expenses.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4 border border-border">
                                                <FilterIcon size={24} />
                                            </div>
                                            <p className="text-sm font-bold text-foreground uppercase tracking-widest">No records found</p>
                                            <p className="text-xs text-muted-foreground mt-1">Adjust filters or date range</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={itemsPerPage}
                totalItems={expenses.length}
                itemName="Transactions"
            />
        </div >
    );
}
