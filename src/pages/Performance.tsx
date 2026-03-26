import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePerformanceStore } from '@/stores/usePerformanceStore';
import { Icon } from '@/hooks/useIcon';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { Tabs, LineTabsList, LineTabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  // V2: BonusCalculator, GrowerTable, FinancialTrendChart, TopGrowers, GrowerStats quarantined
  CostDistributionChart,
  KPIGrid,
  ProductionCharts,
} from '@/components/performance';
import { formatPHP } from '@/lib/utils';

type TabType = 'economics' | 'production';

export default function Performance() {
  const { user } = useAuthStore();
  const { stats, isLoading, fetchPerformanceData, financialHistory } = usePerformanceStore();
  const [activeTab, setActiveTab] = useState<TabType>('production');

  const totalProfit = useMemo(() => {
    return financialHistory.reduce((sum, h) => sum + h.profit, 0);
  }, [financialHistory]);

  useEffect(() => {
    if (user?.orgId) {
      fetchPerformanceData(user.orgId);
    }
  }, [user?.orgId, fetchPerformanceData]);



  // Dynamic Header Content based on active tab
  const headerData = useMemo(() => {
    switch (activeTab) {
      case 'production':
        return {
          title: "Performance",
          description: "FCR trends, mortality rates, and efficiency metrics."
        };
      case 'economics':
      default:
        return {
          title: "Financials",
          description: "Profit margins, cost breakdowns, and ROI analysis."
        };
    }
  }, [activeTab]);

  if (isLoading && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 relative">
      <div className="max-w-screen-2xl mx-auto space-y-8 relative z-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <PageTitle>{headerData.title}</PageTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {headerData.description}
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="active:scale-95">
              <Icon name="Download01Icon" className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Tab Navigation - Line Style */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
          <LineTabsList className="w-fit border-b-0">
            <LineTabsTrigger value="production">
              <Icon name="Analytics01Icon" size={16} />
              Production Analytics
            </LineTabsTrigger>
            <LineTabsTrigger value="economics">
              <Icon name="Money01Icon" size={16} />
              Financials
            </LineTabsTrigger>
            {/* V2: Grower Performance tab quarantined */}
          </LineTabsList>

          {/* Tab Content */}
          <TabsContent value="production" className="animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both min-h-[500px] mt-6">
            <div className="space-y-10">
              <KPIGrid stats={stats} />
              <ProductionCharts />
            </div>
          </TabsContent>

          {/* V2: Grower tab quarantined (TopGrowers, GrowerStats, GrowerTable, BonusCalculator) */}

          <TabsContent value="economics" className="animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both min-h-[500px] mt-6">
            {/* Economic tab still uses some local logic/data but wired to main state where possible */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-card border border-border rounded-xl">
                      <h4 className="text-micro font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Profit</h4>
                      <div className="text-2xl font-black text-foreground">{formatPHP(totalProfit)}</div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-success text-[10px] font-bold">Live</span>
                        <span className="text-muted-foreground text-[10px]">Lifetime net payout</span>
                      </div>
                  </div>
                  <div className="p-6 bg-card border border-border rounded-xl">
                      <h4 className="text-micro font-bold text-muted-foreground uppercase tracking-widest mb-2">Overall Performance</h4>
                      <div className="text-2xl font-black text-foreground">{stats?.epef.toFixed(0) || '0'}</div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-primary text-[10px] font-bold">Top 5%</span>
                        <span className="text-muted-foreground text-[10px]">Efficiency Rank</span>
                      </div>
                  </div>
                </div>
                {/* V2: FinancialTrendChart quarantined */}
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-xs font-bold uppercase tracking-widest">Financial Trend Analysis</p>
                  <p className="text-micro mt-1">Coming in v2</p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <CostDistributionChart />
                </div>
                <div className="p-8 border border-primary/20 bg-primary/5 rounded-xl relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Icon name="Alert01Icon" size={20} />
                    </div>
                    <h4 className="text-caption font-bold text-primary uppercase tracking-widest">Payment Alerts</h4>
                  </div>
                  <p className="text-micro font-medium text-muted-foreground leading-loose mb-8">
                    3 batches are ready for payment. Estimated profit: <span className="text-primary font-bold text-sm bg-primary/10 px-1 rounded">₱185k</span>.
                  </p>
                  <Button className="w-full h-11 bg-warning hover:bg-warning/90 text-warning-foreground font-black uppercase tracking-[0.2em] text-micro shadow-lg shadow-warning/20 transition-all active:scale-95">
                    Finalize All Payments
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
