import { create } from 'zustand';
import {
  fetchPayrollProfiles,
  fetchPayrollRecords,
  fetchCashAdvancesV2,
  fetchMyCashAdvances,
  upsertPayrollProfile,
  submitCashAdvance,
  reviewCashAdvance,
  runPayroll,
  releasePayroll,
  type PayrollProfileWithEmployee,
  type PayrollRecordWithEmployee,
  type CashAdvanceWithEmployee,
  type CashAdvanceRow,
} from '@/lib/data/payroll';
import type { TablesInsert } from '@/types/supabase';
import { getErrorMessage } from '@/lib/data/errors';

export interface PayrollState {
  profiles: PayrollProfileWithEmployee[];
  records: PayrollRecordWithEmployee[];
  cashAdvances: CashAdvanceWithEmployee[];
  myCashAdvances: CashAdvanceRow[];

  isLoading: boolean;
  isSaving: boolean;
  isRunning: boolean;
  error: string | null;

  // Actions
  fetchAll: (orgId: string) => Promise<void>;
  fetchMyAdvances: (userId: string, orgId: string) => Promise<void>;
  saveProfile: (input: TablesInsert<'employee_payroll_profiles'>) => Promise<void>;
  runPayroll: (orgId: string, periodStart: string, periodEnd: string) => Promise<void>;
  releaseRecord: (recordId: string, adminId: string) => Promise<void>;
  submitAdvance: (input: { orgId: string; userId: string; amount: number; reason: string; requestDate: string }) => Promise<void>;
  reviewAdvance: (input: { id: string; status: 'approved' | 'rejected'; reviewNote?: string; reviewedBy: string }) => Promise<void>;

  // Selectors
  getPendingAdvances: () => CashAdvanceWithEmployee[];
  getDraftRecords: () => PayrollRecordWithEmployee[];
}

export const usePayrollStore = create<PayrollState>((set, get) => ({
  profiles: [],
  records: [],
  cashAdvances: [],
  myCashAdvances: [],
  isLoading: false,
  isSaving: false,
  isRunning: false,
  error: null,

  fetchAll: async (orgId) => {
    set({ isLoading: true, error: null });
    try {
      const [profiles, records, cashAdvances] = await Promise.all([
        fetchPayrollProfiles(orgId),
        fetchPayrollRecords(orgId),
        fetchCashAdvancesV2(orgId),
      ]);
      set({ profiles, records, cashAdvances, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load payroll data.'), isLoading: false });
    }
  },

  fetchMyAdvances: async (userId, orgId) => {
    try {
      const myCashAdvances = await fetchMyCashAdvances(userId, orgId);
      set({ myCashAdvances });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load your cash advances.') });
    }
  },

  saveProfile: async (input) => {
    set({ isSaving: true, error: null });
    try {
      await upsertPayrollProfile(input);
      // Re-fetch the profiles to get the joined employee data
      if (input.org_id) {
        const profiles = await fetchPayrollProfiles(input.org_id);
        set({ profiles, isSaving: false });
      } else {
        set({ isSaving: false });
      }
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to save payroll profile.'), isSaving: false });
      throw err;
    }
  },

  runPayroll: async (orgId, periodStart, periodEnd) => {
    set({ isRunning: true, error: null });
    try {
      await runPayroll(orgId, periodStart, periodEnd);
      // Re-fetch records after run
      const records = await fetchPayrollRecords(orgId);
      set({ records, isRunning: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to run payroll.'), isRunning: false });
      throw err;
    }
  },

  releaseRecord: async (recordId, adminId) => {
    set({ isSaving: true, error: null });
    try {
      await releasePayroll(recordId, adminId);
      // Update local state
      set(state => ({
        records: state.records.map(r =>
          r.id === recordId ? { ...r, status: 'released', released_at: new Date().toISOString() } : r
        ),
        isSaving: false,
      }));
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to release payroll.'), isSaving: false });
      throw err;
    }
  },

  submitAdvance: async (input) => {
    set({ isSaving: true, error: null });
    try {
      const newAdvance = await submitCashAdvance(input);
      set(state => ({
        myCashAdvances: [newAdvance, ...state.myCashAdvances],
        isSaving: false,
      }));
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to submit cash advance.'), isSaving: false });
      throw err;
    }
  },

  reviewAdvance: async (input) => {
    set({ isSaving: true, error: null });
    try {
      await reviewCashAdvance(input);
      set(state => ({
        cashAdvances: state.cashAdvances.map(a =>
          a.id === input.id
            ? { ...a, status: input.status, review_note: input.reviewNote ?? null, reviewed_at: new Date().toISOString() }
            : a
        ),
        isSaving: false,
      }));
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to review cash advance.'), isSaving: false });
      throw err;
    }
  },

  getPendingAdvances: () => get().cashAdvances.filter(a => a.status === 'pending'),
  getDraftRecords: () => get().records.filter(r => r.status === 'draft'),
}));
