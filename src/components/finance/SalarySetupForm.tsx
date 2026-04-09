import { useState, useEffect } from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { TablesInsert } from '@/types/supabase';
import type { PayrollProfileWithEmployee } from '@/lib/data/payroll';
import { UserIcon, Money01Icon, CalendarIcon } from '@/hooks/useIcon';

interface SalarySetupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TablesInsert<'employee_payroll_profiles'>) => Promise<void>;
  orgId: string;
  employees: Array<{ id: string; first_name: string; last_name: string; role: string }>;
  existingProfile?: PayrollProfileWithEmployee | null;
  isSaving?: boolean;
}

export function SalarySetupForm({
  isOpen,
  onClose,
  onSave,
  orgId,
  employees,
  existingProfile,
  isSaving,
}: SalarySetupFormProps) {

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [paySchedule, setPaySchedule] = useState('semi_monthly');
  const [riceAllowance, setRiceAllowance] = useState('');
  const [transportAllowance, setTransportAllowance] = useState('');
  const [otherAllowances, setOtherAllowances] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');
  const [pagibigRate, setPagibigRate] = useState('1_pct');
  const [effectiveDate, setEffectiveDate] = useState('');

  useEffect(() => {
    if (existingProfile) {
      setSelectedEmployee(existingProfile.user_id);
      setBasicSalary(String(existingProfile.monthly_basic_salary));
      setPaySchedule(existingProfile.pay_schedule);
      setRiceAllowance(existingProfile.rice_allowance != null ? String(existingProfile.rice_allowance) : '');
      setTransportAllowance(existingProfile.transport_allowance != null ? String(existingProfile.transport_allowance) : '');
      setOtherAllowances(existingProfile.other_allowances != null ? String(existingProfile.other_allowances) : '');
      setOtherDeductions(existingProfile.other_deductions != null ? String(existingProfile.other_deductions) : '');
      setPagibigRate(existingProfile.pagibig_rate ?? '1_pct');
      setEffectiveDate(existingProfile.effective_date);
    } else {
      setSelectedEmployee('');
      setBasicSalary('');
      setPaySchedule('semi_monthly');
      setRiceAllowance('');
      setTransportAllowance('');
      setOtherAllowances('');
      setOtherDeductions('');
      setPagibigRate('1_pct');
      setEffectiveDate(new Date().toISOString().split('T')[0]);
    }
  }, [existingProfile, isOpen]);

  const handleSubmit = async () => {
    const data: TablesInsert<'employee_payroll_profiles'> = {
      user_id: existingProfile ? existingProfile.user_id : selectedEmployee,
      org_id: orgId,
      monthly_basic_salary: parseFloat(basicSalary),
      pay_schedule: paySchedule,
      rice_allowance: riceAllowance ? parseFloat(riceAllowance) : null,
      transport_allowance: transportAllowance ? parseFloat(transportAllowance) : null,
      other_allowances: otherAllowances ? parseFloat(otherAllowances) : null,
      other_deductions: otherDeductions ? parseFloat(otherDeductions) : null,
      pagibig_rate: pagibigRate,
      effective_date: effectiveDate,
    };
    await onSave(data);
    onClose();
  };

  const emp = existingProfile?.employee;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={existingProfile ? 'Edit Payroll Profile' : 'Set Up Salary'}
      description="Configure employee compensation and deductions"
      width="lg"
    >
      <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <UserIcon size={12} /> Employee
          </Label>
          {emp ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary text-xs font-bold border border-border/50 shrink-0">
                {emp.first_name[0]}{emp.last_name[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{emp.first_name} {emp.last_name}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{emp.role}</p>
              </div>
            </div>
          ) : (
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee} required>
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select employee…" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.first_name} {e.last_name} — {e.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Money01Icon size={12} /> Monthly Basic Salary (PHP)
          </Label>
          <Input
            type="number" min="0" step="0.01" placeholder="e.g. 20000"
            value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)}
            required className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pay Schedule</Label>
          <Select value={paySchedule} onValueChange={setPaySchedule}>
            <SelectTrigger className="w-full h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semi_monthly">Semi-Monthly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Allowances &amp; Deductions (optional)</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Rice Allowance</Label>
              <Input type="number" min="0" placeholder="0" value={riceAllowance} onChange={(e) => setRiceAllowance(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Transport Allowance</Label>
              <Input type="number" min="0" placeholder="0" value={transportAllowance} onChange={(e) => setTransportAllowance(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Other Allowances</Label>
              <Input type="number" min="0" placeholder="0" value={otherAllowances} onChange={(e) => setOtherAllowances(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Other Deductions</Label>
              <Input type="number" min="0" placeholder="0" value={otherDeductions} onChange={(e) => setOtherDeductions(e.target.value)} className="h-9" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pag-IBIG Rate</Label>
          <Select value={pagibigRate} onValueChange={setPagibigRate}>
            <SelectTrigger className="w-full h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1_pct">1%</SelectItem>
              <SelectItem value="2_pct">2% (Voluntary)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <CalendarIcon size={12} /> Effective Date
          </Label>
          <Input
            type="date" value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            required className={cn('h-9')}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit" className="flex-1"
            disabled={isSaving || !basicSalary || !effectiveDate || (!existingProfile && !selectedEmployee)}
          >
            {isSaving ? 'Saving…' : existingProfile ? 'Update Profile' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
