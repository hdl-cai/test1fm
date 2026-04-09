import * as React from 'react';
import { usePayrollStore } from '@/stores/usePayrollStore';
import { usePersonnelStore } from '@/stores/usePersonnelStore';
import { Button } from '@/components/ui/button';
import { cn, formatPHP } from '@/lib/utils';
import type { PayrollProfileWithEmployee, PayrollRecordWithEmployee } from '@/lib/data/payroll';
import { SalarySetupForm } from './SalarySetupForm';
import { PayrollRunWizard } from './PayrollRunWizard';
import { PayslipView } from './PayslipView';
import {
  PlusSignIcon,
  Edit01Icon,
  ReceiptIcon,
  ActivityIcon,
  CheckCircleIcon,
  UserIcon,
} from '@/hooks/useIcon';

interface PayrollTabProps {
  orgId: string;
  userId: string;
  userRole: string;
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'draft': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'released': return 'bg-green-500/10 text-green-400 border-green-500/30';
    default: return 'bg-muted/50 text-muted-foreground border-border/50';
  }
}

export function PayrollTab({ orgId, userId, userRole }: PayrollTabProps) {
  const isAdmin = userRole === 'admin' || userRole === 'owner';

  const {
    profiles, records, isSaving, isRunning,
    fetchAll, saveProfile, runPayroll, releaseRecord, getDraftRecords,
  } = usePayrollStore();
  const { personnel, fetchPersonnelData } = usePersonnelStore();

  const [showSalaryForm, setShowSalaryForm] = React.useState(false);
  const [editingProfile, setEditingProfile] = React.useState<PayrollProfileWithEmployee | null>(null);
  const [showWizard, setShowWizard] = React.useState(false);
  const [viewingRecord, setViewingRecord] = React.useState<PayrollRecordWithEmployee | null>(null);

  React.useEffect(() => {
    void fetchAll(orgId);
    void fetchPersonnelData(orgId);
  }, [fetchAll, fetchPersonnelData, orgId]);

  const employees = personnel.map((p) => {
    const parts = p.name.split(' ');
    return { id: p.id, first_name: parts[0] ?? p.name, last_name: parts.slice(1).join(' ') || '', role: p.role as string };
  });

  const draftRecords = getDraftRecords();

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-8 p-1">
      {isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Employee Salary Setup</h3>
              <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-muted/50 text-muted-foreground border border-border/50">{profiles?.length ?? 0}</span>
            </div>
            <Button size="sm" onClick={() => { setEditingProfile(null); setShowSalaryForm(true); }} className="text-xs">
              <PlusSignIcon size={12} className="mr-1.5" /> Add / Edit Profile
            </Button>
          </div>

          {(!profiles || profiles.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-xl">
              <UserIcon size={32} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No payroll profiles set up yet</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest">Employee</th>
                      <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest">Role</th>
                      <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest text-right">Monthly Salary</th>
                      <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest">Schedule</th>
                      <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest text-right">Rice</th>
                      <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest text-right">Transport</th>
                      <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest text-right">Other Allow</th>
                      <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest text-right">Other Ded</th>
                      <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {profiles.map((profile: PayrollProfileWithEmployee) => (
                      <tr key={profile.id} className="hover:bg-muted/10 transition-colors bg-background">
                        <td className="px-5 py-3 font-medium text-foreground">
                          {profile.employee ? `${profile.employee.first_name} ${profile.employee.last_name}` : profile.user_id.slice(0, 8)}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground uppercase tracking-widest">{profile.employee?.role ?? '—'}</td>
                        <td className="px-5 py-3 text-right font-bold tabular-nums">{formatPHP(profile.monthly_basic_salary)}</td>
                        <td className="px-5 py-3 text-muted-foreground capitalize">{profile.pay_schedule.replace('_', '-')}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{profile.rice_allowance != null ? formatPHP(profile.rice_allowance) : '—'}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{profile.transport_allowance != null ? formatPHP(profile.transport_allowance) : '—'}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{profile.other_allowances != null ? formatPHP(profile.other_allowances) : '—'}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{profile.other_deductions != null ? formatPHP(profile.other_deductions) : '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex justify-center">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingProfile(profile); setShowSalaryForm(true); }}
                              className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground border border-border/40">
                              <Edit01Icon size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Payroll History</h3>
            <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-muted/50 text-muted-foreground border border-border/50">{records?.length ?? 0}</span>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={() => setShowWizard(true)} className="text-xs">
              <ActivityIcon size={12} className="mr-1.5" /> Run Payroll
            </Button>
          )}
        </div>

        {(!records || records.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-xl">
            <ReceiptIcon size={32} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No payroll records yet. Run your first payroll.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest">Employee</th>
                    <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest">Pay Period</th>
                    <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest text-right">Gross</th>
                    <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest text-right">Net</th>
                    <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest text-center">Status</th>
                    <th className="px-5 py-3 font-bold text-muted-foreground uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-muted/10 transition-colors bg-background">
                      <td className="px-5 py-3 font-medium text-foreground">
                        {rec.employee ? `${rec.employee.first_name} ${rec.employee.last_name}` : rec.user_id.slice(0, 8)}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatDate(rec.pay_period_start)} – {formatDate(rec.pay_period_end)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{formatPHP(rec.gross_pay)}</td>
                      <td className="px-5 py-3 text-right tabular-nums font-bold text-green-400">{formatPHP(rec.net_pay)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-center">
                          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase border', getStatusBadgeClass(rec.status))}>
                            {rec.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-center items-center gap-1.5">
                          <Button variant="ghost" size="icon" onClick={() => setViewingRecord(rec)}
                            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground border border-border/40" title="View Payslip">
                            <ReceiptIcon size={14} />
                          </Button>
                          {isAdmin && rec.status === 'draft' && (
                            <Button variant="ghost" size="icon" disabled={isSaving}
                              onClick={() => releaseRecord(rec.id, userId)}
                              className="w-8 h-8 rounded-lg text-muted-foreground hover:text-green-400 border border-border/40" title="Release">
                              <CheckCircleIcon size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <SalarySetupForm
        isOpen={showSalaryForm}
        onClose={() => { setShowSalaryForm(false); setEditingProfile(null); }}
        onSave={saveProfile}
        orgId={orgId}
        employees={employees}
        existingProfile={editingProfile}
        isSaving={isSaving}
      />

      <PayrollRunWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        orgId={orgId}
        adminId={userId}
        onRunPayroll={runPayroll}
        onReleaseRecord={(recordId, aId) => releaseRecord(recordId, aId)}
        draftRecords={draftRecords}
        isRunning={isRunning}
        isSaving={isSaving}
      />

      <PayslipView
        isOpen={viewingRecord !== null}
        onClose={() => setViewingRecord(null)}
        record={viewingRecord}
      />
    </div>
  );
}

