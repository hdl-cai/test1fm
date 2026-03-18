/**
 * Finance Page
 * 
 * Main page for financial management. Displays:
 * - Overview: Summary cards, recent transactions
 * - Expenses: Expense table with categories
 * - Payroll: Payroll table, status badges
 * - CashAdvance: Requests table with approve/reject actions
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { Tabs, LineTabsList, LineTabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ReviewPayslipSheet, SettlementStatementSheet } from '@/components/sheets';
import { FinanceOverview } from '@/components/finance/FinanceOverview';
import { ExpenseTable } from '@/components/finance/ExpenseTable';
import { ReceiptViewer } from '@/components/finance/ReceiptViewer';
import { PayrollStats } from '@/components/finance/PayrollStats';
import { PayrollRecordTable } from '@/components/finance/PayrollRecordTable';
import { CashAdvanceTable } from '@/components/finance/CashAdvanceTable';
import { CashAdvanceReviewSheet } from '@/components/finance/CashAdvanceReviewSheet';
import {
  ArrowDown01Icon,
  Money01Icon,
  Download01Icon,
  DashboardIcon,
  UserGroupIcon
} from '@/hooks/useIcon';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCyclesStore } from '@/stores/useCyclesStore';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Loader2, AlertCircle } from 'lucide-react';
import type { Transaction } from '@/types';

type TabType = 'overview' | 'expenses' | 'payroll' | 'cashadvance';



// Main Finance Page Component
export default function Finance() {
  const { user } = useAuthStore();
  const { fetchCycles, cycles } = useCyclesStore();
  const { 
    transactions, 
    payrollRecords, 
    cashAdvances, 
    isLoading, 
    error, 
    fetchFinanceData,
    totalIncome,
    updateAdvanceStatus
  } = useFinanceStore();

  const [activeTab, setActiveTab] = React.useState<TabType>('overview');
  const [selectedPayslip, setSelectedPayslip] = React.useState<any>(null);
  const [isPayslipSheetOpen, setIsPayslipSheetOpen] = React.useState(false);
  const [selectedExpense, setSelectedExpense] = React.useState<Transaction | null>(null);
  const [isReceiptViewerOpen, setIsReceiptViewerOpen] = React.useState(false);
  const [selectedAdvance, setSelectedAdvance] = React.useState<any>(null);
  const [isAdvanceReviewOpen, setIsAdvanceReviewOpen] = React.useState(false);
  const [isAuditSheetOpen, setIsAuditSheetOpen] = React.useState(false);

  React.useEffect(() => {
    if (user?.orgId) {
      fetchFinanceData(user.orgId);
      fetchCycles(user.orgId);
    }
  }, [user?.orgId, fetchFinanceData, fetchCycles]);

  const selectedCycle = cycles.length > 0 ? cycles[cycles.length - 1] : null;

  const expenseTransactions = React.useMemo(() => {
    return [...transactions]
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions]);

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <PageTitle>Finance</PageTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Track expenses, payroll, and cash advance requests.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Date/Period Selector */}

          <div className="flex items-center gap-3">
            <div className="h-10 px-4 border border-border/40 bg-card rounded-xl flex items-center gap-2 text-micro font-bold text-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-muted-foreground uppercase tracking-widest">Liquidity:</span>
              <span className="text-success font-mono">
                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(totalIncome)}
              </span>
            </div>
            <Button variant="outline" className="h-10 px-4 active:scale-95 group">
              <Download01Icon className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              Export Ledger
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Line Style */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
        <LineTabsList className="w-fit border-b-0">
          <LineTabsTrigger value="overview">
            <DashboardIcon size={14} />
            Overview
          </LineTabsTrigger>
          <LineTabsTrigger value="expenses">
            <ArrowDown01Icon size={14} />
            Expenses
          </LineTabsTrigger>
          <LineTabsTrigger value="payroll">
            <UserGroupIcon size={14} />
            Payroll
          </LineTabsTrigger>
          <LineTabsTrigger value="cashadvance">
            <Money01Icon size={14} />
            Cash Advance
          </LineTabsTrigger>
        </LineTabsList>

        {/* Tab Content Section */}
        <TabsContent value="overview" className="animate-in fade-in duration-300 mt-6">
          <FinanceOverview />
        </TabsContent>

        <TabsContent value="expenses" className="animate-in fade-in duration-300 mt-6">
          <ExpenseTable
            expenses={expenseTransactions}
            onReview={(expense) => {
              setSelectedExpense(expense);
              setIsReceiptViewerOpen(true);
            }}
            onStartAudit={() => setIsAuditSheetOpen(true)}
          />
        </TabsContent>

        <TabsContent value="payroll" className="animate-in fade-in duration-300 mt-6">
          <div className="space-y-6">
            <PayrollStats />
            <PayrollRecordTable
              records={payrollRecords}
              onViewPayslip={(record) => {
                setSelectedPayslip(record);
                setIsPayslipSheetOpen(true);
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="cashadvance" className="animate-in fade-in duration-300 mt-6">
          <CashAdvanceTable
            advances={cashAdvances}
            onReview={(advance) => {
              setSelectedAdvance(advance);
              setIsAdvanceReviewOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {isLoading && (
         <div className="fixed inset-0 bg-background/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-bold animate-pulse">Reconciling Ledger...</p>
            </div>
         </div>
      )}

      {error && (
          <div className="bg-danger/5 border border-danger/20 rounded-2xl p-4 mb-8 flex items-center gap-3">
              <AlertCircle className="text-danger" size={20} />
              <p className="text-xs text-danger font-medium">{error}</p>
          </div>
      )}

      {selectedPayslip && (
        <ReviewPayslipSheet
          isOpen={isPayslipSheetOpen}
          onClose={() => setIsPayslipSheetOpen(false)}
          record={selectedPayslip}
        />
      )}

      {selectedExpense && (
        <ReceiptViewer
          isOpen={isReceiptViewerOpen}
          onClose={() => setIsReceiptViewerOpen(false)}
          transaction={selectedExpense}
          onApprove={(id) => {
            console.log('Approved:', id);
            setIsReceiptViewerOpen(false);
          }}
          onReject={(id) => {
            console.log('Rejected:', id);
            setIsReceiptViewerOpen(false);
          }}
        />
      )}
      {selectedAdvance && (
        <CashAdvanceReviewSheet
          isOpen={isAdvanceReviewOpen}
          onClose={() => setIsAdvanceReviewOpen(false)}
          advance={selectedAdvance}
          onApprove={(id) => {
            updateAdvanceStatus(id, 'approved');
            setIsAdvanceReviewOpen(false);
          }}
          onReject={(id) => {
            updateAdvanceStatus(id, 'rejected');
            setIsAdvanceReviewOpen(false);
          }}
        />
      )}

      {selectedCycle && (
        <SettlementStatementSheet
          isOpen={isAuditSheetOpen}
          onClose={() => setIsAuditSheetOpen(false)}
          cycle={selectedCycle}
        />
      )}
    </div>
  );
}
