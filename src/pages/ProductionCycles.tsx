/**
 * Production Cycles Page
 * 
 * Main page for production cycle management. Displays:
 * - List view of all production cycles
 * - Filter by status (Active/Completed/Pending)
 * - Quick stats per cycle
 * - Links to detailed cycle information
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageTitle } from '@/components/ui/page-title';
import { TableHeader } from '@/components/ui/table-header';
import { MetricCard, StatusBadge, DataTablePagination } from '@/components/shared';
import { NewCycleSheet } from '@/components/sheets/NewCycleSheet';
import { useCyclesStore } from '@/stores/useCyclesStore';
import { useFarmsStore } from '@/stores/useFarmsStore';
import { usePersonnelStore } from '@/stores/usePersonnelStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { ProductionCycle } from '@/types';

type CycleStatus = 'all' | 'active' | 'completed' | 'pending';

import type { Farm, Person } from '@/types';

function CycleCard({ cycle, farm, grower }: { cycle: ProductionCycle; farm: Farm | undefined; grower: Person | undefined }) {
  const navigate = useNavigate();
  const startDate = new Date(cycle.startDate);
  const endDate = new Date(cycle.expectedEndDate);
  const now = new Date();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const isActive = cycle.status === 'active';
  const currentBirdCount = Math.round(cycle.birdCount * (1 - cycle.mortalityRate / 100));

  return (
    <div
      className="bg-card rounded-xl border border-border hover:border-primary/30 transition-colors transition-[width] p-6 cursor-pointer group relative overflow-hidden"
      onClick={() => navigate(`/production-cycles/${cycle.id}`)}
    >
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-transform transition-shadow transition-[width] transition-[height] duration-300 group-hover:scale-110 shadow-lg',
            isActive ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' : 'bg-muted/30 border border-border/50 text-muted-foreground'
          )}>
            <Icon name="CycleIcon" size={20} />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm">{cycle.batchName}</h4>
            <p className="text-micro text-muted-foreground font-bold uppercase tracking-wide">{farm?.name || 'Unknown Farm'}</p>
          </div>
        </div>
        <StatusBadge status={cycle.status as any} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-6 relative z-10">
        <div>
          <p className="text-micro text-muted-foreground uppercase tracking-[0.15em] font-bold mb-1">Bird Count</p>
          <p className="text-xl font-bold text-foreground font-data">{currentBirdCount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-micro text-muted-foreground uppercase tracking-[0.15em] font-bold mb-1">Mortality</p>
          <p className={cn(
            'text-xl font-bold font-data',
            cycle.mortalityRate > 1 ? 'text-danger font-semibold' : cycle.mortalityRate >= 0.5 ? 'text-warning' : 'text-success'
          )}>
            {cycle.mortalityRate.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-micro text-muted-foreground uppercase tracking-[0.15em] font-bold mb-1">FCR</p>
          <p className="text-xl font-bold text-foreground font-data">{cycle.fcr?.toFixed(2) || '--'}</p>
        </div>
        <div>
          <p className="text-micro text-muted-foreground uppercase tracking-[0.15em] font-bold mb-1">Avg Weight</p>
          <p className="text-xl font-bold text-foreground font-data">
            {cycle.averageWeight ? `${(cycle.averageWeight / 1000).toFixed(2)} kg` : '--'}
          </p>
        </div>
      </div>

      {isActive && (
        <div className="mb-6 relative z-10">
          <div className="flex items-center justify-between text-micro mb-2 font-bold uppercase tracking-wider">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-muted-foreground font-medium">{daysRemaining} days remaining</span>
          </div>
          <div className="w-full h-1.5 bg-secondary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-colors transition-shadow transition-[width] transition-[height] duration-1000 shadow-[0_0_8px_var(--primary)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-border flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-muted/30 border border-border flex items-center justify-center text-muted-foreground">
            <Icon name="UserIcon" size={12} />
          </div>
          <span className="text-micro font-bold text-muted-foreground tracking-tight">{grower?.name || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-micro font-bold text-muted-foreground uppercase tracking-widest tabular-nums">
          <Icon name="CalendarIcon" size={12} />
          <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Subtle Border Glow for active */}
      {isActive && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/40 shadow-[0_0_12px_var(--primary)]" />}
    </div>
  );
}

