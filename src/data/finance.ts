/**
 * Finance Data
 * 
 * 50+ Transactions across expense, income, payroll, and cash advance
 * Realistic poultry farm financial data
 */

import type { Transaction, PayrollRecord, CashAdvance } from '@/types';

export const transactions: Transaction[] = [
  // EXPENSES (30 transactions)
  // Feed Purchases
  {
    id: 'trans-001',
    type: 'expense',
    category: 'Feed',
    amount: 125000,
    date: new Date('2025-12-01'),
    description: 'Starter Feed Purchase - 5,000kg',
    status: 'approved',
    requestedBy: 'person-001',
    approvedBy: 'person-002',
    farmId: 'farm-001',
  },
  {
    id: 'trans-002',
    type: 'expense',
    category: 'Feed',
    amount: 98000,
    date: new Date('2025-12-10'),
    description: 'Grower Feed - 4,000kg',
    status: 'approved',
    requestedBy: 'person-003',
    approvedBy: 'person-001',
    farmId: 'farm-001',
  },
  {
    id: 'trans-003',
    type: 'expense',
    category: 'Feed',
    amount: 89000,
    date: new Date('2026-01-05'),
    description: 'Finisher Feed - 3,500kg',
    status: 'approved',
    requestedBy: 'person-003',
    approvedBy: 'person-001',
    farmId: 'farm-001',
  },
  {
    id: 'trans-004',
    type: 'expense',
    category: 'Feed',
    amount: 76000,
    date: new Date('2026-01-15'),
    description: 'Starter Feed - Cagayan Valley',
    status: 'approved',
    requestedBy: 'person-004',
    approvedBy: 'person-001',
    farmId: 'farm-002',
  },
  {
    id: 'trans-005',
    type: 'expense',
    category: 'Feed',
    amount: 65000,
    date: new Date('2026-01-25'),
    description: 'Grower Feed - Tarlac',
    status: 'approved',
    requestedBy: 'person-006',
    approvedBy: 'person-001',
    farmId: 'farm-003',
  },
  {
    id: 'trans-006',
    type: 'expense',
    category: 'Feed',
    amount: 45000,
    date: new Date('2026-02-01'),
    description: 'Corn Grits - 3,000kg',
    status: 'approved',
    requestedBy: 'person-001',
    approvedBy: 'person-002',
  },
  
  // Medical/Veterinary
  {
    id: 'trans-007',
    type: 'expense',
    category: 'Medical',
    amount: 25000,
    date: new Date('2025-12-05'),
    description: 'Vaccines - Newcastle & Gumboro',
    status: 'approved',
    requestedBy: 'person-008',
    approvedBy: 'person-001',
    farmId: 'farm-001',
  },
  {
    id: 'trans-008',
    type: 'expense',
    category: 'Medical',
    amount: 18000,
    date: new Date('2026-01-08'),
    description: 'Antibiotics and supplements',
    status: 'approved',
    requestedBy: 'person-008',
    approvedBy: 'person-001',
    farmId: 'farm-001',
  },
  {
    id: 'trans-009',
    type: 'expense',
    category: 'Medical',
    amount: 15000,
    date: new Date('2026-01-20'),
    description: 'Vaccination supplies - Cagayan',
    status: 'approved',
    requestedBy: 'person-008',
    approvedBy: 'person-001',
    farmId: 'farm-002',
  },
  {
    id: 'trans-010',
    type: 'expense',
    category: 'Medical',
    amount: 12000,
    date: new Date('2026-01-28'),
    description: 'Vitamins and electrolytes',
    status: 'approved',
    requestedBy: 'person-009',
    approvedBy: 'person-001',
    farmId: 'farm-003',
  },
  
  // Equipment & Maintenance
  {
    id: 'trans-011',
    type: 'expense',
    category: 'Equipment',
    amount: 45000,
    date: new Date('2025-12-15'),
    description: 'Feeding equipment maintenance',
    status: 'approved',
    requestedBy: 'person-010',
    approvedBy: 'person-001',
    farmId: 'farm-001',
  },
  {
    id: 'trans-012',
    type: 'expense',
    category: 'Equipment',
    amount: 32000,
    date: new Date('2026-01-10'),
    description: 'Ventilation system repair',
    status: 'approved',
    requestedBy: 'person-011',
    approvedBy: 'person-001',
    farmId: 'farm-003',
  },
  {
    id: 'trans-013',
    type: 'expense',
    category: 'Equipment',
    amount: 28000,
    date: new Date('2026-01-25'),
    description: 'Sensor replacement - Davao',
    status: 'approved',
    requestedBy: 'person-012',
    approvedBy: 'person-001',
    farmId: 'farm-005',
  },
  {
    id: 'trans-014',
    type: 'expense',
    category: 'Maintenance',
    amount: 15000,
    date: new Date('2025-12-20'),
    description: 'Building repairs - Bukidnon',
    status: 'approved',
    requestedBy: 'person-003',
    approvedBy: 'person-001',
    farmId: 'farm-001',
  },
  
  // Utilities
  {
    id: 'trans-015',
    type: 'expense',
    category: 'Utilities',
    amount: 35000,
    date: new Date('2025-12-30'),
    description: 'Electricity bill - December',
    status: 'approved',
    requestedBy: 'person-001',
    approvedBy: 'person-002',
  },
  {
    id: 'trans-016',
    type: 'expense',
    category: 'Utilities',
    amount: 28000,
    date: new Date('2026-01-30'),
    description: 'Electricity bill - January',
    status: 'approved',
    requestedBy: 'person-001',
    approvedBy: 'person-002',
  },
  {
    id: 'trans-017',
    type: 'expense',
    category: 'Utilities',
    amount: 8000,
    date: new Date('2026-01-15'),
    description: 'Water bill - All farms',
    status: 'approved',
    requestedBy: 'person-001',
    approvedBy: 'person-002',
  },
  
  // Transportation
  {
    id: 'trans-018',
    type: 'expense',
    category: 'Transportation',
    amount: 22000,
    date: new Date('2025-12-18'),
    description: 'Feed delivery transport',
    status: 'approved',
    requestedBy: 'person-001',
    approvedBy: 'person-002',
  },
  {
    id: 'trans-019',
    type: 'expense',
    category: 'Transportation',
    amount: 35000,
    date: new Date('2026-01-20'),
    description: 'Harvest transport - Cagayan',
    status: 'approved',
    requestedBy: 'person-004',
    approvedBy: 'person-001',
    farmId: 'farm-002',
  },
  
  // Other Expenses
  {
    id: 'trans-020',
    type: 'expense',
    category: 'Insurance',
    amount: 50000,
    date: new Date('2026-01-01'),
    description: 'Annual farm insurance premium',
    status: 'approved',
    requestedBy: 'person-001',
    approvedBy: 'person-002',
  },
  {
    id: 'trans-021',
    type: 'expense',
    category: 'Permits',
    amount: 12000,
    date: new Date('2026-01-10'),
    description: 'Business permits renewal',
    status: 'approved',
    requestedBy: 'person-001',
    approvedBy: 'person-002',
  },
  {
    id: 'trans-022',
    type: 'expense',
    category: 'Office',
    amount: 8000,
    date: new Date('2026-01-05'),
    description: 'Office supplies and software',
    status: 'approved',
    requestedBy: 'person-002',
    approvedBy: 'person-001',
  },
  {
    id: 'trans-023',
    type: 'expense',
    category: 'Training',
    amount: 15000,
    date: new Date('2026-01-15'),
    description: 'Staff training program',
    status: 'approved',
    requestedBy: 'person-002',
    approvedBy: 'person-001',
  },
  
  // INCOME (12 transactions)
  {
    id: 'trans-024',
    type: 'income',
    category: 'Sales',
    amount: 450000,
    date: new Date('2025-12-10'),
    description: 'Batch #2024-Prev harvest sale',
    status: 'approved',
    farmId: 'farm-001',
    cycleId: 'cycle-006',
  },
  {
    id: 'trans-025',
    type: 'income',
    category: 'Sales',
    amount: 380000,
    date: new Date('2026-01-05'),
    description: 'Cagayan-Q4-2024 harvest sale',
    status: 'approved',
    farmId: 'farm-002',
    cycleId: 'cycle-007',
  },
  {
    id: 'trans-026',
    type: 'income',
    category: 'Sales',
    amount: 320000,
    date: new Date('2026-01-20'),
    description: 'Tarlac-Q4-2024 harvest sale',
    status: 'approved',
    farmId: 'farm-003',
    cycleId: 'cycle-008',
  },
  {
    id: 'trans-027',
    type: 'income',
    category: 'Sales',
    amount: 150000,
    date: new Date('2026-02-01'),
    description: 'Partial payment - Batch #2024-A',
    status: 'approved',
    farmId: 'farm-001',
    cycleId: 'cycle-001',
  },
  {
    id: 'trans-028',
    type: 'income',
    category: 'By-products',
    amount: 25000,
    date: new Date('2026-01-15'),
    description: 'Manure and feather sales',
    status: 'approved',
  },
  {
    id: 'trans-029',
    type: 'income',
    category: 'Services',
    amount: 35000,
    date: new Date('2025-12-20'),
    description: 'Consulting services rendered',
    status: 'approved',
  },
  
  // PAYROLL (8 transactions)
  {
    id: 'trans-030',
    type: 'payroll',
    category: 'Salary',
    amount: 180000,
    date: new Date('2026-01-31'),
    description: 'January 2026 payroll - All staff',
    status: 'approved',
    requestedBy: 'person-002',
    approvedBy: 'person-001',
  },
  {
    id: 'trans-031',
    type: 'payroll',
    category: 'Bonus',
    amount: 45000,
    date: new Date('2026-01-31'),
    description: 'Performance bonus - Q4 2025',
    status: 'approved',
    requestedBy: 'person-002',
    approvedBy: 'person-001',
  },
  {
    id: 'trans-032',
    type: 'payroll',
    category: 'Salary',
    amount: 175000,
    date: new Date('2025-12-31'),
    description: 'December 2025 payroll',
    status: 'approved',
    requestedBy: 'person-002',
    approvedBy: 'person-001',
  },
  
  // CASH ADVANCES (5 transactions)
  {
    id: 'trans-033',
    type: 'cash_advance',
    category: 'Emergency',
    amount: 10000,
    date: new Date('2026-01-15'),
    description: 'Emergency cash advance - Bob Smith',
    status: 'approved',
    requestedBy: 'person-003',
    approvedBy: 'person-001',
  },
  {
    id: 'trans-034',
    type: 'cash_advance',
    category: 'Medical',
    amount: 15000,
    date: new Date('2026-01-20'),
    description: 'Medical expenses - Maria Santos',
    status: 'approved',
    requestedBy: 'person-004',
    approvedBy: 'person-001',
  },
  {
    id: 'trans-035',
    type: 'cash_advance',
    category: 'Education',
    amount: 8000,
    date: new Date('2026-01-25'),
    description: 'School tuition advance',
    status: 'approved',
    requestedBy: 'person-006',
    approvedBy: 'person-002',
  },
  {
    id: 'trans-036',
    type: 'cash_advance',
    category: 'Emergency',
    amount: 5000,
    date: new Date('2026-02-01'),
    description: 'Emergency cash advance - Pedro',
    status: 'pending',
    requestedBy: 'person-010',
  },
  {
    id: 'trans-037',
    type: 'cash_advance',
    category: 'Medical',
    amount: 12000,
    date: new Date('2026-02-03'),
    description: 'Medical expenses - Ana',
    status: 'pending',
    requestedBy: 'person-006',
  },
  
  // Additional recent transactions
  {
    id: 'trans-038',
    type: 'expense',
    category: 'Feed',
    amount: 95000,
    date: new Date('2026-02-02'),
    description: 'Feed invoice - pending approval',
    status: 'pending',
    requestedBy: 'person-001',
    farmId: 'farm-002',
  },
  {
    id: 'trans-039',
    type: 'expense',
    category: 'Medical',
    amount: 18500,
    date: new Date('2026-02-03'),
    description: 'Vet medication - pending',
    status: 'pending',
    requestedBy: 'person-008',
    farmId: 'farm-001',
  },
];

