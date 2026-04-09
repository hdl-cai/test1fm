import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAnalyticsStore } from '@/stores/useAnalyticsStore';
import { DesktopOnlyGuard } from '@/components/shared/DesktopOnlyGuard';
import { Icon } from '@/hooks/useIcon';
import { PageTitle } from '@/components/ui/page-title';
import { Tabs, LineTabsList, LineTabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AnalyticsEmptyState } from '@/components/performance/AnalyticsEmptyState';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type TabType = 'production' | 'financial';

const PIE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#6B7280',
];

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'var(--popover-foreground)',
};

const TICK_STYLE = { fill: 'var(--muted-foreground)', fontSize: 10 };

function ChartCard({ title, subtitle, children, className }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('bg-card border border-border rounded-xl shadow-sm p-6', className)}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuthStore();
  const {
    fcrTrend,
    mortalityTrend,
    adgTrend,
    cycleDurationDist,
    revenueVsExpenses,
    netProfitPerCycle,
    costDistribution,
    costPerKgTrend,
    seasonalityMortality,
    inputPerformance,
    isLoading,
    error,
    fetchAllAnalytics,
  } = useAnalyticsStore();

  const [activeTab, setActiveTab] = useState<TabType>('production');

  useEffect(() => {
    if (user?.orgId) {
      fetchAllAnalytics(user.orgId);
    }
  }, [user?.orgId, fetchAllAnalytics]);

  const hasProductionData = fcrTrend.length > 0 || mortalityTrend.length > 0;
  const hasFinancialData = revenueVsExpenses.length > 0 || netProfitPerCycle.length > 0;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  return (
    <DesktopOnlyGuard message="Analytics requires a desktop browser for the best experience viewing charts and reports.">
    <div className="flex-1 p-4 md:p-8">
      <div className="max-w-screen-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <PageTitle>Analytics</PageTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Deep-dive production and financial intelligence across all closed cycles.
          </p>
          {error && (
            <p className="text-xs text-destructive mt-2">Failed to load analytics data: {error}</p>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
          <LineTabsList className="w-fit border-b-0">
            <LineTabsTrigger value="production">
              <Icon name="Analytics01Icon" size={16} />
              Production Analytics
            </LineTabsTrigger>
            <LineTabsTrigger value="financial">
              <Icon name="MoneyIcon" size={16} />
              Financial Analytics
            </LineTabsTrigger>
          </LineTabsList>

          {/* ── Production Analytics ─────────────────────────────────────── */}
          <TabsContent value="production" className="animate-in fade-in slide-in-from-bottom-6 duration-700 mt-6">
            {!hasProductionData ? (
              <AnalyticsEmptyState />
            ) : (
              <div className="space-y-8">
                {/* Row 1: FCR + Mortality trends */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard title="FCR Trend" subtitle="Feed conversion ratio per closed cycle (lower is better)">
                    <div className="h-65">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={fcrTrend}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                          <XAxis dataKey="cycle_label" tick={TICK_STYLE} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} />
                          <Line type="monotone" dataKey="fcr" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} name="FCR" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>

                  <ChartCard title="Mortality Trend" subtitle="Mortality % per closed cycle">
                    <div className="h-65">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mortalityTrend}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                          <XAxis dataKey="cycle_label" tick={TICK_STYLE} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: any) => `${value}%`} />
                          <Line type="monotone" dataKey="mortality_pct" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} name="Mortality %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                </div>

                {/* Row 2: ADG + Cycle Duration */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard title="Average Daily Gain" subtitle="ADG in grams per day per closed cycle">
                    <div className="h-65">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={adgTrend}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                          <XAxis dataKey="cycle_label" tick={TICK_STYLE} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}g`} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: any) => `${value}g`} />
                          <Bar dataKey="adg_g" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="ADG (g/day)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>

                  <ChartCard title="Cycle Duration Distribution" subtitle="Number of cycles by duration range">
                    <div className="h-65">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cycleDurationDist} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                          <XAxis type="number" tick={TICK_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />
                          <YAxis type="category" dataKey="bucket" tick={TICK_STYLE} axisLine={false} tickLine={false} width={72} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} />
                          <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} name="Cycles" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                </div>

                {/* Row 3: Seasonality + Input Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {seasonalityMortality.length > 0 && (
                    <ChartCard title="Seasonality — Mortality" subtitle="Average mortality % by calendar month">
                      <div className="h-65">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={seasonalityMortality}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="month_name" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: any) => `${value}%`} />
                            <Bar dataKey="avg_mortality_pct" fill="hsl(var(--destructive) / 0.7)" radius={[4, 4, 0, 0]} name="Avg Mortality %" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>
                  )}

                  {inputPerformance.length > 0 && (
                    <ChartCard title="Input Performance" subtitle="Average harvest weight by breed (min 3 cycles)">
                      <div className="h-65">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={inputPerformance} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                            <XAxis type="number" tick={TICK_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}kg`} />
                            <YAxis type="category" dataKey="input_value" tick={TICK_STYLE} axisLine={false} tickLine={false} width={80} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: any, name: any) => name === 'FCR' ? Number(value).toFixed(3) : `${value}kg`} />
                            <Bar dataKey="avg_harvest_weight_kg" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} name="Avg Weight (kg)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Financial Analytics ───────────────────────────────────────── */}
          <TabsContent value="financial" className="animate-in fade-in slide-in-from-bottom-6 duration-700 mt-6">
            {!hasFinancialData ? (
              <AnalyticsEmptyState />
            ) : (
              <div className="space-y-8">
                {/* Row 1: Revenue vs Expenses */}
                <ChartCard title="Revenue vs Expenses" subtitle="Last 12 months">
                  <div className="h-75">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueVsExpenses}>
                        <defs>
                          <linearGradient id="analRevGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="analExpGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="month" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                        <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: any) => `₱${Number(value).toLocaleString()}`} />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 16, fontSize: 10, textTransform: 'uppercase' }} />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={2} fillOpacity={1} fill="url(#analRevGrad)" name="Revenue" />
                        <Area type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={2} fillOpacity={1} fill="url(#analExpGrad)" name="Expenses" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                {/* Row 2: Net Profit + Cost Per Kg */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {netProfitPerCycle.length > 0 && (
                    <ChartCard title="Net Profit per Cycle" subtitle="Revenue vs expenses per closed cycle">
                      <div className="h-65">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={netProfitPerCycle}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="cycle_label" tick={TICK_STYLE} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: any) => `₱${Number(value).toLocaleString()}`} />
                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 12, fontSize: 10, textTransform: 'uppercase' }} />
                            <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Revenue" />
                            <Bar dataKey="expenses" fill="hsl(var(--destructive) / 0.7)" radius={[4, 4, 0, 0]} name="Expenses" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>
                  )}

                  {costPerKgTrend.length > 0 && (
                    <ChartCard title="Cost per kg Trend" subtitle="Production cost per kilogram live weight">
                      <div className="h-65">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={costPerKgTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="cycle_label" tick={TICK_STYLE} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v}`} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: any) => `₱${Number(value).toFixed(2)}/kg`} />
                            <Line type="monotone" dataKey="cost_per_kg" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={{ r: 3 }} name="Cost/kg" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>
                  )}
                </div>

                {/* Row 3: Cost Distribution */}
                {costDistribution.length > 0 && (
                  <ChartCard title="Cost Distribution" subtitle="Expense breakdown by category (last 12 months)">
                    <div className="h-75 flex items-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={costDistribution}
                            dataKey="total_amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={110}
                            innerRadius={60}
                            paddingAngle={2}
                          >
                            {costDistribution.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: any) => `₱${Number(value).toLocaleString()}`} />
                          <Legend
                            iconType="circle"
                            wrapperStyle={{ fontSize: 11, textTransform: 'capitalize' }}
                            formatter={(value) => value}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </DesktopOnlyGuard>
  );
}
