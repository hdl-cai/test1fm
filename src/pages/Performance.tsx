import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePerformanceStore } from '@/stores/usePerformanceStore';
import { Icon } from '@/hooks/useIcon';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { Tabs, LineTabsList, LineTabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  BonusCalculator,
  CostDistributionChart,
  FinancialTrendChart,
  GrowerStats,
  GrowerTable,
  KPIGrid,
  ProductionCharts,
  SeasonalityImpactChart,
  InputPerformanceChart,
  TopGrowers,
} from '@/components/performance';
import { GrowerComparisonChart } from '@/components/performance/GrowerComparisonChart';
import { formatPHP } from '@/lib/utils';
import { cn } from '@/lib/utils';

type TabType = 'leaderboard' | 'bonus' | 'analytics';

export default function Performance() {
  const { user } = useAuthStore();
  const { stats, leaderboard, isLoading, fetchPerformanceData, financialHistory } = usePerformanceStore();
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  const totalProfit = useMemo(() => {
    return financialHistory.reduce((sum, h) => sum + h.profit, 0);
  }, [financialHistory]);

  useEffect(() => {
    if (user?.orgId) {
      fetchPerformanceData(user.orgId);
    }
  }, [user?.orgId, fetchPerformanceData]);

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
            <PageTitle>Performance</PageTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Grower leaderboard, bonus calculations, and production analytics.
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="active:scale-95">
              <Icon name="Download01Icon" className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
          <LineTabsList className="w-fit border-b-0">
            <LineTabsTrigger value="leaderboard">
              <Icon name="TrophyIcon" size={16} />
              Leaderboard
            </LineTabsTrigger>
            <LineTabsTrigger value="bonus">
              <Icon name="CalculatorIcon" size={16} />
              Bonus Calculator
            </LineTabsTrigger>
            {isAdmin && (
              <LineTabsTrigger value="analytics">
                <Icon name="Analytics01Icon" size={16} />
                Performance Analytics
              </LineTabsTrigger>
            )}
          </LineTabsList>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both min-h-125 mt-6">
            <div className="space-y-10">
              <GrowerStats stats={stats} />
              <TopGrowers entries={leaderboard} />
              <GrowerTable />
            </div>
          </TabsContent>

          {/* Bonus Calculator Tab */}
          <TabsContent value="bonus" className="animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both min-h-125 mt-6">
            <BonusCalculator growers={leaderboard} />
          </TabsContent>

          {/* Performance Analytics Tab — Admin only */}
          {isAdmin && (
            <TabsContent value="analytics" className="animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both min-h-125 mt-6">
              <div className="space-y-10">
                {/* KPI Summary */}
                <KPIGrid stats={stats} />

                {/* Production trends + cost */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <ProductionCharts />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={cn("p-6 bg-card border border-border rounded-xl")}>
                        <h4 className="text-micro font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Profit (All Time)</h4>
                        <div className="text-2xl font-black text-foreground">{formatPHP(totalProfit)}</div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-success text-[10px] font-bold">Live</span>
                          <span className="text-muted-foreground text-[10px]">Lifetime net payout</span>
                        </div>
                      </div>
                      <div className={cn("p-6 bg-card border border-border rounded-xl")}>
                        <h4 className="text-micro font-bold text-muted-foreground uppercase tracking-widest mb-2">Overall EPEF</h4>
                        <div className="text-2xl font-black text-foreground">{stats?.epef.toFixed(0) || '—'}</div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-primary text-[10px] font-bold">Org Average</span>
                          <span className="text-muted-foreground text-[10px]">All closed cycles</span>
                        </div>
                      </div>
                    </div>

                    <FinancialTrendChart />
                  </div>

                  <div className="space-y-8">
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                      <CostDistributionChart />
                    </div>
                    <SeasonalityImpactChart />
                  </div>
                </div>

                {/* Input Performance + Grower Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <InputPerformanceChart />
                  <GrowerComparisonChart growers={leaderboard} />
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