// Payroll Records Detail
export const payrollRecords: PayrollRecord[] = [
  {
    id: 'payroll-001',
    personId: 'person-001',
    periodStart: new Date('2026-01-01'),
    periodEnd: new Date('2026-01-31'),
    baseSalary: 45000,
    bonuses: 5000,
    deductions: 2500,
    totalAmount: 47500,
    status: 'paid',
    paidDate: new Date('2026-01-31'),
  },
  {
    id: 'payroll-002',
    personId: 'person-002',
    periodStart: new Date('2026-01-01'),
    periodEnd: new Date('2026-01-31'),
    baseSalary: 45000,
    bonuses: 5000,
    deductions: 2500,
    totalAmount: 47500,
    status: 'paid',
    paidDate: new Date('2026-01-31'),
  },
  {
    id: 'payroll-003',
    personId: 'person-003',
    periodStart: new Date('2026-01-01'),
    periodEnd: new Date('2026-01-31'),
    baseSalary: 28000,
    bonuses: 2000,
    deductions: 1500,
    totalAmount: 28500,
    status: 'paid',
    paidDate: new Date('2026-01-31'),
  },
  {
    id: 'payroll-004',
    personId: 'person-004',
    periodStart: new Date('2026-01-01'),
    periodEnd: new Date('2026-01-31'),
    baseSalary: 26000,
    bonuses: 1500,
    deductions: 1300,
    totalAmount: 26200,
    status: 'paid',
    paidDate: new Date('2026-01-31'),
  },
  {
    id: 'payroll-005',
    personId: 'person-005',
    periodStart: new Date('2026-01-01'),
    periodEnd: new Date('2026-01-31'),
    baseSalary: 25000,
    bonuses: 1000,
    deductions: 1250,
    totalAmount: 24750,
    status: 'paid',
    paidDate: new Date('2026-01-31'),
  },
];

