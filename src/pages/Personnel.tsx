/**
 * Personnel Page
 * 
 * Main page for personnel management. Displays:
 * - Metric Cards Dashboard
 * - Employee Directory with advanced filtering and actions
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { TableHeader } from '@/components/ui/table-header';
import { StatusBadge, MetricCard, DataTablePagination } from '@/components/shared';
import { usePersonnelStore } from '@/stores/usePersonnelStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { InviteUserSheet } from '@/components/sheets/InviteUserSheet';
import type { Person } from '@/types';

type RoleTab = 'all' | Person['role'];

// Role Badge Component
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; variant: string }> = {
    farm_admin: { label: 'Farm Admin', variant: 'badge-info' },
    admin: { label: 'Admin', variant: 'badge-info' },
    grower: { label: 'Grower', variant: 'badge-success' },
    technician: { label: 'Technician', variant: 'badge-warning' },
    vet: { label: 'Vet', variant: 'badge-info' },
  };

  const badge = config[role] || { label: role, variant: 'badge-muted' };

  return (
    <span className={cn('badge', badge.variant)}>
      {badge.label}
    </span>
  );
}

// Personnel Table Component
function PersonnelTable({ personnel }: { personnel: Person[] }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="overflow-x-auto relative z-10">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/20 text-muted-foreground">
            <TableHeader className="px-6 py-4 text-left">Team Member</TableHeader>
            <TableHeader className="px-6 py-4 text-left">Role</TableHeader>
            <TableHeader className="px-6 py-4 text-left">Assigned Farms</TableHeader>
            <TableHeader className="px-6 py-4 text-left">Contact Info</TableHeader>
            <TableHeader className="px-6 py-4 text-center">Status</TableHeader>
            <TableHeader className="px-6 py-4 text-center">Actions</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {personnel.map((person) => {
            const assignedFarmNames = person.assignedFarms || [];

            return (
              <tr key={person.id} className="hover:bg-row-hover transition-colors transition-[width] group bg-background">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex-shrink-0 h-10 w-10 rounded-xl bg-muted/50 border border-border/60 shadow-inner flex items-center justify-center font-bold text-xs tracking-tight transition-colors",
                      person.role === 'farm_admin' || person.role === 'vet' ? "text-info" :
                        person.role === 'grower' ? "text-success" :
                          "text-warning"
                    )}>
                      {getInitials(person.name)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground tracking-tight">{person.name}</div>
                      <div className="text-micro font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">#{person.id.split('-')[1] || person.id.slice(0, 4)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleBadge role={person.role} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                    {assignedFarmNames.length > 0 ? (
                      assignedFarmNames.slice(0, 2).map((name, i) => (
                        <span key={i} className="px-2 py-0.5 bg-muted/20 border border-border/40 text-muted-foreground rounded-md text-micro font-semibold uppercase tracking-wider">
                          {name}
                        </span>
                      ))
                    ) : (
                      <span className="text-micro font-semibold text-muted-foreground uppercase tracking-widest italic">Unassigned</span>
                    )}
                    {assignedFarmNames.length > 2 && (
                      <span className="text-micro font-bold text-primary uppercase tracking-widest ml-1 self-center">+{assignedFarmNames.length - 2} FARMS</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <div className="text-micro font-bold text-muted-foreground font-mono tracking-tight">{person.phone}</div>
                    <div className="text-micro font-semibold text-muted-foreground tracking-tight">{person.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex justify-center scale-90">
                    <StatusBadge status={person.status} size="sm" />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2.5">
                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors transition-[width] transition-[height] border border-border/40 hover:border-border/60" aria-label="View Details">
                      <Icon name="EyeIcon" size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors transition-[width] transition-[height] border border-border/40 hover:border-border/60" aria-label="Edit Member">
                      <Icon name="Edit01Icon" size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors transition-[width] transition-[height] border border-border/40 hover:border-danger/60" aria-label="Delete Member">
                      <Icon name="Delete01Icon" size={16} />
                    </Button>
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

// Main Personnel Page Component
export default function Personnel() {
  const { user } = useAuthStore();
  const { personnel, isLoading, error, fetchPersonnelData } = usePersonnelStore();
  
  const [activeTab, setActiveTab] = React.useState<RoleTab>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const itemsPerPage = 10;

  React.useEffect(() => {
    if (user?.orgId) {
      fetchPersonnelData(user.orgId);
    }
  }, [user?.orgId, fetchPersonnelData]);

  // Derived state
  const filteredPersonnel = React.useMemo(() => {
    return personnel.filter(person => {
      const matchesRole = activeTab === 'all' || person.role === activeTab;
      const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [personnel, activeTab, searchQuery]);

  const stats = React.useMemo(() => ({
    total: personnel.length,
    admins: personnel.filter(p => p.role === 'farm_admin').length,
    growers: personnel.filter(p => p.role === 'grower').length,
    technicians: personnel.filter(p => p.role === 'technician').length
  }), [personnel]);

  const paginatedPersonnel = React.useMemo(() => {
    return filteredPersonnel.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredPersonnel, currentPage]);

  const totalPages = Math.ceil(filteredPersonnel.length / itemsPerPage);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  if (isLoading && personnel.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl">
          Error loading personnel: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-background">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <PageTitle>Staff</PageTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage team members, roles, and farm assignments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="active:scale-95 group">
            <Icon name="Download01Icon" className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            Export Staff List
          </Button>
          <Button className="active:scale-95" onClick={() => setIsInviteOpen(true)}>
            <Icon name="PlusSignIcon" className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Dashboard Top Widgets - Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Staff"
          value={stats.total}
          icon="UserGroupIcon"
          iconColor="var(--primary)"
        />
        <MetricCard
          title="Admins"
          value={stats.admins}
          icon="ShieldCheckIcon"
          iconColor="var(--warning)"
        />
        <MetricCard
          title="Growers"
          value={stats.growers}
          icon="FarmIcon"
          iconColor="var(--success)"
        />
        <MetricCard
          title="Technicians"
          value={stats.technicians}
          icon="MedicalFileIcon"
          iconColor="var(--info)"
        />
      </div>

      <div className="border-b border-border/50 mb-8"></div>

      {/* Employee Directory Section */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Team Directory</h3>
            <span className="px-2 py-0.5 rounded-lg text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase">
              {filteredPersonnel.length} TOTAL
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Icon name="SearchIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search personnel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-muted/30 border border-border text-foreground placeholder-muted-foreground/50 focus:border-primary focus:ring-0 text-xs rounded-lg h-9 outline-none transition-colors transition-[width] transition-[height]"
              />
            </div>

            {/* Role Filter Tabs - Segmented Style */}
            <div className="flex bg-muted/30 rounded-lg p-1 border border-border">
              {[
                { id: 'all', label: 'global' },
                { id: 'farm_admin', label: 'admins' },
                { id: 'grower', label: 'growers' },
                { id: 'technician', label: 'techs' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveTab(filter.id as RoleTab)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-micro font-semibold transition-colors duration-200 capitalize tracking-wide',
                    activeTab === filter.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Personnel Table Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm relative">
          <PersonnelTable personnel={paginatedPersonnel} />
        </div>

        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={itemsPerPage}
          totalItems={filteredPersonnel.length}
          itemName="Active Operatives"
        />
      </div>

      <InviteUserSheet
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvited={() => user?.orgId && fetchPersonnelData(user.orgId)}
      />
    </div>
  );
}
