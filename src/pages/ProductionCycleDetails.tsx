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
import { Loader2 } from 'lucide-react';

// Tab Components
import { OverviewTab } from '@/components/cycles/OverviewTab';
import { HealthTab } from '@/components/cycles/HealthTab';
import { HarvestTab } from '@/components/cycles/HarvestTab';
import { SalesTab } from '@/components/cycles/SalesTab';
import { DailyLogsTab } from '@/components/cycles/DailyLogsTab';

type TabType = 'overview' | 'health' | 'harvest' | 'sales' | 'dailylogs';

export default function ProductionCycleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<TabType>('overview');

  const {
    cycle: cycleData,
    dailyLogs,
    healthRecords,
    vaccinationSchedules,
    harvestRecords,
    salesRecords,
    isLoading,
    error,
  } = useCycleDetails(id);

  const cycle = cycleData ? {
    id: cycleData.id,
    farmId: cycleData.farm_id,
    growerId: cycleData.grower_id,
    batchName: cycleData.batch_name,
    startDate: new Date(cycleData.start_date),
    expectedEndDate: new Date(cycleData.anticipated_harvest_date || cycleData.start_date),
    birdCount: cycleData.initial_birds,
    status: cycleData.status as any,
    mortalityRate: cycleData.latestMetrics ? 100 - (cycleData.latestMetrics.livability_pct * 100) : 0,
    feedConsumed: 0,
    currentFeedStock: 0,
    fcr: cycleData.latestMetrics?.fcr_to_date || 0,
  } : null;

  const farm = cycleData?.farms;
  const grower = cycleData?.profiles ? {
    id: cycleData.profiles.id,
    name: `${cycleData.profiles.first_name} ${cycleData.profiles.last_name}`,
    email: cycleData.profiles.email,
    role: 'grower',
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
            <StatusBadge status={cycle.status as any} size="sm" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {farm?.name || 'Unknown Farm'} · Started: {new Date(cycle.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
            <OverviewTab cycle={cycle} farm={farm as any} grower={grower as any} />
          </TabsContent>
          <TabsContent value="health" className="mt-0">
            <HealthTab healthRecords={healthRecords} vaccinationSchedules={vaccinationSchedules} />
          </TabsContent>
          <TabsContent value="harvest" className="mt-0">
            <HarvestTab logs={harvestRecords} />
          </TabsContent>
          <TabsContent value="sales" className="mt-0">
            <SalesTab records={salesRecords} />
          </TabsContent>
          <TabsContent value="dailylogs" className="mt-0">
            <DailyLogsTab logs={dailyLogs} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
