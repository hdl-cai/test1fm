// FLOCKMATE V2 — This feature is planned for v2. Not active in v1.
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { TableHeader } from '@/components/ui/table-header';
import { Tabs, LineTabsList, LineTabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge, MetricCard, MetricChart, DataTablePagination, FarmFilter, type ChartDataPoint } from '@/components/shared';
import { HealthReportSheet } from '@/components/sheets/HealthReportSheet';
import { HealthSchedule } from '@/components/health/HealthSchedule';
import { getPersonById } from '@/data/personnel';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCyclesStore } from '@/stores/useCyclesStore';
import { useHealthStore } from '@/stores/useHealthStore';
import { Loader2, AlertCircle } from 'lucide-react';
import type { HealthRecord } from '@/types';

type TabType = 'overview' | 'schedule';

// Local StatCard component removed in favor of shared component

// Recent Records Table Component
function RecentRecordsTable({ records }: { records: HealthRecord[] }) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTypeIcon = (type: HealthRecord['type']) => {
    switch (type) {
      case 'vaccination':
        return 'MedicineIcon';
      case 'treatment':
        return 'FirstAidKitIcon';
      case 'inspection':
        return 'SearchIcon';
      default:
        return 'MedicalFileIcon';
    }
  };

  const getTypeColor = (type: HealthRecord['type']) => {
    switch (type) {
      case 'vaccination':
        return 'text-info bg-info/10 border-info/20';
      case 'treatment':
        return 'text-danger bg-danger/10 border-danger/20';
      case 'inspection':
        return 'text-success bg-success/10 border-success/20';
      default:
        return 'text-muted-foreground bg-muted/10 border-border/40';
    }
  };

  return (
    <div className="overflow-x-auto relative z-10">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/20 text-muted-foreground">
            <TableHeader className="px-6 py-4 text-left">Type</TableHeader>
            <TableHeader className="px-6 py-4 text-left">Details</TableHeader>
            <TableHeader className="px-6 py-4 text-left">Medication</TableHeader>
            <TableHeader className="px-6 py-4 text-left">Dosage/Method</TableHeader>
            <TableHeader className="px-6 py-4 text-left">Date</TableHeader>
            <TableHeader className="px-6 py-4 text-left">Veterinarian</TableHeader>
            <TableHeader className="px-6 py-4 text-center">Status</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {records.map((record) => {
            const vet = getPersonById(record.vetId);
            const style = getTypeColor(record.type);
            return (
              <tr key={record.id} className="hover:bg-row-hover transition-colors group bg-background">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner transition-transform', style)}>
                      <Icon name={getTypeIcon(record.type)} size={16} />
                    </div>
                    <span className="capitalize font-bold text-foreground text-xs tracking-tight">{record.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-muted-foreground line-clamp-1">{record.description}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-foreground">{record.medication || '—'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-micro font-semibold text-muted-foreground uppercase tracking-wider">{record.dosage || '—'}</span>
                </td>
                <td className="px-6 py-4 text-micro font-bold text-muted-foreground tabular-nums uppercase tracking-widest">{formatDate(record.date)}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{vet?.name || 'Unknown'}</span>
                    <span className="text-micro font-semibold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">Veterinarian</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <StatusBadge status={record.status} size="sm" />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface HealthTrendData extends ChartDataPoint {
  name: string;
  healthy: number;
  mortality: number;
}

const HEALTH_TREND_DATA: HealthTrendData[] = Array.from({ length: 12 }, (_, i) => ({
  name: `Week ${i + 1}`,
  healthy: 92 + (i % 4),
  mortality: 2 + (i % 3),
}));

// Main Health Page Component
export default function Health() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabType) || 'overview';

  const { user } = useAuthStore();
  const { fetchCycles, cycles } = useCyclesStore();
  const { 
    records, 
    isLoading, 
    error, 
    fetchHealthData,
    activeMedicationsCount,
    quarantinedBirdsCount,
    vaccinationCoverage 
  } = useHealthStore();

  const [chartPeriod, setChartPeriod] = React.useState('30d');
  const [isReportSheetOpen, setIsReportSheetOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  React.useEffect(() => {
    if (user?.orgId) {
      fetchHealthData(user.orgId);
      fetchCycles(user.orgId);
    }
  }, [user?.orgId, fetchHealthData, fetchCycles]);

  const setActiveTab = (value: TabType) => {
    setSearchParams({ tab: value });
  };

  // Track selected cycle for vaccination schedule
  const activeCycles = cycles.filter(c => c.status === 'active');
  const [selectedCycleId, setSelectedCycleId] = React.useState<string>(activeCycles[0]?.id || '');

  // Update selected cycle if it changes and currently empty
  React.useEffect(() => {
    if (!selectedCycleId && activeCycles.length > 0) {
      setSelectedCycleId(activeCycles[0].id);
    }
  }, [activeCycles, selectedCycleId]);

  // Mock trend data for chart
  const healthTrendData = React.useMemo<HealthTrendData[]>(() => HEALTH_TREND_DATA, []);

  const paginatedRecords = React.useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [currentPage, records]);

  const totalPages = Math.ceil(records.length / itemsPerPage);

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <PageTitle>Health</PageTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Track flock health, vaccination schedules, and diagnostic records.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setIsReportSheetOpen(true)}
            className="active:scale-95"
          >
            <Icon name="PlusSignIcon" className="mr-2 h-4 w-4" />
            Add Health Record
          </Button>

          {/* Farm Selection */}
          <FarmFilter variant="default" allOptionLabel="All Farms" />
        </div>
      </div>

      {/* Tabs / Content Section */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full space-y-8">
        {/* Tab Controls - Line Style */}
        <LineTabsList className="w-fit border-b-0">
          <LineTabsTrigger value="overview">
            <Icon name="DashboardSquareIcon" size={14} />
            Health Overview
          </LineTabsTrigger>
          <LineTabsTrigger value="schedule">
            <Icon name="CalendarIcon" size={14} />
            Vaccination Schedule
          </LineTabsTrigger>
        </LineTabsList>

        {/* Tab Content */}
        <TabsContent value="overview" className="animate-in fade-in duration-300 mt-0">
          <div className="space-y-6">
            <div className="flex flex-col gap-6">
              {/* Main Chart */}
              <div>
                <MetricChart
                  title="Mortality & Health Trends"
                  subtitle="Growth and mortality charts"
                  data={healthTrendData}
                  series={[
                    { key: 'healthy', name: 'Healthy Flock (%)', color: 'var(--primary)', unit: '%' },
                    { key: 'mortality', name: 'Mortality Rate (%)', color: 'var(--warning)', unit: '%' },
                  ]}
                  periods={[
                    { label: 'LIVE', value: 'live' },
                    { label: '30D', value: '30d' },
                    { label: '90D', value: '90d' },
                  ]}
                  activePeriod={chartPeriod}
                  onPeriodChange={setChartPeriod}
                  height={320}
                />
              </div>

              {/* Specific Stats Column */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  title="Active Medications"
                  value={activeMedicationsCount}
                  icon="MedicineIcon"
                  iconColor="var(--info)"
                  trend={{ value: 2, direction: 'up', label: 'Recent logs' }}
                />
                <MetricCard
                  title="Quarantined Birds"
                  value={quarantinedBirdsCount || "None"}
                  icon="ShieldAlertIcon"
                  iconColor="var(--warning)"
                  trend={{ value: 0, direction: 'down', label: 'Monitoring' }}
                />
                <MetricCard
                  title="Vaccination Coverage"
                  value={`${vaccinationCoverage}%`}
                  icon="CheckmarkBadge01Icon"
                  iconColor="var(--primary)"
                  trend={{ value: 5, direction: 'up', label: 'BAI Compliant' }}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Fetching health registry...</p>
              </div>
            ) : error ? (
              <div className="bg-danger/5 border border-danger/20 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-danger uppercase tracking-wider">Failed to load health registry</h4>
                  <p className="text-xs text-danger/80 mt-1">{error}</p>
                </div>
              </div>
            ) : (
            /* Records Registry Section */
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Health Records</h3>
                  <span className="px-2 py-0.5 rounded-lg text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase">
                    {records.length} TOTAL
                  </span>
                </div>
                <Button variant="outline" size="sm" className="active:scale-95 flex items-center gap-2 group/btn shrink-0 w-fit">
                  Full Report
                  <Icon name="ArrowRight01Icon" size={12} className="transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>

              {/* Table Card */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm relative">
                <RecentRecordsTable records={paginatedRecords} />
              </div>

              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={itemsPerPage}
                totalItems={records.length}
                itemName="Health Records"
              />
            </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="animate-in fade-in duration-300 mt-0">
          <HealthSchedule
            selectedCycleId={selectedCycleId}
            onCycleChange={setSelectedCycleId}
            onAddRecord={() => setIsReportSheetOpen(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Health Report Sheet */}
      <HealthReportSheet isOpen={isReportSheetOpen} onClose={() => setIsReportSheetOpen(false)} />
    </div>
  );
}