function CycleTable({ cycles, farms, growers, navigate }: {
  cycles: ProductionCycle[];
  farms: Farm[];
  growers: Person[];
  navigate: (path: string) => void;
}) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(cycles.length / itemsPerPage);

  const paginatedCycles = React.useMemo(() => {
    return cycles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [cycles, currentPage]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <TableHeader className="px-6 py-4 text-left">
                  Batch Name
                </TableHeader>
                <TableHeader className="px-6 py-4 text-left">
                  Farm
                </TableHeader>
                <TableHeader className="px-6 py-4 text-left">
                  Grower
                </TableHeader>
                <TableHeader className="px-6 py-4 text-center">
                  Status
                </TableHeader>
                <TableHeader className="px-6 py-4 text-right">
                  Birds
                </TableHeader>
                <TableHeader className="px-6 py-4 text-right">
                  Mortality
                </TableHeader>
                <TableHeader className="px-6 py-4 text-right">
                  FCR
                </TableHeader>
                <TableHeader className="px-6 py-4 text-left">
                  Date Range
                </TableHeader>
                <TableHeader className="px-6 py-4 text-center">
                  Action
                </TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedCycles.map((cycle) => {
                const farm = farms.find((f) => f.id === cycle.farmId);
                const grower = growers.find((g) => g.id === cycle.growerId);
                const currentBirdCount = Math.round(cycle.birdCount * (1 - cycle.mortalityRate / 100));

                return (
                  <tr
                    key={cycle.id}
                    className="hover:bg-row-hover transition-colors group cursor-pointer bg-background"
                    onClick={() => navigate(`/production-cycles/${cycle.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-muted/40 border border-border text-muted-foreground transition-colors flex items-center justify-center">
                          <Icon name="CycleIcon" size={16} />
                        </div>
                        <div>
                          <span className="font-bold text-foreground">{cycle.batchName}</span>
                          <p className="text-micro text-muted-foreground font-data">{cycle.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{farm?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{grower?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <StatusBadge status={cycle.status as any} size="sm" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-foreground tabular-nums font-data">
                      {currentBirdCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        'text-sm font-bold tabular-nums font-data',
                        cycle.mortalityRate > 1 ? 'text-danger font-semibold' : cycle.mortalityRate >= 0.5 ? 'text-warning' : 'text-success'
                      )}>
                        {cycle.mortalityRate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-muted-foreground tabular-nums font-data">
                      {cycle.fcr?.toFixed(2) || '--'}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground tabular-nums font-data">
                      {formatDate(cycle.startDate)} - {formatDate(cycle.expectedEndDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground transition-colors">
                          <Icon name="ArrowRight01Icon" size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <DataTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={itemsPerPage}
        totalItems={cycles.length}
        itemName="Production Cycles"
      />
    </div>
  );
}

export default function ProductionCycles() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('table');
  const [statusFilter, setStatusFilter] = React.useState<CycleStatus>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isNewCycleOpen, setIsNewCycleOpen] = React.useState(false);

  const { cycles, isLoading, fetchCycles, activeCyclesCount, completedCyclesCount, totalActiveBirds, averageFCR } = useCyclesStore();
  const farms = useFarmsStore((state) => state.farms);
  const growers = usePersonnelStore((state) => state.personnel) || [];
  const { user } = useAuthStore();

  React.useEffect(() => {
    if (user?.orgId) {
      fetchCycles(user.orgId);
    }
  }, [user?.orgId, fetchCycles]);

  const filteredCycles = React.useMemo(() => {
    return cycles.filter((cycle) => {
      const matchesStatus = statusFilter === 'all' || cycle.status === statusFilter;
      const matchesSearch =
        cycle.batchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cycle.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [cycles, statusFilter, searchQuery]);

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <PageTitle>Production Cycles</PageTitle>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all active and completed production batches.
          </p>
        </div>
        <Button
          onClick={() => setIsNewCycleOpen(true)}
          className="mt-4 md:mt-0"
        >
          <Icon name="PlusSignIcon" className="mr-2 h-4 w-4" />
          New Cycle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Cycles"
          value={activeCyclesCount}
          subtitle="Batches in progress"
          icon="CycleIcon"
          iconColor="var(--warning)"
        />

        <MetricCard
          title="Completed"
          value={completedCyclesCount}
          subtitle="Closed successfully"
          icon="CheckCircleIcon"
          iconColor="var(--muted-foreground)"
        />

        <MetricCard
          title="Active Birds"
          value={totalActiveBirds.toLocaleString()}
          subtitle="Live population"
          icon="FarmIcon"
          iconColor="var(--success)"
        />

        <MetricCard
          title="Avg FCR"
          value={averageFCR.toFixed(2)}
          subtitle="Efficiency index"
          icon="AnalyticsIcon"
          iconColor="var(--info)"
        />
      </div>

      {/* Cycles List Section */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Production Cycles</h3>
            <span className="px-2 py-0.5 rounded-[4px] text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase tabular-nums font-data">
              {filteredCycles.length} Total
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Tabs */}
            <div className="flex bg-muted/30 rounded-lg p-1 border border-border">
              {(['all', 'active', 'completed', 'pending'] as CycleStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-micro font-bold transition-colors duration-200 capitalize tracking-wide',
                    statusFilter === status
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex bg-muted/30 rounded-lg p-1 border border-border">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'p-1.5 rounded-md transition-colors duration-200',
                  viewMode === 'table'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                aria-label="Table view"
              >
                <Icon name="ListIcon" size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded-md transition-colors duration-200',
                  viewMode === 'grid'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                aria-label="Grid view"
              >
                <Icon name="GridIcon" size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Icon
                name="SearchIcon"
                size={14}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Search cycles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48 bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-0 text-xs rounded-lg h-9"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : viewMode === 'table' ? (
          <CycleTable
            cycles={filteredCycles}
            farms={farms}
            growers={growers}
            navigate={navigate}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCycles.map((cycle) => {
              const farm = farms.find((f) => f.id === cycle.farmId);
              const grower = growers.find((g) => g.id === cycle.growerId);
              return (
                <CycleCard
                  key={cycle.id}
                  cycle={cycle}
                  farm={farm}
                  grower={grower}
                />
              );
            })}
          </div>
        )}
      </div>

      <NewCycleSheet isOpen={isNewCycleOpen} onClose={() => setIsNewCycleOpen(false)} />
    </div>
  );
}
