import * as React from 'react';
import { HarvestLogSheet } from '@/components/sheets/HarvestLogSheet';
import { MetricCard, DataTablePagination } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Icon } from '@/hooks/useIcon';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { disputeHarvestLogRecord, validateHarvestLogRecord } from '@/lib/data/cycles';
import { useAuthStore } from '@/stores/useAuthStore';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface HarvestTabProps {
    logs: HarvestLogRecord[];
    cycleId: string;
    orgId: string;
    userId?: string;
    userRole?: string;
    onHarvestSaved?: () => void;
}

interface HarvestLogRecord {
    id: string;
    birds_harvested_count: number | null;
    gross_weight_kg: number | null;
    fleet_used: string | null;
    harvest_team_notes: string | null;
    harvest_date_start: string;
    is_validated: boolean | null;
}

export function HarvestTab({ logs, cycleId, orgId, userId, userRole, onHarvestSaved }: HarvestTabProps) {
    const authUserId = useAuthStore((state) => state.user?.id);
    const authUserRole = useAuthStore((state) => state.user?.role);
    const authOrgId = useAuthStore((state) => state.user?.orgId);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isHarvestSheetOpen, setIsHarvestSheetOpen] = React.useState(false);
    const [disputingId, setDisputingId] = React.useState<string | null>(null);
    const [disputeNote, setDisputeNote] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(logs.length / itemsPerPage);
    const paginatedRecords = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const totalHarvested = logs.reduce((sum, r) => sum + (r.birds_harvested_count || 0), 0);
    const totalWeight = logs.reduce((sum, r) => sum + (r.gross_weight_kg || 0), 0);
    const avgWeight = totalHarvested > 0 ? totalWeight / totalHarvested : 0;

    // Reconciliation Data (Aggregated from logs)
    const reconciliationData = [
        { name: 'Harvested', value: totalHarvested, color: '#1DB954' },
    ];

    const resolvedUserId = authUserId ?? userId;
    const resolvedUserRole = authUserRole ?? userRole;
    const resolvedOrgId = authOrgId ?? orgId;
    const canVerify = resolvedUserRole === 'admin' || resolvedUserRole === 'owner' || resolvedUserRole === 'grower';

    const handleValidate = async (recordId: string) => {
        if (!resolvedUserId) return;
        setIsSubmitting(true);
        try {
            await validateHarvestLogRecord({ recordId, userId: resolvedUserId });
            onHarvestSaved?.();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDispute = async (recordId: string) => {
        if (!resolvedUserId) return;
        setIsSubmitting(true);
        try {
            await disputeHarvestLogRecord({ recordId, note: disputeNote });
            setDisputingId(null);
            setDisputeNote('');
            onHarvestSaved?.();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Quick Metrics */}
            <div className="flex items-center justify-between mb-2">
                <div />
                <Button
                    onClick={() => setIsHarvestSheetOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 h-10 px-6 rounded-lg transition-colors group"
                >
                    <Icon name="PlusIcon" size={16} className="mr-2" />
                    Log Harvest
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Final Bird Count"
                    value={totalHarvested.toLocaleString()}
                    subtitle="Final count after harvest"
                    icon="FarmIcon"
                    iconColor="hsl(var(--primary))"
                />
                <MetricCard
                    title="Total Weight"
                    value={`${(totalWeight / 1000).toFixed(1)} MT`}
                    subtitle="Total harvest weight"
                    icon="PackageIcon"
                    iconColor="hsl(var(--warning))"
                />
                <MetricCard
                    title="Average Weight"
                    value={`${avgWeight.toFixed(2)} kg`}
                    subtitle="Average weight per bird"
                    icon="ActivityIcon"
                    iconColor="hsl(var(--primary))"
                    trend={{ value: '+4.2%', direction: 'up', label: 'vs objective' }}
                />
                <MetricCard
                    title="Harvest Rate"
                    value="96.9%"
                    subtitle="Success rate"
                    variant="gauge"
                    gaugeValue={96.9}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Harvest Reconciliation Chart */}
                <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 relative overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Harvest Reconciliation</h3>
                            <p className="text-lg font-bold text-foreground">Flock Balance Sheet</p>
                        </div>
                        <StatusBadge status="audit_passed" size="sm" animate />
                    </div>

                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reconciliationData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 'bold' }}
                                />
                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--popover)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        color: 'var(--popover-foreground)'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                                    {reconciliationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
                        {reconciliationData.map((item, i) => (
                            <div key={i} className="text-center">
                                <p className="text-micro text-muted-foreground font-bold uppercase tracking-widest mb-1">{item.name}</p>
                                <p className="text-xl font-bold text-foreground font-data">{item.value.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                </div>

                {/* Logistics Info Card */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Harvest Logistics</h3>
                        <p className="text-lg font-bold text-foreground">Transport Details</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                                <Icon name="TruckIcon" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Fleet Used</p>
                                <p className="text-sm font-bold text-foreground font-data">{logs[0]?.fleet_used || 'Utility Trucks'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                                <Icon name="UserIcon" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Harvest Team</p>
                                <p className="text-sm font-bold text-foreground font-data">{logs[0]?.harvest_team_notes?.split(' ')[0] || 'In-house Team'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <Icon name="CalendarIcon" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">End Time</p>
                                <p className="text-sm font-bold text-foreground font-data">Finalized</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Records Section */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Harvest Records</h3>
                        <span className="px-2 py-0.5 rounded-[4px] text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase font-data">
                            {logs.length} TOTAL
                        </span>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm relative group">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/20">
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right">Quantity</th>
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right">Avg Weight</th>
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-center">Validated</th>
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest">Remarks</th>
                                    {canVerify && <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-center">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {paginatedRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-muted/30 transition-colors group/row">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-foreground font-bold tabular-nums font-data">
                                                    {new Date(record.harvest_date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="text-micro text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Batch Finalized</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-foreground font-bold text-sm bg-muted/50 px-2 py-0.5 rounded border border-border/50 tabular-nums font-data">{(record.birds_harvested_count || 0).toLocaleString()} Birds</span>
                                                <span className="text-micro text-muted-foreground mt-1 font-bold uppercase tracking-widest italic font-data">{((record.gross_weight_kg || 0) / 1000).toFixed(1)} MT Net</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right text-muted-foreground font-bold text-micro tabular-nums lowercase italic font-data">{((record.gross_weight_kg || 0) / Math.max(1, record.birds_harvested_count || 0)).toFixed(2)} kg</td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex justify-center">
                                                <StatusBadge
                                                    status={record.is_validated ? 'success' : 'pending'}
                                                    size="sm"
                                                    label={record.is_validated ? 'Validated' : 'Pending'}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-muted-foreground text-micro font-bold uppercase tracking-widest italic">{record.harvest_team_notes || 'No notes available'}</td>
                                        {canVerify && (
                                            <td className="px-6 py-5 text-center">
                                                {record.is_validated ? (
                                                    <span className="text-micro text-success font-bold uppercase tracking-widest">✓ Verified</span>
                                                ) : disputingId === record.id ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={disputeNote}
                                                            onChange={(e) => setDisputeNote(e.target.value)}
                                                            placeholder="Dispute reason..."
                                                            className="w-40 h-8 text-xs px-2 border border-border rounded-lg bg-muted/30 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary"
                                                        />
                                                        <div className="flex gap-1">
                                                            <Button size="sm" variant="destructive" className="h-7 text-micro px-2" onClick={() => handleDispute(record.id)} disabled={isSubmitting || !disputeNote.trim()}>Confirm</Button>
                                                            <Button size="sm" variant="ghost" className="h-7 text-micro px-2" onClick={() => { setDisputingId(null); setDisputeNote(''); }}>Cancel</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center gap-1">
                                                        <Button size="sm" className="h-7 text-micro px-3 bg-success hover:bg-success/90 text-white" onClick={() => handleValidate(record.id)} disabled={isSubmitting}>
                                                            <Icon name="CheckmarkCircle01Icon" size={12} className="mr-1" />Verify
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="h-7 text-micro px-3 text-danger border-danger/30 hover:bg-danger/10" onClick={() => setDisputingId(record.id)} disabled={isSubmitting}>
                                                            <Icon name="AlertCircleIcon" size={12} className="mr-1" />Dispute
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
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
                    itemName="Harvest Record"
                />
            </div>
            <HarvestLogSheet
                isOpen={isHarvestSheetOpen}
                onClose={() => setIsHarvestSheetOpen(false)}
                cycleId={cycleId}
                orgId={resolvedOrgId || orgId}
                onSaved={onHarvestSaved}
            />
        </div >
    );
}
