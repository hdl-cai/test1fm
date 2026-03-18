/**
 * ReviewPayslipSheet Component
 * 
 * Sheet for reviewing employee payslips.
 */

import * as React from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { getPersonById } from '@/data/personnel';
import type { PayrollRecord } from '@/types';

interface ReviewPayslipSheetProps {
  isOpen: boolean;
  onClose: () => void;
  record: PayrollRecord;
}

export function ReviewPayslipSheet({ isOpen, onClose, record }: ReviewPayslipSheetProps) {
  const employee = getPersonById(record.personId);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsDownloading(false);
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Payslip Details"
      description={`Pay period: ${formatDate(record.periodStart)} - ${formatDate(record.periodEnd)}`}
      width="md"
    >
      <div className="space-y-6">
        {/* Employee Info */}
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-amber-500 font-bold text-lg border border-border shadow-inner">
            {employee?.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h4 className="font-bold text-foreground text-lg leading-tight">{employee?.name || 'Unknown Employee'}</h4>
            <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mt-0.5">{employee?.role.replace('_', ' ')}</p>
            <p className="text-micro text-muted-foreground mt-1 font-medium">{employee?.email}</p>
          </div>
        </div>

        {/* Payslip Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-micro font-bold text-muted-foreground uppercase tracking-widest mb-1">Pay Period</p>
            <p className="text-sm font-bold text-foreground">
              {formatDate(record.periodStart)} - {formatDate(record.periodEnd)}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-micro font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</p>
            <span className={cn(
              'inline-flex px-2 py-0.5 rounded text-micro font-bold uppercase tracking-wider',
              record.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                record.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  'bg-primary/10 text-primary border border-primary/20'
            )}>
              {record.status}
            </span>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-muted/20">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Earnings</h4>
          </div>
          <div className="divide-y divide-border/50">
            <div className="flex items-center justify-between p-4 bg-muted/5">
              <span className="text-sm text-muted-foreground font-medium">Base Salary</span>
              <span className="text-sm font-bold text-foreground font-mono">{formatCurrency(record.baseSalary)}</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-muted-foreground font-medium">Bonuses</span>
              <span className="text-sm font-bold text-emerald-500 font-mono">+{formatCurrency(record.bonuses)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-500/5">
              <span className="text-sm font-bold text-foreground">Gross Pay</span>
              <span className="text-sm font-black text-foreground font-mono">
                {formatCurrency(record.baseSalary + record.bonuses)}
              </span>
            </div>
          </div>
        </div>

        {/* Deductions Breakdown */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-muted/20">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Deductions</h4>
          </div>
          <div className="divide-y divide-border/50">
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-muted-foreground font-medium">Tax Deductions</span>
              <span className="text-sm font-bold text-rose-500 font-mono">-{formatCurrency(record.deductions)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-rose-500/5">
              <span className="text-sm font-bold text-foreground">Total Deductions</span>
              <span className="text-sm font-black text-rose-500 font-mono">-{formatCurrency(record.deductions)}</span>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="bg-amber-500/5 rounded-xl border border-amber-500/20 p-6 flex items-center justify-between shadow-inner">
          <div>
            <p className="text-sm font-bold text-amber-500">Net Pay</p>
            <p className="text-micro text-muted-foreground mt-1 uppercase font-bold tracking-tight">Take-home after deductions</p>
          </div>
          <p className="text-3xl font-black text-foreground font-mono transition-colors transition-transform hover:scale-105">{formatCurrency(record.totalAmount)}</p>
        </div>

        {/* Payment Info */}
        {record.paidDate && (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 shadow-sm">
            <Icon name="CheckCircleIcon" size={20} className="text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-foreground">Payment Processed</p>
              <p className="text-xs text-muted-foreground font-medium italic">Paid on {formatDate(record.paidDate)}</p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-xs font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground hover:bg-muted"
          >
            Close
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-micro font-black uppercase tracking-widest rounded-lg transition-colors transition-transform transition-opacity transition-shadow transition-[width] shadow-lg shadow-amber-500/20 disabled:opacity-50 active:scale-95"
          >
            {isDownloading ? (
              <>
                <Icon name="CycleIcon" size={14} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Icon name="DownloadIcon" size={14} className="mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

export default ReviewPayslipSheet;
