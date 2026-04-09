import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase';
import { requireOrgId, requireUserId } from './context';
import { toDataLayerError } from './errors';

export type PayrollProfileRow = Tables<'employee_payroll_profiles'>;
export type PayrollRecordRow  = Tables<'payroll_records'>;
export type CashAdvanceRow    = Tables<'cash_advance_requests'>;

export interface PayrollProfileWithEmployee extends PayrollProfileRow {
  employee: { first_name: string; last_name: string; role: string } | null;
}

export interface PayrollRecordWithEmployee extends PayrollRecordRow {
  employee: { first_name: string; last_name: string; role: string } | null;
}

export interface CashAdvanceWithEmployee extends CashAdvanceRow {
  employee: { first_name: string; last_name: string; role: string } | null;
}

// ─── Payroll Profiles ────────────────────────────────────────────────────────

export async function fetchPayrollProfiles(orgId: string): Promise<PayrollProfileWithEmployee[]> {
  try {
    const { data, error } = await supabase
      .from('employee_payroll_profiles')
      .select(`
        *,
        employee:profiles!employee_payroll_profiles_user_id_fkey(first_name, last_name, role)
      `)
      .eq('org_id', requireOrgId(orgId))
      .order('effective_date', { ascending: false });

    if (error) throw error;
    return (data || []) as PayrollProfileWithEmployee[];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch payroll profiles.', 'payroll.fetchPayrollProfiles');
  }
}

export async function upsertPayrollProfile(
  input: TablesInsert<'employee_payroll_profiles'>
): Promise<PayrollProfileRow> {
  try {
    const { data, error } = await supabase
      .from('employee_payroll_profiles')
      .upsert(input, { onConflict: 'user_id,org_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to save payroll profile.', 'payroll.upsertPayrollProfile');
  }
}

// ─── Payroll Records ─────────────────────────────────────────────────────────

export async function fetchPayrollRecords(orgId: string): Promise<PayrollRecordWithEmployee[]> {
  try {
    const { data, error } = await supabase
      .from('payroll_records')
      .select(`
        *,
        employee:profiles!payroll_records_user_id_fkey(first_name, last_name, role)
      `)
      .eq('org_id', requireOrgId(orgId))
      .order('pay_period_end', { ascending: false })
      .range(0, 199);

    if (error) throw error;
    return (data || []) as PayrollRecordWithEmployee[];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch payroll records.', 'payroll.fetchPayrollRecords');
  }
}

export async function runPayroll(
  orgId: string,
  periodStart: string,
  periodEnd: string
): Promise<PayrollRecordRow[]> {
  try {
    const { data, error } = await supabase.rpc('run_payroll', {
      p_org_id: requireOrgId(orgId),
      p_pay_period_start: periodStart,
      p_pay_period_end: periodEnd,
    });

    if (error) throw error;
    return (data || []) as PayrollRecordRow[];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to run payroll.', 'payroll.runPayroll');
  }
}

export async function releasePayroll(
  recordId: string,
  adminId: string
): Promise<PayrollRecordRow> {
  try {
    const { data, error } = await supabase.rpc('release_payroll', {
      p_payroll_record_id: recordId,
      p_admin_id: requireUserId(adminId),
    });

    if (error) throw error;
    return data as PayrollRecordRow;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to release payroll.', 'payroll.releasePayroll');
  }
}

// ─── Cash Advances (v2) ──────────────────────────────────────────────────────

export async function fetchCashAdvancesV2(orgId: string): Promise<CashAdvanceWithEmployee[]> {
  try {
    const { data, error } = await supabase
      .from('cash_advance_requests')
      .select(`
        *,
        employee:profiles!cash_advance_requests_employee_id_fkey(first_name, last_name, role)
      `)
      .eq('org_id', requireOrgId(orgId))
      .is('deleted_at', null)
      .order('request_date', { ascending: false })
      .range(0, 299);

    if (error) throw error;
    return (data || []) as CashAdvanceWithEmployee[];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch cash advances.', 'payroll.fetchCashAdvancesV2');
  }
}

export async function fetchMyCashAdvances(userId: string, orgId: string): Promise<CashAdvanceRow[]> {
  try {
    const { data, error } = await supabase
      .from('cash_advance_requests')
      .select('*')
      .eq('employee_id', requireUserId(userId))
      .eq('org_id', requireOrgId(orgId))
      .is('deleted_at', null)
      .order('request_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch your cash advances.', 'payroll.fetchMyCashAdvances');
  }
}

export async function submitCashAdvance(input: {
  orgId: string;
  userId: string;
  amount: number;
  reason: string;
  requestDate: string;
}): Promise<CashAdvanceRow> {
  try {
    const insert: TablesInsert<'cash_advance_requests'> = {
      org_id: requireOrgId(input.orgId),
      employee_id: requireUserId(input.userId),
      amount: input.amount,
      reason: input.reason,
      request_date: input.requestDate,
      requester_type: 'employee',
      status: 'pending',
    };

    const { data, error } = await supabase
      .from('cash_advance_requests')
      .insert(insert)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to submit cash advance.', 'payroll.submitCashAdvance');
  }
}

export async function reviewCashAdvance(input: {
  id: string;
  status: 'approved' | 'rejected';
  reviewNote?: string;
  reviewedBy: string;
}): Promise<void> {
  try {
    const update: TablesUpdate<'cash_advance_requests'> = {
      status: input.status,
      review_note: input.reviewNote ?? null,
      reviewed_at: new Date().toISOString(),
      approved_by: input.reviewedBy,
      approved_at: input.status === 'approved' ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from('cash_advance_requests')
      .update(update)
      .eq('id', input.id);

    if (error) throw error;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to review cash advance.', 'payroll.reviewCashAdvance');
  }
}

// ─── Statutory contribution tables ───────────────────────────────────────────

export async function fetchSSSTable(): Promise<Tables<'sss_contribution_table'>[]> {
  const { data, error } = await supabase
    .from('sss_contribution_table')
    .select('*')
    .eq('is_current', true)
    .order('salary_bracket_min', { ascending: true });
  if (error) throw toDataLayerError(error, 'Failed to fetch SSS table.', 'payroll.fetchSSSTable');
  return data || [];
}

export async function fetchPhilHealthTable(): Promise<Tables<'philhealth_contribution_table'>[]> {
  const { data, error } = await supabase
    .from('philhealth_contribution_table')
    .select('*')
    .eq('is_current', true)
    .order('effective_date', { ascending: false })
    .limit(1);
  if (error) throw toDataLayerError(error, 'Failed to fetch PhilHealth table.', 'payroll.fetchPhilHealthTable');
  return data || [];
}

export async function fetchPagIBIGTable(): Promise<Tables<'pagibig_contribution_table'>[]> {
  const { data, error } = await supabase
    .from('pagibig_contribution_table')
    .select('*')
    .eq('is_current', true)
    .order('effective_date', { ascending: false })
    .limit(1);
  if (error) throw toDataLayerError(error, 'Failed to fetch Pag-IBIG table.', 'payroll.fetchPagIBIGTable');
  return data || [];
}
