import * as React from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared';
import { PageTitle } from '@/components/ui/page-title';
import { TableHeader } from '@/components/ui/table-header';
import { AddNewFarmSheet } from '@/components/sheets/AddNewFarmSheet';
import { EmptyState } from '@/components/ui/empty-state';
import { useFarmsStore } from '@/stores/useFarmsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { LeafletMap } from '@/components/Farms/LeafletMap';
import { FarmCard } from '@/components/Farms/FarmCard';
import { useNavigate } from 'react-router-dom';
import type { Farm } from '@/types';
import { DataTablePagination } from '@/components/shared';

type ViewMode = 'table' | 'grid';

// Table View Component
function FarmTableView({ farms, onFarmClick, onHoverChange }: { farms: Farm[], onFarmClick: (id: string) => void, onHoverChange: (id: string | null) => void }) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(farms.length / itemsPerPage);

  const paginatedFarms = React.useMemo(() => {
    return farms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [farms, currentPage]);

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <TableHeader className="px-6 py-4 text-left">Farm Name</TableHeader>
                <TableHeader className="px-6 py-4 text-left">Location</TableHeader>
                <TableHeader className="px-6 py-4 text-right">Population</TableHeader>
                <TableHeader className="px-6 py-4 text-right">Active Cycles</TableHeader>
                <TableHeader className="px-6 py-4 text-right">Avg FCR</TableHeader>
                <TableHeader className="px-6 py-4 text-right">Avg Weight</TableHeader>
                <TableHeader className="px-6 py-4 text-right">Performance</TableHeader>
                <TableHeader className="px-6 py-4 text-center">Status</TableHeader>
                <TableHeader className="px-6 py-4 text-center">Actions</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedFarms.map((farm) => (
                <tr
                  key={farm.id}
                  onClick={() => onFarmClick(farm.id)}
                  onMouseEnter={() => onHoverChange(farm.id)}
                  onMouseLeave={() => onHoverChange(null)}
                  className="hover:bg-row-hover transition-colors transition-[width] group cursor-pointer bg-background"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-muted/20 flex items-center justify-center border border-border shadow-inner transition-colors transition-shadow transition-[width] transition-[height]">
                        <Icon name="Home01Icon" size={16} className="text-muted-foreground transition-colors" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground transition-colors leading-tight">{farm.name}</span>
                        <span className="text-micro text-muted-foreground font-mono uppercase tracking-widest mt-0.5">{farm.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-foreground bg-muted/30 px-2 py-1 rounded-lg border border-border/50">{farm.region}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-foreground font-mono tabular-nums transition-transform inline-block">{farm.currentBirdCount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-foreground font-mono tabular-nums">{farm.activeCycles}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-foreground font-mono tabular-nums">{farm.avgFCR.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-foreground font-mono tabular-nums">{farm.avgLiveWeight.toFixed(2)}kg</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      'font-bold font-mono tabular-nums font-data',
                      farm.bpi > 350 ? 'text-success' : farm.bpi >= 300 ? 'text-warning' : 'text-danger'
                    )}>{farm.bpi}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center scale-90">
                      <StatusBadge status={farm.status} size="sm" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors transition-[width] transition-[height] border border-border/40 hover:border-border/60"
                        title="View Details"
                        aria-label="View Details"
                        onClick={(e) => { e.stopPropagation(); onFarmClick(farm.id); }}
                      >
                        <Icon name="ArrowRight01Icon" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
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
        totalItems={farms.length}
        itemName="Farms"
      />
    </div>
  );
}

// Grid View Component
function FarmGridView({ farms, onFarmClick, onHoverChange }: { farms: Farm[], onFarmClick: (id: string) => void, onHoverChange: (id: string | null) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
      {farms.map((farm) => (
        <div
          key={farm.id}
          onMouseEnter={() => onHoverChange(farm.id)}
          onMouseLeave={() => onHoverChange(null)}
        >
          <FarmCard farm={farm} onClick={onFarmClick} />
        </div>
      ))}
    </div>
  );
}

// Main Farms Page Component
export default function Farms() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = React.useState<ViewMode>('table');
  const [isAddFarmOpen, setIsAddFarmOpen] = React.useState(false);
  const [hoveredFarmId, setHoveredFarmId] = React.useState<string | null>(null);
  
  const { farms, isLoading, fetchFarms } = useFarmsStore();
  const { user } = useAuthStore();

  React.useEffect(() => {
    if (user?.orgId) {
      fetchFarms(user.orgId);
    }
  }, [user?.orgId, fetchFarms]);

  const handleFarmClick = (id: string) => {
    navigate(`/farms/${id}`);
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div>
            <PageTitle>Farms</PageTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your registered farms, view locations, and monitor capacity.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddFarmOpen(true)}
          className="active:scale-95"
          aria-label="Add new farm"
        >
          <Icon name="PlusSignIcon" className="mr-2 h-4 w-4" />
          Add Farm
        </Button>
      </div>

      {/* Map visualization */}
      <LeafletMap
        farms={farms}
        className="h-[400px] shadow-2xl"
        onMarkerClick={handleFarmClick}
        hoveredFarmId={hoveredFarmId}
      />

      {/* Farms List Section */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Farm List</h3>
            <span className="px-2 py-0.5 rounded-[4px] text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase">
              {farms.length} TOTAL
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-muted/30 rounded-lg p-1 border border-border">
              {[
                { id: 'table', icon: 'ListIcon' as const, label: 'Table view' },
                { id: 'grid', icon: 'GridIcon' as const, label: 'Grid view' },
              ].map((mode) => {
                const isActive = viewMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as ViewMode)}
                    className={cn(
                      'p-1.5 rounded-md transition-colors duration-200',
                      isActive
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                    aria-label={mode.label}
                  >
                    <Icon name={mode.icon} size={16} />
                  </button>
                );
              })}
            </div>
            {/* Filter Button */}
            <Button
              variant="outline"
              className="h-9 px-3 text-xs bg-muted/30 border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors transition-transform transition-[height] rounded-lg active:scale-95"
              aria-label="Filter farms"
            >
              <Icon name="FilterIcon" className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className="min-h-[400px] relative">
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : farms.length === 0 ? (
            <EmptyState
              icon="FarmIcon"
              title="No Farms Found"
              description="Start your first production cycle by adding a farm."
              action={{
                label: 'Add Farm',
                onClick: () => setIsAddFarmOpen(true),
              }}
              className="py-24"
            />
          ) : viewMode === 'table' ? (
            <div className="relative z-10">
              <FarmTableView farms={farms} onFarmClick={handleFarmClick} onHoverChange={setHoveredFarmId} />
            </div>
          ) : (
            <div className="relative z-10">
              <FarmGridView farms={farms} onFarmClick={handleFarmClick} onHoverChange={setHoveredFarmId} />
            </div>
          )}
        </div>
      </div>

      {/* Add Farm Sheet */}
      <AddNewFarmSheet isOpen={isAddFarmOpen} onClose={() => setIsAddFarmOpen(false)} />
    </div>
  );
}


