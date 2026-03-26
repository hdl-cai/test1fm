import { supabase } from '@/lib/supabase';
import type { CashAdvance, PayrollRecord, Transaction } from '@/types';
import type { CycleExpenseWithCategoryRow } from '@/lib/data-adapters';
import type { Tables } from '@/types/supabase';
import { requireOrgId } from './context';
import { toDataLayerError } from './errors';

export type SettlementStatementSummary = Pick<Tables<'settlement_statements'>, 'id' | 'final_net_payout'>;

export interface FinanceData {
  transactions: Transaction[];
  payrollRecords: PayrollRecord[];
  cashAdvances: CashAdvance[];
  settlementStatements: SettlementStatementSummary[];
  totalExpenses: number;
  totalIncome: number;
  pendingAdvancementCount: number;
}

export async function fetchFinanceData(orgId: string): Promise<FinanceData> {
  try {
    const resolvedOrgId = requireOrgId(orgId);
    const [
      { data: expenses, error: expenseError },
      { data: payroll, error: payrollError },
      { data: advances, error: advanceError },
      { data: sales, error: salesError },
      { data: settlements, error: settlementsError },
    ] = await Promise.all([
      supabase
        .from('cycle_expenses')
        .select(`
          *,
          category:expense_categories(name)
        `)
        .eq('org_id', resolvedOrgId)
        .order('created_at', { ascending: false })
        .range(0, 199),
      supabase
        .from('payroll_payouts')
        .select(`
          *,
          user:profiles!payroll_payouts_user_id_fkey(first_name, last_name, role)
        `)
        .eq('org_id', resolvedOrgId)
        .order('pay_period_end', { ascending: false })
        .range(0, 199),
      supabase
        .from('cash_advance_requests')
        .select(`
          *,
          employee:profiles!cash_advance_requests_employee_id_fkey(first_name, last_name, role)
        `)
        .eq('org_id', resolvedOrgId)
        .order('request_date', { ascending: false })
        .range(0, 199),
      supabase.from('harvest_sales').select('net_revenue').eq('org_id', resolvedOrgId).range(0, 499),
      supabase
        .from('settlement_statements')
        .select(`
          *,
          grower:profiles!settlement_statements_grower_id_fkey(first_name, last_name)
        `)
        .eq('org_id', resolvedOrgId)
        .order('created_at', { ascending: false })
        .range(0, 199),
    ]);

    if (expenseError) throw expenseError;
    if (payrollError) throw payrollError;
    if (advanceError) throw advanceError;
    if (salesError) throw salesError;
    if (settlementsError) throw settlementsError;

    const transactions: Transaction[] = ((expenses || []) as CycleExpenseWithCategoryRow[]).map((expense) => ({
      id: expense.id,
      type: 'expense',
      category: expense.category?.name || 'Operating',
      description: expense.description || 'General Expense',
      amount: Number(expense.total_paid || 0),
      date: new Date(expense.created_at),
      status:
        expense.status === 'approved' || expense.status === 'pending' || expense.status === 'rejected'
          ? expense.status
          : 'pending',
      cycleId: expense.cycle_id || undefined,
    }));

    const payrollRecords: PayrollRecord[] = (payroll || []).map((record) => ({
      id: record.id,
      personId: record.user_id,
      periodStart: new Date(record.pay_period_start),
      periodEnd: new Date(record.pay_period_end),
      baseSalary: Number(record.base_pay || 0),
      bonuses: Number(record.monthly_allowance || 0) + Number(record.other_bonuses || 0),
      deductions: Number(record.total_deductions || 0),
      totalAmount: Number(record.net_payout || 0),
      status: record.payment_status === 'paid' ? 'paid' : record.payment_status === 'processing' ? 'processing' : 'pending',
      paidDate: record.paid_at ? new Date(record.paid_at) : undefined,
    }));

    const cashAdvances: CashAdvance[] = (advances || []).map((advance) => ({
      id: advance.id,
      personId: advance.employee_id,
      amount: Number(advance.amount || 0),
      requestDate: new Date(advance.request_date),
      reason: advance.reason || 'General requirement',
      status:
        advance.status === 'approved' ||
        advance.status === 'pending' ||
        advance.status === 'rejected' ||
        advance.status === 'repaid'
          ? advance.status
          : 'pending',
    }));

    const totalExpenses =
      transactions.reduce((acc, transaction) => acc + Math.abs(Number(transaction.amount || 0)), 0) +
      payrollRecords.reduce((acc, record) => acc + Math.abs(record.totalAmount || 0), 0) +
      (settlements || []).reduce((acc, settlement) => acc + Math.abs(Number(settlement.final_net_payout || 0)), 0);
    const totalIncome = (sales || []).reduce((acc, sale) => acc + Math.abs(Number(sale.net_revenue || 0)), 0);
    const pendingAdvancementCount = cashAdvances.filter((advance) => advance.status === 'pending').length;

    return {
      transactions,
      payrollRecords,
      cashAdvances,
      settlementStatements: ((settlements || []) as SettlementStatementSummary[]),
      totalExpenses,
      totalIncome,
      pendingAdvancementCount,
    };
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch finance data.', 'finance.fetchFinanceData');
  }
}

export async function updateCashAdvanceStatus(input: { id: string; status: 'approved' | 'rejected' }) {
  try {
    const { error } = await supabase
      .from('cash_advance_requests')
      .update({ status: input.status, approved_at: input.status === 'approved' ? new Date().toISOString() : null })
      .eq('id', input.id);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to update cash advance.', 'finance.updateCashAdvanceStatus');
  }
}