// Cash Advances Detail
export const cashAdvances: CashAdvance[] = [
  {
    id: 'advance-001',
    personId: 'person-003',
    amount: 10000,
    requestDate: new Date('2026-01-15'),
    reason: 'Family emergency',
    status: 'repaid',
    approvedBy: 'person-001',
    approvedDate: new Date('2026-01-15'),
  },
  {
    id: 'advance-002',
    personId: 'person-004',
    amount: 15000,
    requestDate: new Date('2026-01-20'),
    reason: 'Medical expenses',
    status: 'approved',
    approvedBy: 'person-001',
    approvedDate: new Date('2026-01-20'),
  },
  {
    id: 'advance-003',
    personId: 'person-006',
    amount: 8000,
    requestDate: new Date('2026-01-25'),
    reason: 'School tuition',
    status: 'approved',
    approvedBy: 'person-002',
    approvedDate: new Date('2026-01-25'),
  },
  {
    id: 'advance-004',
    personId: 'person-010',
    amount: 5000,
    requestDate: new Date('2026-02-01'),
    reason: 'Emergency',
    status: 'pending',
  },
  {
    id: 'advance-005',
    personId: 'person-006',
    amount: 12000,
    requestDate: new Date('2026-02-03'),
    reason: 'Medical expenses',
    status: 'pending',
  },
];

