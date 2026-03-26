import * as React from 'react';
import { MetricCard, DataTablePagination, StatusBadge } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Icon } from '@/hooks/useIcon';
import type { HarvestSaleRow } from '@/lib/data-adapters';

interface SalesTabProps {
    records: HarvestSaleRow[];
}

export function SalesTab({ records }: SalesTabProps) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(records.length / itemsPerPage);
    const paginatedRecords = records.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const totalRevenue = records.reduce((sum, r) => sum + (r.gross_revenue || 0), 0);
    const totalBirdsSold = records.reduce((sum, r) => sum + (r.total_head_count || 0), 0);
    const avgPrice = records.length > 0 ? records.reduce((sum, r) => sum + (r.price_per_kg_actual || 0), 0) / records.length : 0;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value={`₱${(totalRevenue / 1000).toFixed(1)}K`}
                    subtitle="Gross sales for batch"
                    icon="TrendingUpIcon"
                    iconColor="hsl(var(--success))"
                />
                <MetricCard
                    title="Birds Sold"
                    value={totalBirdsSold.toLocaleString()}
                    subtitle="Final head count sold"
                    icon="FarmIcon"
                    iconColor="hsl(var(--primary))"
                />
                <MetricCard
                    title="Avg Price/KG"
                    value={`₱${avgPrice.toFixed(2)}`}
                    subtitle="Average sale price"
                    icon="ActivityIcon"
                    iconColor="hsl(var(--warning))"
                />
                <MetricCard
                    title="Payment Status"
                    value="Settled"
                    subtitle="Revenue collection"
                    statusBadge={{ label: 'Settled', type: 'success' }}
                />
            </div>

            {/* Sales Table */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sales Records</h3>
                        <span className="px-2 py-0.5 rounded-[4px] text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase font-data">
                            {records.length} TOTAL
                        </span>
                    </div>
                    <Button variant="outline" size="sm" className="h-9 px-4 font-bold uppercase tracking-widest text-micro bg-card group shadow-sm">
                        <Icon name="Download01Icon" className="mr-2 h-3.5 w-3.5 group-hover:translate-y-[1px] transition-transform" />
                        Export Data
                    </Button>
                </div>

                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm relative group">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/20">
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest">Buyer / Date</th>
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right">Volume</th>
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right">Price/Unit</th>
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-right">Total Amount</th>
                                    <th className="px-6 py-4 text-micro font-bold text-muted-foreground uppercase tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {paginatedRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-muted/30 transition-colors group/row">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-foreground font-bold tabular-nums font-data">{record.buyer_name}</span>
                                                <span className="text-micro text-muted-foreground font-bold uppercase tracking-widest mt-1 italic font-data">
                                                    {new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-foreground font-bold text-sm bg-muted/70 px-2 py-0.5 rounded border border-border/50 tabular-nums font-data">{(record.total_head_count || 0).toLocaleString()} Birds</span>
                                                <span className="text-micro text-muted-foreground mt-1 font-bold uppercase tracking-widest font-data">{(record.total_weight_kg || 0).toLocaleString()} KG Net</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right text-muted-foreground font-bold text-micro tabular-nums lowercase italic font-data">₱{record.price_per_kg_actual.toFixed(2)}/kg</td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="text-foreground font-bold text-sm tabular-nums font-data">₱{(record.gross_revenue || 0).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex justify-center">
                                                <StatusBadge
                                                    status={record.payment_status === 'paid' ? 'success' : 'pending'}
                                                    size="sm"
                                                    label={record.payment_status}
                                                />
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
                    totalItems={records.length}
                    itemName="Sales Record"
                />
            </div>
        </div>
    );
}
