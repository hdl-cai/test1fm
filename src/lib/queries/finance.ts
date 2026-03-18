import { supabase } from '@/lib/supabase';

/**
 * Fetch all cycle expenses for an organization
 */
export async function getCycleExpenses(orgId: string) {
  const { data, error } = await supabase
    .from('cycle_expenses')
    .select(`
      *,
      category:expense_categories(name)
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch payroll payouts for an organization
 */
export async function getPayrollPayouts(orgId: string) {
  const { data, error } = await supabase
    .from('payroll_payouts')
    .select(`
      *,
      user:profiles!payroll_payouts_user_id_fkey(first_name, last_name, role)
    `)
    .eq('org_id', orgId)
    .order('pay_period_end', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch cash advance requests for an organization
 */
export async function getCashAdvances(orgId: string) {
  const { data, error } = await supabase
    .from('cash_advance_requests')
    .select(`
      *,
      employee:profiles!cash_advance_requests_employee_id_fkey(first_name, last_name, role)
    `)
    .eq('org_id', orgId)
    .order('request_date', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch harvest sales for an organization (for income)
 */
export async function getHarvestSales(orgId: string) {
  const { data, error } = await supabase
    .from('harvest_sales')
    .select('*')
    .eq('org_id', orgId)
    .order('sale_date', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch settlement statements for an organization
 */
export async function getSettlements(orgId: string) {
  const { data, error } = await supabase
    .from('settlement_statements')
    .select(`
      *,
      grower:profiles!settlement_statements_grower_id_fkey(first_name, last_name)
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