// Helper functions
export function getTransactionById(id: string): Transaction | undefined {
  return transactions.find(t => t.id === id);
}

export function getTransactionsByType(type: Transaction['type']): Transaction[] {
  return transactions.filter(t => t.type === type);
}

export function getTransactionsByStatus(status: Transaction['status']): Transaction[] {
  return transactions.filter(t => t.status === status);
}

export function getTransactionsByCategory(category: string): Transaction[] {
  return transactions.filter(t => t.category === category);
}

export function getTransactionsByFarmId(farmId: string): Transaction[] {
  return transactions.filter(t => t.farmId === farmId);
}

export function getPendingTransactions(): Transaction[] {
  return transactions.filter(t => t.status === 'pending');
}

export function getApprovedTransactions(): Transaction[] {
  return transactions.filter(t => t.status === 'approved');
}

export function getTotalExpenses(): number {
  return transactions
    .filter(t => t.type === 'expense' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalIncome(): number {
  return transactions
    .filter(t => t.type === 'income' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalPayroll(): number {
  return transactions
    .filter(t => t.type === 'payroll' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getNetProfit(): number {
  return getTotalIncome() - getTotalExpenses() - getTotalPayroll();
}

export function getExpensesByCategory(): Record<string, number> {
  const expenses: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense' && t.status === 'approved')
    .forEach(t => {
      expenses[t.category] = (expenses[t.category] || 0) + t.amount;
    });
  return expenses;
}

export function getRecentTransactions(limit: number = 10): Transaction[] {
  return [...transactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}
