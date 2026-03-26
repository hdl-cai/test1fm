/**
 * Production Cycle Details Page
 * 
 * Detailed view of a production cycle with tabs:
 * - Overview: Cycle stats, grower info, progress timeline
 * - Health: Health records table, upcoming vaccinations
 * - Harvest: Harvest records, yields
 * - Sales: Sales data, revenue
 * - DailyLogs: Daily entries table
 */

import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { Icon, type IconName } from '@/hooks/useIcon';
import { StatusBadge } from '@/components/shared';
import { Tabs, LineTabsList, LineTabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCycleDetails } from '@/hooks/useCycleDetails';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Farm, Person, ProductionCycle } from '@/types';
import { Loader2 } from 'lucide-react';

// Tab Components
import { OverviewTab } from '@/components/cycles/OverviewTab';
import { HealthTab } from '@/components/cycles/HealthTab';
import { HarvestTab } from '@/components/cycles/HarvestTab';
import { SalesTab } from '@/components/cycles/SalesTab';
import { DailyLogsTab } from '@/components/cycles/DailyLogsTab';
import { WeightSamplesTab } from '@/components/cycles/WeightSamplesTab';
import { ReconciliationTab } from '@/components/cycles/ReconciliationTab';
import { FinancialsTab } from '@/components/cycles/FinancialsTab';
import { DOCLoadingSheet } from '@/components/sheets/DOCLoadingSheet';
import { DeliveryLogSheet } from '@/components/sheets/DeliveryLogSheet';

type TabType = 'overview' | 'health' | 'harvest' | 'sales' | 'dailylogs' | 'weightsamples' | 'financials' | 'reconciliation';

