import { useFinanceStore } from '@/stores/useFinanceStore';
import { usePayrollStore } from '@/stores/usePayrollStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { MetricCard } from '@/components/shared';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ActivityIcon, ArrowDown01Icon, ArrowUp01Icon } from '@/hooks/useIcon';
import { Loader2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line,
} from 'recharts';
import { useState, useEffect } from 'react';
import { fetchRevenueVsExpenses, fetchNetProfitPerCycle } from '@/lib/data/analytics';
import type { RevenueExpensesPoint, NetProfitPoint } from '@/lib/data/analytics';
import { CyclePnLTable } from '@/components/finance/CyclePnLTable';
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const TICK_STYLE = { fontSize: 10, fill: 'var(--muted-foreground)' };
const TOOLTIP_STYLE = { backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 };

function formatTooltipCurrency(value: number | string | undefined) {
    return [`₱${Number(value ?? 0).toLocaleString()}`, ''];
}

export function FinanceOverview() {
    const { user } = useAuthStore();
    const { 
        totalIncome, 
        totalExpenses, 
        transactions, 
        isLoading, 
        getExpensesByCategory 
    } = useFinanceStore();
    const { getPendingAdvances } = usePayrollStore();
    
    const [revenueVsExpenses, setRevenueVsExpenses] = useState<RevenueExpensesPoint[]>([]);
    const [netProfitPerCycle, setNetProfitPerCycle] = useState<NetProfitPoint[]>([]);

    useEffect(() => {
      if (!user?.orgId) return;
      void fetchRevenueVsExpenses(user.orgId).then(setRevenueVsExpenses).catch(() => {});
      void fetchNetProfitPerCycle(user.orgId).then(setNetProfitPerCycle).catch(() => {});
    }, [user?.orgId]);

    const netProfit = totalIncome - totalExpenses;
    const expensesByCategory = getExpensesByCategory();
    const recentTransactions = [...transactions].slice(0, 20);
    const pendingAdvances = getPendingAdvances();
    const pendingAdvancesTotal = pendingAdvances.reduce((sum, a) => sum + a.amount, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Stat Card Data
    const statCards = [
        {
            title: "Total Revenue",
            value: formatCurrency(totalIncome),
            subtitle: "Gross income from all sources",
            icon: "Money01Icon" as const,
            iconColor: "#10B981",
            trend: { value: "12.5%", direction: 'up' as const, label: "vs last month" }
        },
        {
            title: "Total Expenses",
            value: formatCurrency(totalExpenses),
            subtitle: "Operating costs and overhead",
            icon: "ArrowDown01Icon" as const,
            iconColor: "#EF4444",
            trend: { value: "5.2%", direction: 'up' as const, label: "vs last month" }
        },
        {
            title: "Net Profit",
            value: formatCurrency(netProfit),
            subtitle: "Total earnings after expenses",
            icon: "ChartIcon" as const,
            iconColor: netProfit >= 0 ? "#10B981" : "#EF4444",
            trend: { value: "18.3%", direction: netProfit >= 0 ? 'up' as const : 'down' as const, label: "Current standing" }
        },
        {
            title: "Pending Advances",
            value: pendingAdvances.length > 0 ? formatCurrency(pendingAdvancesTotal) : "None",
            subtitle: `${pendingAdvances.length} request${pendingAdvances.length !== 1 ? 's' : ''} awaiting review`,
            icon: "CreditCardIcon" as const,
            iconColor: pendingAdvances.length > 0 ? "#F59E0B" : "#6B7280",
            trend: undefined
        }
    ];

    const expensePieData = Object.entries(expensesByCategory).map(([name, value], index) => ({
        name,
        value: value as number,
        color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);

    if (isLoading && transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse font-bold uppercase tracking-widest">Reconciling Accounts...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stat Cards - Ensure distinct separation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {statCards.map((card, idx) => (
                    <MetricCard
                        key={idx}
                        title={card.title}
                        value={card.value}
                        subtitle={card.subtitle}
                        icon={card.icon}
                        iconColor={card.iconColor}
                        trend={card.trend}
                    />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column: Charts */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Revenue vs Expenses — 12-month */}
                    <Card className="bg-card border-border">
                      <CardHeader className="p-6 pb-2">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Revenue vs Expenses</h3>
                        <p className="text-xs text-muted-foreground mt-1">Monthly performance — last 12 months</p>
                      </CardHeader>
                      <CardContent className="p-6 pt-2">
                        {revenueVsExpenses.length === 0 ? (
                          <div className="h-[360px] flex items-center justify-center text-muted-foreground text-sm">No data yet — close a cycle to see trends.</div>
                        ) : (
                          <div className="h-[360px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={revenueVsExpenses}>
                                <defs>
                                  <linearGradient id="finRevGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                                  </linearGradient>
                                  <linearGradient id="finExpGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="month" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                                <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
                                <RechartsTooltip contentStyle={TOOLTIP_STYLE} formatter={formatTooltipCurrency} />
                                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 16, fontSize: 10, textTransform: 'uppercase' }} />
                                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={2} fillOpacity={1} fill="url(#finRevGrad)" name="Revenue" />
                                <Area type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={2} fillOpacity={1} fill="url(#finExpGrad)" name="Expenses" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Monthly P&L Trend */}
                    <Card className="bg-card border-border">
                      <CardHeader className="p-6 pb-2">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Net Profit Trend</h3>
                        <p className="text-xs text-muted-foreground mt-1">Net profit per closed production cycle</p>
                      </CardHeader>
                      <CardContent className="p-6 pt-2">
                        {netProfitPerCycle.length === 0 ? (
                          <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">No closed cycles yet.</div>
                        ) : (
                          <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={netProfitPerCycle}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="cycle_label" tick={TICK_STYLE} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                                <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
                                <RechartsTooltip contentStyle={TOOLTIP_STYLE} formatter={formatTooltipCurrency} />
                                <Line type="monotone" dataKey="net_profit" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} name="Net Profit" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Per-Cycle P&L Table */}
                    <Card className="bg-card border-border">
                      <CardHeader className="p-6 pb-2">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Per-Cycle P&L</h3>
                        <p className="text-xs text-muted-foreground mt-1">Revenue, expenses, and net profit per closed production cycle</p>
                      </CardHeader>
                      <CardContent className="p-6 pt-2">
                        <CyclePnLTable data={netProfitPerCycle} />
                      </CardContent>
                    </Card>

                    {/* Expense Breakdown - Now below Revenue vs Expenses */}
                    <Card className="bg-card border-border flex flex-col">
                        <CardHeader className="p-6 pb-2">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Expense Breakdown</h3>
                        </CardHeader>
                        <CardContent className="p-6 pt-2">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="h-48 w-full md:w-48 shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={expensePieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {expensePieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-popover border border-border rounded-lg p-2 shadow-xl backdrop-blur-md">
                                                                <p className="text-micro font-bold text-foreground uppercase">{payload[0].name}</p>
                                                                <p className="text-[12px] font-bold text-primary">{formatCurrency(payload[0].value as number)}</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                                        {expensePieData.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between group border-b border-border/30 pb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
                                                </div>
                                                <span className="text-xs font-bold text-foreground">{formatCurrency(item.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Recent Activity - Spans full height of the two charts */}
                <Card className="bg-card border-border overflow-hidden lg:h-[calc(100%-0px)] flex flex-col">
                    <CardHeader className="p-6 border-b border-border/50 bg-white/1 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary">
                                <ActivityIcon size={18} />
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Recent Activity</h3>
                            </div>
                            <button className="text-micro font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
                                View All
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full max-h-187.5 lg:max-h-212.5">
                            <div className="divide-y divide-border/30">
                                {recentTransactions.map((tx, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center border border-border bg-muted group-hover:scale-105 transition-transform",
                                                tx.type === 'income' ? "text-green-500" : "text-red-400"
                                            )}>
                                                {tx.type === 'income' ? <ArrowUp01Icon size={18} /> : <ArrowDown01Icon size={18} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{tx.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-micro text-muted-foreground uppercase font-black">{tx.category}</span>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <span className="text-micro text-muted-foreground font-medium">{tx.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
                                            <p className={cn(
                                                "text-sm font-black",
                                                tx.type === 'income' ? "text-green-500" : "text-foreground"
                                            )}>
                                                {tx.type === 'income' ? "+" : "-"}{formatCurrency(tx.amount)}
                                            </p>
                                            <div className="flex items-center justify-end gap-1.5 mt-1">
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    tx.status === 'approved' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                                                )} />
                                                <span className="text-micro text-muted-foreground uppercase font-bold tracking-tighter">{tx.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
