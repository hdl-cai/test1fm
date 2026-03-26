import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MetricCard, DataTablePagination } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/hooks/useIcon';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer
} from 'recharts';

interface DailyLogsTabProps {
    logs: any[];
    cycleId: string;
    orgId: string;
    onLogSaved?: () => void;
}

export function DailyLogsTab({ logs, cycleId, orgId, onLogSaved }: DailyLogsTabProps) {
    const [isAddingLog, setIsAddingLog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const userId = useAuthStore((state) => state.user?.id);
    const [currentPage, setCurrentPage] = useState(1);

    // Controlled form state for the inline log entry form
    const [logForm, setLogForm] = useState({
        mortalityCount: '',
        culledCount: '',
        feedUsedKg: '',
        avgTempC: '',
        avgHumidityPct: '',
    });
    const handleSubmitLog = async () => {
        if (!logForm.feedUsedKg) return; // Feed is the minimum required field
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const today = new Date().toISOString().split('T')[0];
            const { error } = await supabase
                .from('daily_logs')
                .insert({
                    org_id: orgId,
                    cycle_id: cycleId,
                    log_date: today,
                    mortality_count: parseInt(logForm.mortalityCount) || 0,
                    culled_count: parseInt(logForm.culledCount) || 0,
                    feed_used_kg: parseFloat(logForm.feedUsedKg) || 0,
                    avg_temp_c: logForm.avgTempC ? parseFloat(logForm.avgTempC) : null,
                    avg_humidity_pct: logForm.avgHumidityPct ? parseFloat(logForm.avgHumidityPct) : null,
                    submitted_by: userId!,
                    entry_type: 'grower_entry',
                    status: 'submitted',
                });

            if (error) throw error;

            // Reset form and close
            setLogForm({ mortalityCount: '', culledCount: '', feedUsedKg: '', avgTempC: '', avgHumidityPct: '' });
            setIsAddingLog(false);
            onLogSaved?.();
        } catch (err: any) {
            setSubmitError(err.message || 'Failed to save log. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const itemsPerPage = 10;
    const totalPages = Math.ceil(logs.length / itemsPerPage);
    const paginatedLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const avgMortality = logs.length > 0 ? logs.reduce((sum, l) => sum + (l.mortality_count || 0), 0) / logs.length : 0;
    const avgFeed = logs.length > 0 ? logs.reduce((sum, l) => sum + (l.feed_used_kg || 0), 0) / logs.length : 0;
    const avgWeight = logs.length > 0 ? logs.reduce((sum, l) => sum + (l.avg_weight_g || 0), 0) / logs.length : 0;

    // Chart Data
    const chartData = [...logs].reverse().map(log => ({
        name: new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mortality: log.mortality_count || 0,
        feed: (log.feed_used_kg || 0) / 10, // Scaled for visibility
    }));

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Avg Mortality"
                    value={avgMortality.toFixed(1)}
                    subtitle="Typical daily loss"
                    icon="ActivityIcon"
                    iconColor="hsl(var(--danger))"
                    trend={{ value: '-2.4%', direction: 'down', label: 'vs objective' }}
                />
                <MetricCard
                    title="Daily Feed Intake"
                    value={`${avgFeed.toFixed(0)} kg`}
                    subtitle="Avg consumption/day"
                    icon="DatabaseIcon"
                    iconColor="hsl(var(--primary))"
                />
                <MetricCard
                    title="Avg Daily Gain"
                    value={`${avgWeight.toFixed(0)}g`}
                    subtitle="Weight increment/bird"
                    icon="ActivityIcon"
                    iconColor="hsl(var(--warning))"
                />
                <MetricCard
                    title="Log Compliance"
                    value="100%"
                    subtitle="Submission rate"
                    variant="gauge"
                    gaugeValue={100}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth & Intake Chart */}
                <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 relative overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Performance Dynamics</h3>
                            <p className="text-lg font-bold text-foreground">Mortality vs. Feed Intake</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-danger opacity-60" />
                                <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest">Mortality</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary opacity-60" />
                                <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest">Feed Intake</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorMortality" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--danger))" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="hsl(var(--danger))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorFeed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--popover)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        color: 'var(--popover-foreground)'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="mortality" stroke="hsl(var(--danger))" fillOpacity={1} fill="url(#colorMortality)" strokeWidth={2} />
                                <Area type="monotone" dataKey="feed" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorFeed)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                </div>

                {/* Submissions Stats */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="mb-6 text-center lg:text-left">
                        <h3 className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Entry Status</h3>
                        {isAddingLog ? (
                            <p className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Icon name="PlusIcon" size={18} className="text-primary" />
                                New Log Entry
                            </p>
                        ) : (
                            <p className="text-lg font-bold text-foreground">Log Management</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        {!isAddingLog ? (
                            <>
                                <Button
                                    onClick={() => setIsAddingLog(true)}
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-[0_4px_12px_rgba(var(--primary-rgb),0.2)] group"
                                >
                                    <Icon name="PlusIcon" size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                                    Record Today's Log
                                </Button>
                                <Button variant="outline" className="w-full h-12 border-border/50 bg-muted/20 hover:bg-muted text-muted-foreground font-bold rounded-xl">
                                    <Icon name="DownloadIcon" size={18} className="mr-2" />
                                    Export Journal
                                </Button>
                            </>
                        ) : (
                            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                                {submitError && (
                                    <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                                        {submitError}
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <div className="relative group">
                                        <Input
                                            type="number"
                                            placeholder="Mortality Count"
                                            value={logForm.mortalityCount}
                                            onChange={(e) => setLogForm({ ...logForm, mortalityCount: e.target.value })}
                                            className="h-11 bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl"
                                            min="0"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            type="number"
                                            placeholder="Culled Count"
                                            value={logForm.culledCount}
                                            onChange={(e) => setLogForm({ ...logForm, culledCount: e.target.value })}
                                            className="h-11 bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl"
                                            min="0"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            type="number"
                                            placeholder="Feed Consumed (kg)"
                                            value={logForm.feedUsedKg}
                                            onChange={(e) => setLogForm({ ...logForm, feedUsedKg: e.target.value })}
                                            className="h-11 bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl"
                                            min="0"
                                            step="any"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative group">
                                            <Input
                                                type="number"
                                                placeholder="Temp (°C)"
                                                value={logForm.avgTempC}
                                                onChange={(e) => setLogForm({ ...logForm, avgTempC: e.target.value })}
                                                className="h-11 bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl"
                                                step="any"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Input
                                                type="number"
                                                placeholder="Humidity (%)"
                                                value={logForm.avgHumidityPct}
                                                onChange={(e) => setLogForm({ ...logForm, avgHumidityPct: e.target.value })}
                                                className="h-11 bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl"
                                                step="any"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={() => { setIsAddingLog(false); setSubmitError(null); }}
                                        variant="outline"
                                        className="flex-1 h-11 font-bold border-border/50 rounded-xl"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmitLog}
                                        disabled={isSubmitting}
                                        className="flex-1 h-11 font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <Icon name="CycleIcon" size={14} className="animate-spin" />
                                                Saving...
                                            </div>
                                        ) : 'Save Log'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest leading-none">Last 7 Days</span>
                                <span className="text-xs font-bold text-success font-data">Perfect Record</span>
                            </div>
                            <div className="flex gap-1.5 h-1.5 grayscale opacity-50">
                                {[1, 1, 1, 1, 1, 1, 1].map((_, i) => (
                                    <div key={i} className="flex-1 bg-primary rounded-full" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Daily Performance Ledger</h3>
                    <div className="h-1px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
                </div>

                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm relative group">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/20">
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest">Journal Date</th>
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-center">Loss/Culls</th>
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right">Feed Intake (kg)</th>
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right">Weight Gain</th>
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-center">Environment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {paginatedLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-muted/30 transition-colors group/row">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-foreground font-bold tracking-tight tabular-nums font-data">
                                                    {new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="text-micro text-muted-foreground font-bold uppercase tracking-widest mt-1 font-data">Log # {log.id.substring(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={cn('font-bold text-sm uppercase tracking-tight tabular-nums font-data', (log.mortality_count || 0) > 10 ? 'text-danger font-semibold' : (log.mortality_count || 0) >= 5 ? 'text-warning' : 'text-success')}>
                                                    {log.mortality_count || 0} Units
                                                </span>
                                                {(log.culled_count || 0) > 0 && <span className="text-micro text-muted-foreground uppercase font-bold tracking-widest mt-1 italic font-data">{log.culled_count} Culls</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right text-foreground font-bold text-sm tabular-nums font-data">{(log.feed_used_kg || 0).toLocaleString()}</td>
                                        <td className="px-6 py-5 text-right font-bold text-primary text-sm tabular-nums font-data">+{log.avg_weight_g || 0}g</td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-4 text-micro font-bold uppercase tracking-widest tabular-nums italic font-data">
                                                <div className="flex items-center gap-1.5 text-amber-500/80">
                                                    <Icon name="TemperatureIcon" size={12} />
                                                    {(log.avg_temp_c || 0).toFixed(1)}°
                                                </div>
                                                <div className="flex items-center gap-1.5 text-blue-500/80">
                                                    <Icon name="DropletIcon" size={12} />
                                                    {(log.avg_humidity_pct || 0)}%
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <DataTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    pageSize={itemsPerPage}
                    totalItems={logs.length}
                    itemName="Daily Log"
                />
            </div>
        </div>
    );
}
