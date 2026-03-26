/**
 * Finance Store
 * Zustand store for financial management
 */

import { create } from 'zustand';
import {
  fetchFinanceData as fetchFinanceDataFromDataLayer,
  type SettlementStatementSummary,
  updateCashAdvanceStatus,
} from '@/lib/data/finance';
import { getErrorMessage } from '@/lib/data/errors';
import type { Transaction, PayrollRecord, CashAdvance } from '@/types';

export interface FinanceState {
  // Data
  transactions: Transaction[];
  payrollRecords: PayrollRecord[];
  cashAdvances: CashAdvance[];
  settlementStatements: SettlementStatementSummary[];
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
      const data = await fetchFinanceDataFromDataLayer(orgId);
      set({ 
        transactions: data.transactions,
        payrollRecords: data.payrollRecords,
        cashAdvances: data.cashAdvances,
        settlementStatements: data.settlementStatements,
        totalExpenses: data.totalExpenses,
        totalIncome: data.totalIncome,
        pendingAdvancementCount: data.pendingAdvancementCount,
        isLoading: false 
      });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to fetch finance data.'), isLoading: false });
    }
  },

  updateAdvanceStatus: async (id, status) => {
    try {
      await updateCashAdvanceStatus({ id, status });
      
      // Update local state
      set(state => ({
        cashAdvances: state.cashAdvances.map(a => a.id === id ? { ...a, status } : a),
        pendingAdvancementCount: status === 'approved' 
            ? state.pendingAdvancementCount - 1 
            : state.pendingAdvancementCount
      }));
    } catch (err) {
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
