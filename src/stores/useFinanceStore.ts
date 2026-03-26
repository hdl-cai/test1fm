/**
 * Finance Store
 * Zustand store for financial management
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Transaction, PayrollRecord, CashAdvance } from '@/types';

export interface FinanceState {
  // Data
  transactions: Transaction[];
  payrollRecords: PayrollRecord[];
  cashAdvances: CashAdvance[];
  settlementStatements: any[];
  isLoading: boolean;
  error: string | null;
  
  // Metrics
  totalExpenses: number;
  totalIncome: number;
  pendingAdvancementCount: number;
  
  // Actions
  fetchFinanceData: (orgId: string) => Promise<void>;
  updateAdvanceStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  
  // Selectors
  getExpensesByCategory: () => Record<string, number>;
  getTransactionsByCycle: (cycleId: string) => Transaction[];
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  payrollRecords: [],
  cashAdvances: [],
  settlementStatements: [],
  isLoading: false,
  error: null,
  totalExpenses: 0,
  totalIncome: 0,
  pendingAdvancementCount: 0,

  fetchFinanceData: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Fetch Cycle Expenses
      const { data: expenses, error: expenseError } = await supabase
        .from('cycle_expenses')
        .select(`
          *,
          category:expense_categories(name)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .range(0, 199);

      if (expenseError) throw expenseError;

      // 2. Fetch Payroll Payouts
      const { data: payroll, error: payrollError } = await supabase
        .from('payroll_payouts')
        .select(`
          *,
          user:profiles!payroll_payouts_user_id_fkey(first_name, last_name, role)
        `)
        .eq('org_id', orgId)
        .order('pay_period_end', { ascending: false })
        .range(0, 199);

      if (payrollError) throw payrollError;

      // 3. Fetch Cash Advances
      const { data: advances, error: advanceError } = await supabase
        .from('cash_advance_requests')
        .select(`
          *,
          employee:profiles!cash_advance_requests_employee_id_fkey(first_name, last_name, role)
        `)
        .eq('org_id', orgId)
        .order('request_date', { ascending: false })
        .range(0, 199);

      if (advanceError) throw advanceError;

      // 4. Fetch Harvest Sales (for Income)
      const { data: sales, error: salesError } = await supabase
        .from('harvest_sales')
        .select('net_revenue')
        .eq('org_id', orgId)
        .range(0, 499);

      if (salesError) throw salesError;

      // 5. Fetch Settlement Statements (Grower Payouts)
      const { data: settlements, error: settlementsError } = await supabase
        .from('settlement_statements')
        .select(`
          *,
          grower:profiles!settlement_statements_grower_id_fkey(first_name, last_name)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .range(0, 199);

      if (settlementsError) throw settlementsError;

      // Mapping - Transactions (Expenses)
      const mappedTransactions: Transaction[] = (expenses || []).map(e => ({
        id: e.id,
        type: 'expense',
        category: (e as any).category?.name || 'Operating',
        description: e.description || 'General Expense',
        amount: Number(e.total_paid || 0),
        date: new Date(e.created_at),
        status: (e.status === 'approved' || e.status === 'pending' || e.status === 'rejected' ? e.status : 'pending') as any,
        cycleId: e.cycle_id || undefined
      }));

      // Mapping - Payroll
      const mappedPayroll: PayrollRecord[] = (payroll || []).map(p => ({
        id: p.id,
        personId: p.user_id,
        periodStart: new Date(p.pay_period_start),
        periodEnd: new Date(p.pay_period_end),
        baseSalary: Number(p.base_pay || 0),
        bonuses: Number(p.monthly_allowance || 0) + Number(p.other_bonuses || 0),
        deductions: Number(p.total_deductions || 0),
        totalAmount: Number(p.net_payout || 0),
        status: (p.payment_status === 'paid' ? 'paid' : p.payment_status === 'processing' ? 'processing' : 'pending') as any,
        paidDate: p.paid_at ? new Date(p.paid_at) : undefined
      }));

      // Mapping - Cash Advances
      const mappedAdvances: CashAdvance[] = (advances || []).map(a => ({
        id: a.id,
        personId: a.employee_id,
        amount: Number(a.amount || 0),
        requestDate: new Date(a.request_date),
        reason: a.reason || 'General requirement',
        status: (a.status === 'approved' || a.status === 'pending' || a.status === 'rejected' || a.status === 'repaid' ? a.status : 'pending') as any,
      }));

      const totalExp = mappedTransactions.reduce((acc, t) => acc + Math.abs(Number(t.amount || 0)), 0) + 
                       mappedPayroll.reduce((acc, p) => acc + Math.abs(p.totalAmount || 0), 0) +
                       (settlements || []).reduce((acc, s) => acc + Math.abs(Number(s.final_net_payout || 0)), 0);
                       
      const totalInc = (sales || []).reduce((acc, s) => acc + Math.abs(Number(s.net_revenue || 0)), 0);
      const pendingAdv = mappedAdvances.filter(a => a.status === 'pending').length;

      set({ 
        transactions: mappedTransactions,
        payrollRecords: mappedPayroll,
        cashAdvances: mappedAdvances,
        settlementStatements: settlements || [],
        totalExpenses: totalExp,
        totalIncome: totalInc,
        pendingAdvancementCount: pendingAdv,
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateAdvanceStatus: async (id, status) => {
    try {
      const { error } = await supabase
        .from('cash_advance_requests')
        .update({ status, approved_at: status === 'approved' ? new Date().toISOString() : null })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      set(state => ({
        cashAdvances: state.cashAdvances.map(a => a.id === id ? { ...a, status } : a),
        pendingAdvancementCount: status === 'approved' 
            ? state.pendingAdvancementCount - 1 
            : state.pendingAdvancementCount
      }));
    } catch (err: any) {
      console.error('Error updating advance status:', err);
    }
  },

  getExpensesByCategory: () => {
    const expenses = get().transactions.filter(t => t.type === 'expense');
    const records = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    // Add Payroll as an expense category
    const payrollTotal = get().payrollRecords.reduce((acc, p) => acc + Math.abs(p.totalAmount || 0), 0);
    if (payrollTotal > 0) {
      records['Payroll'] = (records['Payroll'] || 0) + payrollTotal;
    }

    // Add Settlements as an expense category
    const settlementsTotal = get().settlementStatements.reduce((acc, s) => acc + Math.abs(Number(s.final_net_payout || 0)), 0);
    if (settlementsTotal > 0) {
      records['Grower Settlements'] = (records['Grower Settlements'] || 0) + settlementsTotal;
    }

    return records;
  },

  getTransactionsByCycle: (cycleId) => {
    return get().transactions.filter(t => t.cycleId === cycleId);
  }
}));
