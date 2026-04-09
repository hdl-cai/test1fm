import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { TableHeader } from '@/components/ui/table-header';
import { Tabs, LineTabsList, LineTabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Icon } from '@/hooks/useIcon';
import { useFarmsStore } from '@/stores/useFarmsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSensorsStore } from '@/stores/useSensorsStore';
import { FarmSensorSettings } from '@/components/sensors/FarmSensorSettings';
import { SensorCard } from '@/components/sensors/SensorCard';
import { SensorHistoryChart } from '@/components/sensors/SensorHistoryChart';
import { MetricCard, StatusBadge, DataTablePagination } from '@/components/shared';
import { cn } from '@/lib/utils';
import type { Farm } from '@/types';
import { Loader2 } from 'lucide-react';
import { differenceInDays } from 'date-fns';

type TabType = 'overview' | 'environment' | 'history' | 'personnel';

export default function FarmDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { farms, farmHistory, farmPersonnel, farmStock, isLoading, fetchFarms, fetchFarmDetails } = useFarmsStore();
    const { user } = useAuthStore();
    const {
        getSensorsByFarmId,
        history: sensorHistory,
        thresholds,
        isSaving: sensorsSaving,
        fetchSensors,
        fetchHistory,
        fetchThresholds,
        saveThreshold,
        toggleFarmSensors,
        addSensorNode,
        deactivateSensorNode,
    } = useSensorsStore();
    
    const farm = farms.find((f) => f.id === id);
    const [activeTab, setActiveTab] = React.useState<TabType>((searchParams.get('tab') as TabType) || 'overview');
    const [environmentPeriod, setEnvironmentPeriod] = React.useState<'24h' | '7d' | '30d'>('24h');
    const farmSensors = React.useMemo(() => (id ? getSensorsByFarmId(id) : []), [getSensorsByFarmId, id]);

    React.useEffect(() => {
        if (user?.orgId) {
            void fetchFarms(user.orgId);
            void fetchSensors(user.orgId);
        }
    }, [user?.orgId, fetchFarms, fetchSensors]);

    React.useEffect(() => {
        if (id) {
            void fetchFarmDetails(id);
        }
    }, [id, fetchFarmDetails]);

    React.useEffect(() => {
        if (user?.orgId && id) {
            const days = environmentPeriod === '24h' ? 1 : environmentPeriod === '7d' ? 7 : 30;
            void fetchHistory(user.orgId, { farmId: id, days });
            void fetchThresholds(user.orgId, id);
        }
    }, [environmentPeriod, fetchHistory, fetchThresholds, id, user?.orgId]);

    React.useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'overview' || tabParam === 'environment' || tabParam === 'history' || tabParam === 'personnel') {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    if (isLoading && !farm) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!farm) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
                <Icon name="SearchIcon" size={48} className="text-muted-foreground/20 mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Farm Not Found</h2>
                <p className="text-muted-foreground mb-6">The farm you are looking for does not exist or has been removed.</p>
                <Button onClick={() => navigate('/farms')}>
                    Back to Farms
                </Button>
            </div>
        );
    }

    const tabs: { id: TabType; label: string; icon: string }[] = [
        { id: 'overview', label: 'Overview', icon: 'Layout03Icon' },
        { id: 'environment', label: 'Environment', icon: 'SensorIcon' },
        { id: 'history', label: 'Production History', icon: 'Clock01Icon' },
        { id: 'personnel', label: 'Assigned Personnel', icon: 'UserGroupIcon' },
    ];

    return (
        <div className="p-4 md:p-8 space-y-8">
            {/* Back Navigation */}
            <button
                onClick={() => navigate('/farms')}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group mb-2"
            >
                <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all active:scale-95">
                    <Icon name="ArrowLeft01Icon" size={14} />
                </div>
                <span className="text-micro font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">Back to Farms</span>
            </button>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-xl bg-muted border border-border flex items-center justify-center text-primary group transition-all duration-300">
                        <Icon name="FarmIcon" size={32} className="transition-transform group-hover:scale-110" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <PageTitle>{farm.name}</PageTitle>
                            <StatusBadge status={farm.status} size="md" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {farm.region} · 4 houses · Capacity: {farm.capacity.toLocaleString()} birds
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="active:scale-95">
                        <Icon name="Settings02Icon" className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                    <Button className="active:scale-95">
                        <Icon name="Edit02Icon" className="mr-2 h-4 w-4" />
                        Manage Farm
                    </Button>
                </div>
            </div>

            {/* Tabs Navigation - Line Style */}
            <Tabs value={activeTab} onValueChange={(value) => {
                const nextTab = value as TabType;
                setActiveTab(nextTab);
                setSearchParams(nextTab === 'overview' ? {} : { tab: nextTab });
            }} className="w-full">
                <LineTabsList className="bg-card/50 border-b border-border px-6 sticky top-0 z-20 backdrop-blur-sm">
                    {tabs.map((tab) => (
                        <LineTabsTrigger key={tab.id} value={tab.id}>
                            <Icon name={tab.icon as any} size={14} />
                            {tab.label}
                        </LineTabsTrigger>
                    ))}
                </LineTabsList>

                <div className="p-8 pb-16">
                    <TabsContent value="overview" className="animate-in fade-in duration-700 m-0">
                        <OverviewTab farm={farm} history={farmHistory} stock={farmStock} sensors={farmSensors} />
                    </TabsContent>
                    <TabsContent value="environment" className="animate-in fade-in duration-700 m-0">
                        <EnvironmentTab
                            farm={farm}
                            sensors={farmSensors}
                            thresholds={thresholds}
                            history={sensorHistory}
                            period={environmentPeriod}
                            isSaving={sensorsSaving}
                            onPeriodChange={setEnvironmentPeriod}
                            onToggleEnabled={async (enabled) => {
                                if (!id || !user?.orgId) return;
                                await toggleFarmSensors(id, enabled);
                                await fetchFarms(user.orgId);
                            }}
                            onSaveThreshold={async (input) => {
                                if (!id || !user?.orgId || !user.id) return;
                                await saveThreshold({ ...input, orgId: user.orgId, farmId: id, userId: user.id });
                            }}
                            onAddSensor={async (input) => {
                                if (!id || !user?.orgId) return;
                                await addSensorNode({ ...input, orgId: user.orgId, farmId: id });
                            }}
                            onDeactivateSensor={deactivateSensorNode}
                        />
                    </TabsContent>
                    <TabsContent value="history" className="animate-in fade-in duration-700 m-0">
                        <HistoryTab history={farmHistory} />
                    </TabsContent>
                    <TabsContent value="personnel" className="animate-in fade-in duration-700 m-0">
                        <PersonnelTab personnel={farmPersonnel} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

// --- Sub-components ---

function OverviewTab({ farm, history, stock, sensors }: { farm: Farm; history: any[]; stock: any[]; sensors: any[] }) {
    const activeCycle = history.find(h => h.status === 'active');
    const ageDays = activeCycle ? differenceInDays(new Date(), new Date(activeCycle.start_date)) : 0;
    
    // Find Feed Stock
    const feedStock = stock.find(s => s.inventory_items.name.toLowerCase().includes('feed'));
    const stockValue = feedStock ? `${feedStock.current_qty.toLocaleString()} ${feedStock.inventory_items.unit}` : '0 Units';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MetricCard
                        title="Current Cycle"
                        value={activeCycle ? `Day ${ageDays}` : "Empty"}
                        subtitle={activeCycle ? activeCycle.batch_name : "Flock growth age & status"}
                        icon="ActivityIcon"
                        iconColor="hsl(var(--primary))"
                        variant="gauge"
                        gaugeValue={activeCycle ? Math.min((ageDays / 35) * 100, 100) : 0}
                        gaugeColor="var(--warning)"
                    />

                    <MetricCard
                        title="Feed Stock"
                        value={stockValue}
                        subtitle="Current inventory at farm"
                        icon="PackageIcon"
                        iconColor="hsl(var(--warning))"
                        statusBadge={feedStock ? { label: 'In Stock', type: 'success' } : { label: 'Low Stock', type: 'danger' }}
                    />
                </div>

                {/* Live Monitors */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex flex-col">
                            <h3 className="font-bold text-foreground uppercase tracking-widest text-xs flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                Environmental Monitoring
                            </h3>
                            <p className="text-micro text-muted-foreground font-bold uppercase tracking-wider mt-1 ml-4 italic">Live sensor readings.</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 px-4 text-micro font-bold uppercase tracking-widest rounded-lg">
                            Sensor Calibration
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Temperature', value: `${getEnvironmentReading(sensors, 'temperature')?.toFixed(1) ?? '--'}°C`, status: getEnvironmentState(sensors, 'temperature'), icon: 'TemperatureIcon' },
                            { label: 'Humidity', value: `${getEnvironmentReading(sensors, 'humidity')?.toFixed(1) ?? '--'}%`, status: getEnvironmentState(sensors, 'humidity'), icon: 'WaterDropIcon' },
                            { label: 'Ammonia Level', value: `${getEnvironmentReading(sensors, 'ammonia')?.toFixed(1) ?? '--'} ppm`, status: getEnvironmentState(sensors, 'ammonia'), icon: 'AlertCircleIcon' },
                            { label: 'Active Nodes', value: `${sensors.filter((sensor) => sensor.isActive !== false).length}`, status: 'optimal', icon: 'SensorIcon' }
                        ].map((monitor, i) => (
                            <div key={i} className="flex flex-col items-center text-center group/item">
                                <div className={cn(
                                    "w-14 h-14 rounded-xl flex items-center justify-center mb-4 border transition-all duration-300",
                                    monitor.status === 'optimal'
                                        ? "bg-muted border-border text-primary group-hover/item:border-primary/40"
                                        : "bg-danger/5 border-danger/20 text-danger group-hover/item:border-danger/40"
                                )}>
                                    <Icon name={monitor.icon as any} size={22} />
                                </div>
                                <p className="text-micro font-bold text-muted-foreground uppercase tracking-widest">{monitor.label}</p>
                                <p className="text-lg font-bold text-foreground mt-1 tabular-nums font-data">{monitor.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Alerts & Side Profile */}
            <div className="space-y-8">
                <div className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm overflow-hidden">
                    <h3 className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 border-b border-border pb-4">
                        <Icon name="ActivityIcon" size={12} className="text-primary" />
                        Alerts & Notifications
                    </h3>
                    <div className="space-y-4">
                        {farm.status === 'active' ? (
                            <div className="flex gap-4 p-4 rounded-xl bg-danger/5 border border-danger/20 border-l-4 hover:bg-danger/10 transition-colors">
                                <Icon name="Alert01Icon" size={20} className="text-danger shrink-0 mt-0.5 animate-pulse" />
                                <div>
                                    <p className="text-micro font-bold text-danger uppercase tracking-wider">Health Alert</p>
                                    <p className="text-sm font-bold text-foreground mt-1">Unusual mortality increase.</p>
                                    <p className="text-micro text-muted-foreground font-bold mt-1 uppercase tracking-widest italic">Shed B-2 • 15m ago</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3 border border-border">
                                    <Icon name="CheckmarkCircle02Icon" size={24} className="text-primary" />
                                </div>
                                <p className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em]">No issues detected.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm group">
                    <h3 className="text-micro font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                        <Icon name="Home01Icon" size={12} className="text-primary" />
                        Farm Info
                    </h3>
                    <div className="space-y-1">
                        {[
                            { label: 'Type', value: 'Broiler Farm' },
                            { label: 'Capacity', value: `${farm.capacity.toLocaleString()} birds` },
                            { label: 'Next Cycle Date', value: 'Oct 24, 2026' }
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-border/50 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                                <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest">{item.label}</span>
                                <span className="text-sm font-bold text-foreground tabular-nums font-data">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function EnvironmentTab({
    farm,
    sensors,
    thresholds,
    history,
    period,
    isSaving,
    onPeriodChange,
    onToggleEnabled,
    onSaveThreshold,
    onAddSensor,
    onDeactivateSensor,
}: {
    farm: Farm;
    sensors: any[];
    thresholds: any[];
    history: any[];
    period: '24h' | '7d' | '30d';
    isSaving: boolean;
    onPeriodChange: (period: '24h' | '7d' | '30d') => void;
    onToggleEnabled: (enabled: boolean) => Promise<void>;
    onSaveThreshold: (input: { metricType: 'temperature' | 'humidity' | 'ammonia'; minValue?: number | null; maxValue?: number | null }) => Promise<void>;
    onAddSensor: (input: { metricType: 'temperature' | 'humidity' | 'ammonia'; locationTag: string; deviceModel?: string | null }) => Promise<void>;
    onDeactivateSensor: (nodeId: string) => Promise<void>;
}) {
    const activeSensors = sensors.filter((sensor) => sensor.isActive !== false);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Average Temperature"
                    value={`${getEnvironmentReading(sensors, 'temperature')?.toFixed(1) ?? '--'}°C`}
                    subtitle="Across active farm nodes"
                    icon="TemperatureIcon"
                    iconColor="var(--warning)"
                />
                <MetricCard
                    title="Average Humidity"
                    value={`${getEnvironmentReading(sensors, 'humidity')?.toFixed(1) ?? '--'}%`}
                    subtitle="Across active farm nodes"
                    icon="WaterDropIcon"
                    iconColor="var(--info)"
                />
                <MetricCard
                    title="Average Ammonia"
                    value={`${getEnvironmentReading(sensors, 'ammonia')?.toFixed(1) ?? '--'} ppm`}
                    subtitle="Across active farm nodes"
                    icon="AlertCircleIcon"
                    iconColor="var(--danger)"
                />
            </div>

            <SensorHistoryChart data={history} period={period} onPeriodChange={onPeriodChange} />

            <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-8">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeSensors.length === 0 ? (
                            <div className="md:col-span-2 rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                                No active sensors registered for this farm yet.
                            </div>
                        ) : (
                            activeSensors.map((sensor) => <SensorCard key={sensor.id} sensor={sensor} />)
                        )}
                    </div>
                </div>
                <FarmSensorSettings
                    isEnabled={farm.sensorsEnabled ?? false}
                    sensors={sensors}
                    thresholds={thresholds}
                    isSaving={isSaving}
                    onToggleEnabled={onToggleEnabled}
                    onSaveThreshold={onSaveThreshold}
                    onAddSensor={onAddSensor}
                    onDeactivateSensor={onDeactivateSensor}
                />
            </div>
        </div>
    );
}

function getEnvironmentReading(sensors: any[], type: 'temperature' | 'humidity' | 'ammonia') {
    const readings = sensors.filter((sensor) => sensor.type === type && sensor.reading != null && sensor.isActive !== false);
    if (readings.length === 0) return null;
    return readings.reduce((sum, sensor) => sum + sensor.reading, 0) / readings.length;
}

function getEnvironmentState(sensors: any[], type: 'temperature' | 'humidity' | 'ammonia') {
    const readings = sensors.filter((sensor) => sensor.type === type && sensor.isActive !== false);
    if (readings.some((sensor) => sensor.status === 'alert')) return 'warning';
    if (readings.some((sensor) => sensor.status === 'offline')) return 'warning';
    return 'optimal';
}

function HistoryTab({ history }: { history: any[] }) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    const completedHistory = history.filter(h => h.status === 'completed').map(h => {
        const metrics = h.performance_metrics as any[];
        const latest = metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null;
        
        // Calculate duration
        const duration = h.actual_end_date && h.start_date 
            ? `${differenceInDays(new Date(h.actual_end_date), new Date(h.start_date))} Days`
            : '--';

        return {
            id: h.batch_name || h.id,
            duration,
            harvested: h.initial_birds.toLocaleString(),
            fcr: latest?.fcr_to_date?.toFixed(2) || '--',
            profit: '--', // Not in history schema directly
            outcome: 'completed'
        };
    });

    const totalPages = Math.ceil(completedHistory.length / itemsPerPage);
    const paginatedHistory = completedHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
                <div className="flex items-center gap-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Production History</h3>
                    <span className="px-2 py-0.5 rounded-lg text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase">
                        {completedHistory.length} TOTAL
                    </span>
                </div>
                <Button variant="outline" className="bg-card border-border hover:bg-muted/50 rounded-lg h-9 px-4 text-xs font-bold uppercase tracking-widest">
                    <Icon name="Download01Icon" className="mr-2 h-4 w-4 text-primary" />
                    Export Ledger
                </Button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <TableHeader className="px-6 py-4 text-left">Batch</TableHeader>
                                <TableHeader className="px-6 py-4 text-left">Duration</TableHeader>
                                <TableHeader className="px-6 py-4 text-left">Harvested</TableHeader>
                                <TableHeader className="px-6 py-4 text-left">FCR</TableHeader>
                                <TableHeader className="px-6 py-4 text-left">Profit</TableHeader>
                                <TableHeader className="px-6 py-4 text-center">Outcome</TableHeader>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {paginatedHistory.map((row, i) => (
                                <tr key={i} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-foreground tabular-nums font-data">{row.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-muted-foreground tabular-nums lowercase italic font-data">{row.duration}</td>
                                    <td className="px-6 py-5 text-sm font-bold text-foreground tabular-nums font-data">{row.harvested} <span className="text-micro text-muted-foreground font-bold uppercase tracking-wider">birds</span></td>
                                    <td className="px-6 py-5 text-sm font-bold text-muted-foreground tabular-nums italic font-data">{row.fcr}</td>
                                    <td className="px-6 py-5 font-bold text-primary tabular-nums font-data">{row.profit}</td>
                                    <td className="px-6 py-5 text-center">
                                        <StatusBadge status={row.outcome as 'completed'} size="sm" />
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
                totalItems={completedHistory.length}
                itemName="Cycle Record"
            />
        </div>
    );
}

function PersonnelTab({ personnel }: { personnel: any[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personnel.map((p, i) => (
                <div key={i} className="bg-card border border-border p-6 rounded-xl hover:border-primary/40 transition-all flex items-center gap-5 shadow-sm overflow-hidden relative group">
                    <div className={cn(
                        "w-14 h-14 rounded-lg bg-muted border border-border flex items-center justify-center font-bold transition-all duration-300",
                        "text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                    )}>
                        {p.profiles.first_name?.[0]}{p.profiles.last_name?.[0]}
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground text-sm leading-tight">{p.profiles.first_name} {p.profiles.last_name}</h4>
                        <p className="text-micro font-bold text-muted-foreground uppercase tracking-widest mt-1">{p.role.replace('_', ' ')}</p>
                        <div className="flex items-center gap-2 mt-3 text-micro font-bold text-muted-foreground tabular-nums font-data">
                            <Icon name="MailIcon" size={14} className="text-primary" />
                            {p.profiles.email}
                        </div>
                    </div>
                </div>
            ))}
            <button className="bg-muted/10 border-2 border-dashed border-border p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-warning/10 hover:border-warning transition-all group shadow-inner">
                <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/40 transition-all">
                    <Icon name="PlusSignIcon" size={24} />
                </div>
                <span className="text-micro font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">Assign Team Member</span>
            </button>
        </div>
    );
}
