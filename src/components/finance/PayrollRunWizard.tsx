import { useState } from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatPHP } from '@/lib/utils';
import type { PayrollRecordWithEmployee } from '@/lib/data/payroll';
import {
  CalendarIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  ActivityIcon,
  ReceiptIcon,
} from '@/hooks/useIcon';

interface PayrollRunWizardProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  adminId: string;
  onRunPayroll: (orgId: string, periodStart: string, periodEnd: string) => Promise<void>;
  onReleaseRecord: (recordId: string, adminId: string) => Promise<void>;
  draftRecords: PayrollRecordWithEmployee[];
  isRunning?: boolean;
  isSaving?: boolean;
}

const STEPS = ['Select Period', 'Generate', 'Review', 'Done'] as const;
type QuickPeriod = 'first_half' | 'second_half' | 'full_month';

function getQuickPeriod(type: QuickPeriod): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, '0');
  if (type === 'first_half') return { start: `${year}-${pad(month + 1)}-01`, end: `${year}-${pad(month + 1)}-15` };
  if (type === 'second_half') {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return { start: `${year}-${pad(month + 1)}-16`, end: `${year}-${pad(month + 1)}-${lastDay}` };
  }
  const lastDay = new Date(year, month + 1, 0).getDate();
  return { start: `${year}-${pad(month + 1)}-01`, end: `${year}-${pad(month + 1)}-${lastDay}` };
}

export function PayrollRunWizard({
  isOpen, onClose, orgId, adminId, onRunPayroll, onReleaseRecord,
  draftRecords, isRunning, isSaving,
}: PayrollRunWizardProps) {
  const [step, setStep] = useState(0);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const handleGenerate = async () => {
    await onRunPayroll(orgId, periodStart, periodEnd);
    setStep(2);
  };

  const handleReleaseAll = async () => {
    for (const record of draftRecords) await onReleaseRecord(record.id, adminId);
    setStep(3);
  };

  const handleClose = () => { setStep(0); setPeriodStart(''); setPeriodEnd(''); onClose(); };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Sheet isOpen={isOpen} onClose={handleClose} title="Run Payroll" description="Generate and release payroll for your team" width="xl">
      <div className="flex items-center gap-1 mb-8 flex-wrap">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className={cn('flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border shrink-0',
              i < step ? 'bg-primary/20 border-primary text-primary' :
              i === step ? 'bg-primary border-primary text-primary-foreground' :
              'bg-muted border-border text-muted-foreground')}>
              {i < step ? <CheckmarkCircle01Icon size={10} /> : i + 1}
            </div>
            <span className={cn('text-xs font-bold', i === step ? 'text-foreground' : 'text-muted-foreground')}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Quick Select</p>
            <div className="grid grid-cols-3 gap-2">
              {(['first_half', 'second_half', 'full_month'] as QuickPeriod[]).map((type) => {
                const { start, end } = getQuickPeriod(type);
                return (
                  <Button key={type} variant="outline" size="sm" onClick={() => { setPeriodStart(start); setPeriodEnd(end); }} className="text-xs">
                    {type === 'first_half' ? '1st–15th' : type === 'second_half' ? '16th–EOM' : 'Full Month'}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><CalendarIcon size={12} /> Period Start</Label>
              <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><CalendarIcon size={12} /> Period End</Label>
              <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="h-9" />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
            <Button onClick={() => setStep(1)} disabled={!periodStart || !periodEnd} className="flex-1">
              Next <ArrowRight01Icon size={14} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Payroll Summary</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pay Period</span>
              <span className="font-bold text-foreground">{formatDate(periodStart)} – {formatDate(periodEnd)}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">This will calculate gross pay, statutory deductions (SSS, PhilHealth, Pag-IBIG), and cash advance deductions for all employees with active payroll profiles.</p>
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
              <ArrowLeft01Icon size={14} className="mr-2" /> Back
            </Button>
            <Button onClick={handleGenerate} disabled={isRunning} className="flex-1">
              {isRunning ? <><ActivityIcon size={14} className="mr-2 animate-spin" /> Generating…</> : <>Generate Payroll <ArrowRight01Icon size={14} className="ml-2" /></>}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Draft Records ({draftRecords.length})</p>
            <Button size="sm" onClick={handleReleaseAll} disabled={isSaving || draftRecords.length === 0}>
              <CheckmarkCircle01Icon size={14} className="mr-1.5" />{isSaving ? 'Releasing…' : 'Release All'}
            </Button>
          </div>
          {draftRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ReceiptIcon size={32} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No draft records generated</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest">Employee</th>
                    <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-right">Gross</th>
                    <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-right">Deductions</th>
                    <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-right">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {draftRecords.map((rec) => {
                    const totalDed = (rec.sss_employee ?? 0) + (rec.philhealth_employee ?? 0) + (rec.pagibig_employee ?? 0) + (rec.cash_advance_deduction ?? 0) + (rec.other_deductions ?? 0);
                    return (
                      <tr key={rec.id} className="hover:bg-muted/10">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {rec.employee ? `${rec.employee.first_name} ${rec.employee.last_name}` : rec.user_id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatPHP(rec.gross_pay)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-red-400">-{formatPHP(totalDed)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-bold text-green-400">{formatPHP(rec.net_pay)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <CheckmarkCircle01Icon size={32} className="text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Payroll Released!</h3>
          <p className="text-sm text-muted-foreground text-center">All payroll records have been generated and released successfully.</p>
          <Button onClick={handleClose} className="mt-4 px-8">Close</Button>
        </div>
      )}
    </Sheet>
  );
}

