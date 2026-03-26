/**
 * Finance Page
 * 
 * Main page for financial management. Displays:
 * - Overview: Summary cards, recent transactions
 * - Expenses: Expense table with categories
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { Tabs, LineTabsList, LineTabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SettlementStatementSheet } from '@/components/sheets';
import { FinanceOverview } from '@/components/finance/FinanceOverview';
import { ExpenseTable } from '@/components/finance/ExpenseTable';
import { ReceiptViewer } from '@/components/finance/ReceiptViewer';
// V2: PayrollStats, PayrollRecordTable, CashAdvanceTable, CashAdvanceReviewSheet quarantined
import {
  ArrowDown01Icon,
  Download01Icon,
  DashboardIcon,
} from '@/hooks/useIcon';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatPHP } from '@/lib/utils';
import { useCyclesStore } from '@/stores/useCyclesStore';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Loader2, AlertCircle } from 'lucide-react';
import type { Transaction } from '@/types';

type TabType = 'overview' | 'expenses';



// Main Finance Page Component
export default function Finance() {
  const { user } = useAuthStore();
  const { fetchCycles, cycles } = useCyclesStore();
  const { 
    transactions, 
    isLoading, 
    error, 
    fetchFinanceData,
    totalIncome,
  } = useFinanceStore();

  const [activeTab, setActiveTab] = React.useState<TabType>('overview');
  const [selectedExpense, setSelectedExpense] = React.useState<Transaction | null>(null);
  const [isReceiptViewerOpen, setIsReceiptViewerOpen] = React.useState(false);
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
                {formatPHP(totalIncome)}
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
          {/* V2: Payroll and Cash Advance tabs quarantined */}
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

        {/* V2: Payroll and CashAdvance TabsContent quarantined */}
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

      {/* V2: ReviewPayslipSheet and CashAdvanceReviewSheet quarantined */}

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