export default function ProductionCycleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<TabType>('overview');
  const orgId = useAuthStore((state) => state.user?.orgId);
  const userId = useAuthStore((state) => state.user?.id) || '';
  const userRole = useAuthStore((state) => state.user?.role) || '';
  const [isDOCSheetOpen, setIsDOCSheetOpen] = React.useState(false);
  const [isDeliverySheetOpen, setIsDeliverySheetOpen] = React.useState(false);

  const {
    cycle: cycleData,
    dailyLogs,
    healthRecords,
    vaccinationSchedules,
    harvestRecords,
    salesRecords,
    deliveredInputs,
    cycleExpenses,
    isLoading,
    error,
    refetch,
  } = useCycleDetails(id);

  const cycle: ProductionCycle | null = cycleData ? {
    id: cycleData.id,
    farmId: cycleData.farm_id,
    growerId: cycleData.grower_id,
    batchName: cycleData.batch_name,
    startDate: new Date(cycleData.start_date),
    expectedEndDate: new Date(cycleData.anticipated_harvest_date || cycleData.start_date),
    birdCount: cycleData.initial_birds,
    status: cycleData.status === 'completed' ? 'completed' : cycleData.status === 'pending' ? 'pending' : 'active',
    mortalityRate: cycleData.latestMetrics?.livability_pct != null ? 100 - (cycleData.latestMetrics.livability_pct * 100) : 0,
    feedConsumed: 0,
    currentFeedStock: 0,
    fcr: cycleData.latestMetrics?.fcr_to_date || 0,
  } : null;

  const farm: Farm | undefined = cycleData?.farms ? {
    id: cycleData.farms.id,
    name: cycleData.farms.name,
    region: cycleData.farms.region,
    status: 'active',
    capacity: cycleData.farms.capacity,
    currentBirdCount: cycle?.birdCount || 0,
    activeCycles: cycle?.status === 'active' ? 1 : 0,
    avgFCR: cycle?.fcr || 0,
    avgLiveWeight: cycle?.averageWeight || 0,
    bpi: 0,
    coordinates: { lat: 0, lng: 0 },
    lastUpdated: new Date(cycleData.created_at),
  } : undefined;
  const grower: Person | undefined = cycleData?.profiles ? {
    id: cycleData.profiles.id,
    name: `${cycleData.profiles.first_name} ${cycleData.profiles.last_name}`,
    email: cycleData.profiles.email,
    role: 'grower',
    phone: '',
    assignedFarms: cycle ? [cycle.farmId] : [],
    status: 'active',
  } : undefined;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading cycle details...</p>
      </div>
    );
  }

  if (!cycle || error) {
    return (
      <div className="p-8 text-center bg-card/50 border border-border/50 rounded-2xl m-8">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="ActivityIcon" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {error ? 'Error Loading Cycle' : 'Production Cycle Not Found'}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {error || "The production cycle you're looking for doesn't exist or has been removed."}
        </p>
        <Button onClick={() => navigate('/production-cycles')} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">
          <Icon name="ArrowLeft01Icon" size={18} className="mr-2" />
          Back to Production Cycles
        </Button>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: IconName }[] = [
    { key: 'overview', label: 'Overview', icon: 'DashboardSquareIcon' },
    { key: 'health', label: 'Health Records', icon: 'MedicalFileIcon' },
    { key: 'harvest', label: 'Harvest', icon: 'FarmIcon' },
    { key: 'sales', label: 'Sales', icon: 'Money01Icon' },
    { key: 'dailylogs', label: 'Daily Logs', icon: 'CalendarIcon' },
    { key: 'weightsamples', label: 'Weight Samples', icon: 'Analytics01Icon' },
    { key: 'financials', label: 'Financials', icon: 'MoneyIcon' },
    ...(harvestRecords.length > 0 ? [{ key: 'reconciliation' as TabType, label: 'Reconciliation', icon: 'CheckCircleIcon' as IconName }] : []),
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/production-cycles')}
          className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors transition-shadow transition-[width] transition-[height] shadow-sm group"
        >
          <Icon name="ArrowLeft01Icon" size={20} className="group-hover:-translate-x-1 transition-transform" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <PageTitle>{cycle.batchName}</PageTitle>
            <StatusBadge status={cycle.status} size="sm" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {farm?.name || 'Unknown Farm'} · Started: {new Date(cycle.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {cycle.status === 'active' && (
            <>
              <Button variant="outline" onClick={() => setIsDOCSheetOpen(true)}>
                <Icon name="PlusIcon" className="mr-2 h-4 w-4" />
                DOC Loading
              </Button>
              <Button variant="outline" onClick={() => setIsDeliverySheetOpen(true)}>
                <Icon name="PlusIcon" className="mr-2 h-4 w-4" />
                Log Delivery
              </Button>
            </>
          )}
          <Button variant="outline">
            <Icon name="EditIcon" className="mr-2 h-4 w-4" />
            Edit Cycle
          </Button>
          {cycle.status === 'active' && (
            <Button>
              <Icon name="CheckCircleIcon" className="mr-2 h-4 w-4" />
              Complete Cycle
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Shell */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
        <LineTabsList className="bg-card/50 border-b border-border px-6 sticky top-0 z-20 backdrop-blur-sm">
          {tabs.map((tab) => (
            <LineTabsTrigger key={tab.key} value={tab.key}>
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </LineTabsTrigger>
          ))}
        </LineTabsList>

        <div className="p-8 pb-16 flex-1 min-h-[600px]">
          <TabsContent value="overview" className="mt-0">
            <OverviewTab cycle={cycle} farm={farm} grower={grower} />
          </TabsContent>
          <TabsContent value="health" className="mt-0">
            <HealthTab healthRecords={healthRecords} vaccinationSchedules={vaccinationSchedules} />
          </TabsContent>
          <TabsContent value="harvest" className="mt-0">
            <HarvestTab logs={harvestRecords} cycleId={id!} orgId={orgId || ''} userId={userId} userRole={userRole} onHarvestSaved={refetch} />
          </TabsContent>
          <TabsContent value="sales" className="mt-0">
            <SalesTab records={salesRecords} />
          </TabsContent>
          <TabsContent value="dailylogs" className="mt-0">
            <DailyLogsTab logs={dailyLogs} cycleId={id!} orgId={orgId || ''} onLogSaved={refetch} />
          </TabsContent>
          <TabsContent value="weightsamples" className="mt-0">
            <WeightSamplesTab logs={dailyLogs} />
          </TabsContent>
          <TabsContent value="financials" className="mt-0">
            <FinancialsTab
              cycle={cycle}
              salesRecords={salesRecords}
              deliveredInputs={deliveredInputs}
              cycleExpenses={cycleExpenses}
              orgId={orgId || ''}
              userId={userId}
              onRefetch={refetch}
            />
          </TabsContent>
          {harvestRecords.length > 0 && (
            <TabsContent value="reconciliation" className="mt-0">
              <ReconciliationTab
                cycle={cycle}
                dailyLogs={dailyLogs}
                harvestRecords={harvestRecords}
                salesRecords={salesRecords}
                deliveredInputs={deliveredInputs}
                cycleExpenses={cycleExpenses}
                orgId={orgId || ''}
                userId={userId}
                onCycleClosed={refetch}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>
      <DOCLoadingSheet
        isOpen={isDOCSheetOpen}
        onClose={() => setIsDOCSheetOpen(false)}
        cycleId={id!}
        orgId={orgId || ''}
        onSaved={refetch}
      />
      <DeliveryLogSheet
        isOpen={isDeliverySheetOpen}
        onClose={() => setIsDeliverySheetOpen(false)}
        cycleId={id!}
        farmId={cycle.farmId}
        orgId={orgId || ''}
        onSaved={refetch}
      />
    </div>
  );
}
