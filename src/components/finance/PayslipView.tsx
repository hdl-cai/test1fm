import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import { cn, formatPHP } from '@/lib/utils';
import type { PayrollRecordWithEmployee } from '@/lib/data/payroll';
import { Download01Icon, ReceiptIcon, UserIcon } from '@/hooks/useIcon';

interface PayslipViewProps {
  isOpen: boolean;
  onClose: () => void;
  record: PayrollRecordWithEmployee | null;
  orgName?: string;
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'draft': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'released': return 'bg-green-500/10 text-green-400 border-green-500/30';
    default: return 'bg-muted/50 text-muted-foreground border-border/50';
  }
}

function formatPdfCurrency(amount: number) {
  return `PHP ${amount.toFixed(2)}`;
}

function sanitizeFilename(value: string) {
  return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function downloadPayslipPdf(record: PayrollRecordWithEmployee, orgName?: string) {
  const employeeName = record.employee
    ? `${record.employee.first_name} ${record.employee.last_name}`
    : record.user_id;
  const role = record.employee?.role ?? '';
  const periodStart = new Date(record.pay_period_start).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  const periodEnd = new Date(record.pay_period_end).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  const deductions: [string, number][] = (
    [
      ['SSS (Employee)', record.sss_employee],
      ['PhilHealth (Employee)', record.philhealth_employee],
      ['Pag-IBIG (Employee)', record.pagibig_employee],
      ['Cash Advance Deduction', record.cash_advance_deduction],
      ['Other Deductions', record.other_deductions],
    ] as [string, number | null][]
  ).filter(([, v]) => v != null && v > 0) as [string, number][];

  const totalDed = deductions.reduce((sum, [, v]) => sum + v, 0);

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const left = 48;
  const right = 547;
  let y = 52;

  const drawRow = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(10);
    doc.text(label, left, y);
    doc.text(value, right, y, { align: 'right' });
    y += 18;
  };

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(107, 114, 128);
  doc.text(orgName ?? 'Organization', 297.5, y, { align: 'center' });
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text('PAYSLIP', 297.5, y, { align: 'center' });
  y += 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(record.status.toUpperCase(), 297.5, y, { align: 'center' });
  y += 18;

  doc.setDrawColor(17, 24, 39);
  doc.line(left, y, right, y);
  y += 26;

  drawRow('Employee', employeeName, true);
  drawRow('Position', role || '—');
  drawRow('Pay Period', `${periodStart} - ${periodEnd}`);
  y += 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Earnings', left, y);
  y += 18;
  drawRow('Gross Pay', formatPdfCurrency(record.gross_pay), true);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Deductions', left, y);
  y += 18;

  deductions.forEach(([label, value]) => {
    drawRow(label, `- ${formatPdfCurrency(value)}`);
  });
  drawRow('Total Deductions', `- ${formatPdfCurrency(totalDed)}`, true);
  y += 14;

  doc.setDrawColor(17, 24, 39);
  doc.line(left, y, right, y);
  y += 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Net Pay', left, y);
  doc.setFontSize(20);
  doc.text(formatPdfCurrency(record.net_pay), right, y, { align: 'right' });
  y += 30;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Employer contributions: SSS ${formatPdfCurrency(record.sss_employer ?? 0)}, PhilHealth ${formatPdfCurrency(record.philhealth_employer ?? 0)}, Pag-IBIG ${formatPdfCurrency(record.pagibig_employer ?? 0)}.`,
    left,
    y,
    { maxWidth: right - left }
  );

  const filename = `${sanitizeFilename(employeeName)}-${record.pay_period_end}-payslip.pdf`;
  doc.save(filename);
}

export function PayslipView({ isOpen, onClose, record, orgName }: PayslipViewProps) {
  if (!record) return null;

  const employeeName = record.employee
    ? `${record.employee.first_name} ${record.employee.last_name}`
    : record.user_id;
  const periodStart = new Date(record.pay_period_start).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  const periodEnd = new Date(record.pay_period_end).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  const deductions = [
    { label: 'SSS (Employee)', value: record.sss_employee },
    { label: 'PhilHealth (Employee)', value: record.philhealth_employee },
    { label: 'Pag-IBIG (Employee)', value: record.pagibig_employee },
    { label: 'Cash Advance', value: record.cash_advance_deduction },
    { label: 'Other Deductions', value: record.other_deductions },
  ].filter((d) => d.value != null && d.value > 0);

  const totalDeductions = deductions.reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Payslip" description="Employee pay statement" width="lg">
      <div className="space-y-6">
        <div className="text-center p-4 bg-muted/20 rounded-xl border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">{orgName ?? 'Organization'}</p>
          <h2 className="text-xl font-black tracking-tight text-foreground mt-1 flex items-center justify-center gap-2">
            <ReceiptIcon size={18} /> PAYSLIP
          </h2>
          <div className="mt-2">
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase border', getStatusBadgeClass(record.status))}>
              {record.status}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <UserIcon size={12} className="text-muted-foreground" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Employee</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 p-3 rounded-lg bg-card border border-border/50">
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{employeeName}</p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border/50">
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-xs font-bold text-foreground mt-0.5 uppercase">{record.employee?.role ?? '—'}</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border/50">
            <p className="text-xs text-muted-foreground">Pay Period</p>
            <p className="text-sm font-bold text-foreground mt-0.5">{periodStart} – {periodEnd}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Earnings</p>
          <div className="flex justify-between items-center p-3 rounded-lg bg-card border border-border/50">
            <span className="text-sm text-foreground">Gross Pay</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{formatPHP(record.gross_pay)}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Deductions</p>
          <div className="space-y-1.5">
            {deductions.map((d) => (
              <div key={d.label} className="flex justify-between items-center py-1.5 px-3 rounded bg-muted/20">
                <span className="text-xs text-muted-foreground">{d.label}</span>
                <span className="text-xs font-medium text-red-400 tabular-nums">-{formatPHP(d.value ?? 0)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-red-500/5 border border-red-500/20 mt-1">
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Total Deductions</span>
              <span className="text-xs font-bold text-red-400 tabular-nums">-{formatPHP(totalDeductions)}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-between">
          <span className="text-sm font-bold text-green-400 uppercase tracking-widest">Net Pay</span>
          <span className="text-2xl font-black text-green-400 tabular-nums">{formatPHP(record.net_pay)}</span>
        </div>

        <p className="text-xs text-muted-foreground/60 px-1 leading-relaxed">
          Employer contributions — SSS: {formatPHP(record.sss_employer ?? 0)}, PhilHealth: {formatPHP(record.philhealth_employer ?? 0)}, Pag-IBIG: {formatPHP(record.pagibig_employer ?? 0)} — for records only, not reflected in net pay.
        </p>

        <div className="flex gap-3 pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
          <Button onClick={() => downloadPayslipPdf(record, orgName)} className="flex-1">
            <Download01Icon size={14} className="mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

