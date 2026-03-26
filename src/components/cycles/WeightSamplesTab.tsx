/**
 * Weight Samples Tab
 * 
 * Displays weight progression data extracted from daily logs.
 * Shows a weight growth chart and a data table of weight entries.
 */

import * as React from 'react';
import { TableHeader } from '@/components/ui/table-header';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard, DataTablePagination } from '@/components/shared';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DailyLog {
  id: string;
  log_date: string;
  avg_weight_g: number | null;
  feed_used_kg: number;
  mortality_count: number;
  [key: string]: any;
}

interface WeightSamplesTabProps {
  logs: DailyLog[];
}

export function WeightSamplesTab({ logs }: WeightSamplesTabProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  // Filter logs that have weight data and sort by date
  const weightEntries = React.useMemo(() => {
    return logs
      .filter((log) => log.avg_weight_g != null && log.avg_weight_g > 0)
      .sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime());
  }, [logs]);

  // Chart data
  const chartData = React.useMemo(() => {
    return weightEntries.map((entry, index) => ({
      day: index + 1,
      date: new Date(entry.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: entry.avg_weight_g!,
      // Daily weight gain
      gain: index > 0 && weightEntries[index - 1].avg_weight_g
        ? entry.avg_weight_g! - weightEntries[index - 1].avg_weight_g!
        : 0,
    }));
  }, [weightEntries]);

  // Stats
  const stats = React.useMemo(() => {
    if (weightEntries.length === 0) {
      return { latest: 0, initial: 0, totalGain: 0, avgDailyGain: 0 };
    }
    const initial = weightEntries[0].avg_weight_g || 0;
    const latest = weightEntries[weightEntries.length - 1].avg_weight_g || 0;
    const totalGain = latest - initial;
    const daySpan = weightEntries.length > 1 ? weightEntries.length - 1 : 1;
    const avgDailyGain = totalGain / daySpan;
    return { latest, initial, totalGain, avgDailyGain };
  }, [weightEntries]);

  // Pagination
  const totalPages = Math.ceil(weightEntries.length / itemsPerPage);
  const paginatedEntries = [...weightEntries]
    .reverse() // Most recent first in table
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (weightEntries.length === 0) {
    return (
      <EmptyState
        icon="Analytics01Icon"
        title="No Weight Samples"
        description="Weight samples will appear here once daily logs with weight data are recorded."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Latest Weight"
          value={`${stats.latest.toLocaleString()}g`}
          icon="Analytics01Icon"
          iconColor="var(--primary)"
          trend={{ value: stats.avgDailyGain > 0 ? Math.round(stats.avgDailyGain) : 0, direction: stats.avgDailyGain > 0 ? 'up' : 'down', label: 'g/day avg gain' }}
        />
        <MetricCard
          title="Initial Weight"
          value={`${stats.initial.toLocaleString()}g`}
          icon="ChartIcon"
          iconColor="var(--muted-foreground)"
        />
        <MetricCard
          title="Total Weight Gain"
          value={`${stats.totalGain > 0 ? '+' : ''}${stats.totalGain.toLocaleString()}g`}
          icon="ArrowUp01Icon"
          iconColor="var(--success)"
        />
        <MetricCard
          title="Samples Recorded"
          value={weightEntries.length}
          icon="CalendarIcon"
          iconColor="var(--info)"
        />
      </div>

      {/* Weight Growth Chart */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Weight Growth Curve</h3>
            <p className="text-micro text-muted-foreground mt-1">Average body weight progression over the cycle</p>
          </div>
          <div className="flex items-center gap-4 text-micro font-bold uppercase tracking-widest">
            <div className="flex items-center text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-primary mr-2"></span>
              Avg Weight (g)
            </div>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}kg` : `${value}g`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  color: 'var(--foreground)',
                }}
                formatter={(value: any) => [`${Number(value).toLocaleString()}g`, 'Avg Weight']}
                cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
              />
              {stats.latest >= 1000 && (
                <ReferenceLine
                  y={1000}
                  stroke="var(--warning)"
                  strokeDasharray="8 4"
                  label={{ value: '1kg', position: 'right', fill: 'var(--warning)', fontSize: 10, fontWeight: 700 }}
                />
              )}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                name="Avg Weight"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sample Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Weight Log</h3>
          <span className="px-2 py-0.5 rounded-[4px] text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase">
            {weightEntries.length} ENTRIES
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <TableHeader className="px-6 py-4 text-left">Date</TableHeader>
                  <TableHeader className="px-6 py-4 text-right">Avg Weight (g)</TableHeader>
                  <TableHeader className="px-6 py-4 text-right">Daily Gain (g)</TableHeader>
                  <TableHeader className="px-6 py-4 text-right">Feed Used (kg)</TableHeader>
                  <TableHeader className="px-6 py-4 text-right">Mortality</TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedEntries.map((entry) => {
                  // Find the entry's index in the original sorted array to compute gain
                  const sortedIdx = weightEntries.findIndex((e) => e.id === entry.id);
                  const prevWeight = sortedIdx > 0 ? weightEntries[sortedIdx - 1].avg_weight_g || 0 : null;
                  const gain = prevWeight !== null ? (entry.avg_weight_g || 0) - prevWeight : null;

                  return (
                    <tr key={entry.id} className="hover:bg-row-hover transition-colors bg-background">
                      <td className="px-6 py-4 text-sm font-bold text-foreground">
                        {new Date(entry.log_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-bold text-foreground">
                        {(entry.avg_weight_g || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-bold">
                        {gain !== null ? (
                          <span className={gain >= 0 ? 'text-success' : 'text-danger'}>
                            {gain >= 0 ? '+' : ''}{gain.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-muted-foreground font-medium">
                        {entry.feed_used_kg?.toLocaleString() || '—'}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-muted-foreground font-medium">
                        {entry.mortality_count > 0 ? (
                          <span className="text-danger font-bold">{entry.mortality_count}</span>
                        ) : (
                          '0'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={itemsPerPage}
          totalItems={weightEntries.length}
          itemName="Weight Samples"
        />
      </div>
    </div>
  );
}
