/**
 * Dashboard Page
 * 
 * Main dashboard view with:
 * - Welcome header with user greeting
 * - Stat cards (Total Live Population, Global Mortality Rate, Projected Revenue)
 * - Performance Trends chart (Mortality % vs FCR)
 * - Critical Alerts section
 * - Pending Approvals section
 * - Daily Flock Summary table
 */

import { useMemo, useState } from 'react';
import { ApprovalCard, MetricChart, MetricCard, StatusBadge, DataTablePagination } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { PageTitle } from '@/components/ui/page-title';
import { TableHeader } from '@/components/ui/table-header';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDashboardData } from '@/hooks/useDashboardData';
import { cn, formatPHP } from '@/lib/utils';
import { Icon } from '@/hooks/useIcon';
import { Loader2 } from 'lucide-react';

// ============================================================================
// Mock Data for Dashboard
// ============================================================================


// generatePerformanceData removed - using useDashboardData chartData

// ============================================================================
// Helper Functions
// ============================================================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}



// ============================================================================
// Dashboard Component
// ============================================================================

export function Dashboard() {
  const { user } = useAuthStore();
  const { stats, chartData, pendingApprovals, flockSummary, isLoading } = useDashboardData();
  const [chartPeriod, setChartPeriod] = useState('30d');

  // Handle approval actions
  const handleApprove = (id: string) => {
    console.log('Approved:', id);
    // In real app, this would update the store/API
  };

  const handleReject = (id: string) => {
    console.log('Rejected:', id);
    // In real app, this would update the store/API
  };

  // Dashboard states
  const [summaryPage, setSummaryPage] = useState(1);
  const [summarySearch, setSummarySearch] = useState('');
  const itemsPerPage = 10;

  // Filtered daily summary data
  const filteredSummary = useMemo(() => {
    if (!summarySearch) return flockSummary;

    const query = summarySearch.toLowerCase();
    return flockSummary.filter(item =>
      item.farmName.toLowerCase().includes(query) ||
      item.batchName.toLowerCase().includes(query) ||
      item.growerName.toLowerCase().includes(query)
    );
  }, [flockSummary, summarySearch]);

  // Paginated daily summary
  const paginatedSummary = useMemo(() => {
    const start = (summaryPage - 1) * itemsPerPage;
    return filteredSummary.slice(start, start + itemsPerPage);
  }, [filteredSummary, summaryPage]);

  const totalSummaryPages = Math.ceil(filteredSummary.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="border-l-4 border-warning pl-4">
          <PageTitle>
            {getGreeting()}, {user?.name || 'User'}
          </PageTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time overview of your poultry operations across all farms.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-9 px-3">
              <Icon name="EggIcon" size={14} className="mr-1.5" />
              <span className="font-data">{formatNumber(stats.totalBirds)} Birds</span>
            </Badge>
            <Badge variant="default" className="h-9 px-3 bg-success text-white">
              <Icon name="ActivityIcon" size={14} className="mr-1.5" />
              {stats.activeCyclesCount} Active Cycles
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Live Population"
          value={formatNumber(stats.totalBirds)}
          subtitle={`Across ${stats.activeCyclesCount} active cycles`}
          icon="EggIcon"
          iconColor="var(--warning)"
          trend={{
            value: "2.3%",
            direction: 'up',
            label: 'vs last month',
          }}
        />
        <MetricCard
          title="Global Mortality"
          value={`${stats.avgMortality.toFixed(2)}%`}
          subtitle={`Average across ${stats.activeCyclesCount} active batches`}
          icon="ActivityIcon"
          iconColor="var(--danger)"
          trend={{
            value: "0.15%",
            direction: 'down',
            label: 'vs target (1.0%)',
          }}
        />
        <MetricCard
          title="Average FCR"
          value={stats.avgFCR.toFixed(2)}
          subtitle="Feed Conversion Ratio"
          icon="TrendingUpIcon"
          iconColor="var(--success)"
          trend={{
            value: "0.02",
            direction: 'down',
            label: 'vs prev month',
          }}
        />
        <MetricCard
          title="Projected Revenue"
          value={formatPHP(stats.totalBirds * 1.8 * 100)}
          subtitle="Based on current active cycles"
          icon="MoneyIcon"
          iconColor="var(--primary)"
          trend={{
            value: "8.5%",
            direction: 'up',
            label: 'vs last period',
          }}
        />
      </div>

      {/* Row 1: Performance Trends + Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="min-w-0 lg:col-span-8">
          <MetricChart
            title="Performance Trends"
            subtitle="Mortality % vs Feed Conversion Ratio (FCR)"
            data={chartData as any}
            series={[
              { key: 'mortality', name: 'Mortality %', color: 'var(--danger)', unit: '%' },
              { key: 'fcr', name: 'FCR', color: 'var(--success)', unit: '' },
            ]}
            periods={[
              { label: '24h', value: '24h' },
              { label: '7d', value: '7d' },
              { label: '30d', value: '30d' },
            ]}
            activePeriod={chartPeriod}
            onPeriodChange={setChartPeriod}
          />
        </div>
        <div className="lg:col-span-4">
          <ApprovalCard
            approvals={pendingApprovals}
            onApprove={handleApprove}
            onReject={handleReject}
            className="h-full max-h-[464px]"
          />
        </div>
      </div>

      {/* Row 2: Daily Flock Summary */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-micro font-bold text-muted-foreground uppercase tracking-widest leading-none">Daily Flock Summary</h3>
            <span className="px-1.5 py-0.5 rounded-md text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wider uppercase">
              {filteredSummary.length} TOTAL
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Icon name="SearchIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search batches..."
                value={summarySearch}
                onChange={(e) => setSummarySearch(e.target.value)}
                className="pl-9 w-64 bg-muted/30 border border-border text-foreground placeholder-muted-foreground/50 focus:border-primary focus:ring-0 text-xs rounded-lg h-9 outline-none transition-colors transition-[width] transition-[height]"
              />
            </div>
            <div className="flex bg-muted/30 rounded-lg p-1 border border-border">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-micro font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors duration-200 capitalize tracking-wide">
                <Icon name="FilterIcon" size={14} />
                Filter
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm light:shadow-[var(--card-shadow)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                  <TableHeader className="px-6 py-4 text-left">Farm Name</TableHeader>
                  <TableHeader className="px-6 py-4 text-left">Batch</TableHeader>
                  <TableHeader className="px-6 py-4 text-left">Grower</TableHeader>
                  <TableHeader className="px-6 py-4 text-right">Total Birds</TableHeader>
                  <TableHeader className="px-6 py-4 text-right">Mortality</TableHeader>
                  <TableHeader className="px-6 py-4 text-right">FCR</TableHeader>
                  <TableHeader className="px-6 py-4 text-center">Status</TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedSummary.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-row-hover transition-colors transition-[width] group bg-background"
                  >
                    <td className="px-6 py-4 text-xs text-muted-foreground font-medium">{row.farmName}</td>
                    <td className="px-6 py-4 text-xs font-bold text-foreground uppercase tracking-tight">{row.batchName}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">{row.growerName}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground text-right font-bold tabular-nums font-data">{formatNumber(row.birdCount)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn("text-xs font-bold tabular-nums font-data", row.mortalityRate > 1.0 ? 'text-danger' : 'text-success')}>
                        {row.mortalityRate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground text-right font-bold tabular-nums font-data">{row.fcr.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <StatusBadge status={row.status as any} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {paginatedSummary.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Icon name="EggIcon" size={40} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm font-bold">No data to display</p>
              <p className="text-xs mt-1">Refine your filters or search query</p>
            </div>
          )}
        </div>

        <DataTablePagination
          currentPage={summaryPage}
          totalPages={totalSummaryPages}
          onPageChange={setSummaryPage}
          pageSize={itemsPerPage}
          totalItems={filteredSummary.length}
          itemName="Batches"
        />
      </div>


    </div>
  );
}

export default Dashboard;
