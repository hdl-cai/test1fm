import * as React from 'react';
import { cn } from '@/lib/utils';
import { MetricCard, DataTablePagination } from '@/components/shared';
import { Icon } from '@/hooks/useIcon';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { HealthRecordWithVeterinarianRow, VaccinationScheduleRow } from '@/lib/data-adapters';

interface HealthTabProps {
    healthRecords?: HealthRecordWithVeterinarianRow[];
    vaccinationSchedules?: VaccinationScheduleRow[];
}

export function HealthTab({ healthRecords = [], vaccinationSchedules = [] }: HealthTabProps) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(healthRecords.length / itemsPerPage);
    const paginatedRecords = healthRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatRecordTypeLabel = (recordType: string) =>
        recordType
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    const getVeterinarianName = (record: HealthRecordWithVeterinarianRow) => {
        const firstName = record.veterinarian?.first_name?.trim() || '';
        const lastName = record.veterinarian?.last_name?.trim() || '';
        const fullName = `${firstName} ${lastName}`.trim();

        return fullName || 'System';
    };

    // Filter vaccinations
    const completedVaccinations = vaccinationSchedules.filter(v => v.status === 'completed');
    const upcomingVaccinations = vaccinationSchedules.filter(v => v.status === 'scheduled');

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Vaccination Status"
                    value={`${completedVaccinations.length}/${vaccinationSchedules.length}`}
                    subtitle="Doses administered"
                    icon="ActivityIcon"
                    iconColor="hsl(var(--primary))"
                    statusBadge={{ label: upcomingVaccinations.length > 0 ? 'Upcoming' : 'Fully Vaccinated', type: upcomingVaccinations.length > 0 ? 'warning' : 'success' }}
                />
                <MetricCard
                    title="Health Incidents"
                    value={healthRecords.length.toString()}
                    subtitle="Recorded this cycle"
                    icon="ActivityIcon"
                    iconColor="hsl(var(--danger))"
                />
                <MetricCard
                    title="Last Checkup"
                    value={healthRecords[0] ? new Date(healthRecords[0].record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                    subtitle="Latest health observation"
                    icon="CalendarIcon"
                    iconColor="hsl(var(--warning))"
                />
                <MetricCard
                    title="Wellness Index"
                    value="98%"
                    subtitle="Overall flock health"
                    variant="gauge"
                    gaugeValue={98}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vaccination Timeline */}
                <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 relative overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Immunization Pathway</h3>
                            <p className="text-lg font-bold text-foreground">Vaccination Timeline</p>
                        </div>
                    </div>

                    <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border before:opacity-50">
                        {vaccinationSchedules.length > 0 ? (
                            vaccinationSchedules.map((vaccine, idx) => (
                                <div key={vaccine.id || idx} className="relative group">
                                    <div className={cn(
                                        "absolute -left-8 top-1.5 w-7 h-7 rounded-full border-4 border-card flex items-center justify-center transition-all duration-300",
                                        vaccine.status === 'completed' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20"
                                    )}>
                                        {vaccine.status === 'completed' ? <Icon name="CheckmarkIcon" size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-bold text-foreground uppercase tracking-tight">{vaccine.vaccine_name || 'Vaccination'}</p>
                                            <p className="text-micro text-muted-foreground font-bold uppercase tracking-widest mt-0.5 italic">Method: {vaccine.admin_method || 'Standard'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-micro font-bold text-muted-foreground tabular-nums uppercase tracking-widest bg-muted/30 px-2 py-1 rounded border border-border/50">
                                                {new Date(vaccine.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                            <StatusBadge 
                                                status={vaccine.status === 'completed' ? 'success' : 'warning'} 
                                                label={vaccine.status === 'completed' ? 'Done' : 'Upcoming'}
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-muted-foreground text-sm italic py-4">No vaccination schedule found for this cycle.</div>
                        )}
                    </div>
                </div>

                {/* Health Monitoring Section */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Health Records</h3>
                        <p className="text-lg font-bold text-foreground">Medical History</p>
                    </div>

                    <div className="space-y-4">
                        {paginatedRecords.length > 0 ? (
                            paginatedRecords.map((record) => (
                                <div key={record.id} className="p-4 bg-muted/30 rounded-xl border border-border/50 group hover:border-primary/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-foreground uppercase tracking-tight">{record.subject || 'Observation'}</span>
                                            <span className="text-micro text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                                                {new Date(record.record_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <StatusBadge 
                                            status={record.is_gahp_compliant ? 'completed' : 'pending'}
                                            size="sm" 
                                            label={formatRecordTypeLabel(record.record_type || 'inspection')}
                                        />
                                    </div>
                                    <p className="text-micro text-muted-foreground font-bold uppercase tracking-widest italic line-clamp-2 mt-2">{record.notes || 'No notes recorded'}</p>
                                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Icon name="UserIcon" size={10} />
                                        </div>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Recorded by {getVeterinarianName(record)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <Icon name="ActivityIcon" size={32} className="mx-auto mb-4 text-muted/30" />
                                <p className="text-micro font-bold text-muted-foreground uppercase tracking-widest italic">No clinical records</p>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center">
                             <DataTablePagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                pageSize={itemsPerPage}
                                totalItems={healthRecords.length}
                                itemName="Record"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
