/**
 * Sensors Page
 * 
 * Main page for sensor management. Displays:
 * - Live sensor metrics chart (Temperature, Humidity, Ammonia)
 * - Sensor devices table with filtering
 * - Add sensor and alert configuration sheets
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageTitle } from '@/components/ui/page-title';
import { TableHeader } from '@/components/ui/table-header';
import { MetricCard, DataTablePagination, FarmFilter, StatusBadge } from '@/components/shared';
import { AddSensorSheet } from '@/components/sheets/AddSensorSheet';
import { AlertConfigSheet } from '@/components/sheets/AlertConfigSheet';
import { MetricChart } from '@/components/shared/MetricChart';
import { useSensorsStore } from '@/stores/useSensorsStore';
import { useFarmsStore } from '@/stores/useFarmsStore';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import type { Sensor, Farm } from '@/types';

type TimePeriod = '24h' | '7d';

interface ChartDataPoint {
  name: string;
  temperature: number;
  humidity: number;
  ammonia: number;
  [key: string]: string | number;
}

function generateMockChartData(period: TimePeriod): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const points = period === '24h' ? 24 : 7;
  const startHour = period === '24h' ? 0 : 12;

  for (let i = 0; i < points; i++) {
    const hour = (startHour + i) % 24;
    data.push({
      name: period === '24h' ? `${hour}:00` : `Day ${i + 1}`,
      temperature: 24 + Math.random() * 4,
      humidity: 60 + Math.random() * 20,
      ammonia: 10 + Math.random() * 15,
    });
  }

  return data;
}

function SensorTable({ sensors, farms }: { sensors: Sensor[]; farms: Farm[] }) {

  const getSensorStyles = (type: Sensor['type'], status: Sensor['status']) => {
    const isOffline = status === 'offline';
    const isAlert = status === 'alert';

    switch (type) {
      case 'temperature':
        return {
          icon: 'TemperatureIcon' as const,
          label: 'Temperature',
          color: isAlert ? 'text-danger' : isOffline ? 'text-muted-foreground' : 'text-info',
          bg: isAlert ? 'bg-danger/10' : isOffline ? 'bg-muted/10' : 'bg-info/10',
          border: isAlert ? 'border-danger/20' : isOffline ? 'border-muted/20' : 'border-info/20',
          badgeClass: 'badge-warning',
        };
      case 'humidity':
        return {
          icon: 'WaterDropIcon' as const,
          label: 'Humidity',
          color: isAlert ? 'text-danger' : isOffline ? 'text-muted-foreground' : 'text-warning',
          bg: isAlert ? 'bg-danger/10' : isOffline ? 'bg-muted/10' : 'bg-warning/10',
          border: isAlert ? 'border-danger/20' : isOffline ? 'border-muted/20' : 'border-warning/20',
          badgeClass: 'badge-info',
        };
      case 'ammonia':
        return {
          icon: 'WindIcon' as const,
          label: 'Ammonia',
          color: isAlert ? 'text-danger' : isOffline ? 'text-muted-foreground' : 'text-primary',
          bg: isAlert ? 'bg-danger/10' : isOffline ? 'bg-muted/10' : 'bg-primary/10',
          border: isAlert ? 'border-danger/20' : isOffline ? 'border-muted/20' : 'border-primary/20',
          badgeClass: 'badge-danger',
        };
      case 'water_pressure' as any: // In case this exists in data
        return {
          icon: 'DashboardIcon',
          label: 'Water Pressure',
          color: 'text-muted-foreground',
          bg: 'bg-muted/10',
          border: 'border-muted/20',
          badgeClass: 'badge-muted',
        };
      default:
        return {
          icon: 'SensorIcon' as const,
          label: type,
          color: isAlert ? 'text-danger' : 'text-muted-foreground',
          bg: isAlert ? 'bg-danger/10' : 'bg-muted/10',
          border: isAlert ? 'border-danger/20' : 'border-muted/20',
          badgeClass: 'badge-muted',
        };
    }
  };

  const getBatteryStyles = (battery: number) => {
    if (battery <= 20) return { bg: 'bg-danger', text: 'text-danger' };
    if (battery <= 50) return { bg: 'bg-warning', text: 'text-warning' };
    return { bg: 'bg-primary', text: 'text-primary' };
  };

  return (
    <div className="overflow-x-auto relative z-10">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/20 text-muted-foreground">
            <TableHeader className="px-6 py-4 text-left">Node ID</TableHeader>
            <TableHeader className="px-6 py-4 text-left">Location</TableHeader>
            <TableHeader className="px-6 py-4 text-left">Metric Type</TableHeader>
            <TableHeader className="px-6 py-4 text-right">Reading</TableHeader>
            <TableHeader className="px-6 py-4 text-center">Battery</TableHeader>
            <TableHeader className="px-6 py-4 text-center">Status</TableHeader>
            <TableHeader className="px-6 py-4 text-center">Actions</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {sensors.map((sensor) => {
            const styles = getSensorStyles(sensor.type, sensor.status);
            const battery = getBatteryStyles(sensor.battery);

            return (
              <tr
                key={sensor.id}
                className="hover:bg-row-hover transition-colors transition-[width] group bg-background"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner transition-transform",
                      styles.bg,
                      styles.border,
                      styles.color
                    )}>
                      <Icon name={styles.icon as any} size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block font-data">{sensor.id}</span>
                      <span className="text-micro font-semibold text-muted-foreground uppercase tracking-widest leading-none mt-1">Sensor Node</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">{sensor.location}</span>
                    <span className="text-micro font-semibold text-muted-foreground uppercase tracking-widest leading-none mt-1">{farms.find(f => f.id === sensor.farmId)?.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn("badge badge-pill", styles.badgeClass)}>
                    {styles.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold tabular-nums">
                  {sensor.reading !== null ? (
                    <div className="flex flex-col items-end">
                      <div className="flex items-baseline justify-end gap-1 translate-y-1">
                        <span className="text-xl tracking-tight text-foreground font-data">{sensor.reading.toFixed(1)}</span>
                        <span className="text-micro text-muted-foreground uppercase tracking-widest font-bold">{sensor.unit}</span>
                      </div>
                      <div className="w-10 h-1 bg-muted/30 rounded-full mt-2 overflow-hidden">
                        <div className={cn("h-full transition-[width] transition-[height] duration-1000", styles.bg.replace('/10', '/80'))} style={{ width: `${Math.min((sensor.reading / (sensor.type === 'temperature' ? 40 : 100)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground font-bold text-micro tracking-widest">NO DATA</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className="w-16 h-1.5 bg-muted/60 rounded-full overflow-hidden border border-border/20 p-[1px]">
                      <div
                        className={cn('h-full rounded-full transition-[height] duration-1000', battery.bg)}
                        style={{ width: `${sensor.battery}%` }}
                      />
                    </div>
                    <span className={cn("text-micro font-bold tabular-nums tracking-widest uppercase font-data", battery.text)}>{sensor.battery}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <StatusBadge status={sensor.status as any} size="sm" />
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground transition-colors transition-[width] transition-[height] border border-border/40 hover:border-border/60">
                      <Icon name="EyeIcon" size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground transition-colors transition-[width] transition-[height] border border-border/40 hover:border-border/60">
                      <Icon name="MoreVerticalCircle01Icon" size={14} />
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

// Local StatCard component removed in favor of shared component

export default function Sensors() {
  const [timePeriod, setTimePeriod] = React.useState<TimePeriod>('24h');
  const [selectedFarm, setSelectedFarm] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isAddSensorOpen, setIsAddSensorOpen] = React.useState(false);
  const [isAlertConfigOpen, setIsAlertConfigOpen] = React.useState(false);
  const itemsPerPage = 8;

  const sensors = useSensorsStore((state) => state.sensors);
  const farms = useFarmsStore((state) => state.farms);
  const onlineCount = useSensorsStore((state) => state.onlineCount);
  const offlineCount = useSensorsStore((state) => state.offlineCount);
  const alertCount = useSensorsStore((state) => state.alertCount);
  const averageTemperature = useSensorsStore((state) => state.averageTemperature);

  const filteredSensors = React.useMemo(() => {
    return sensors.filter((sensor) => {
      const matchesFarm = !selectedFarm || sensor.farmId === selectedFarm;
      const matchesSearch =
        sensor.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sensor.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFarm && matchesSearch;
    });
  }, [sensors, selectedFarm, searchQuery]);

  const chartData = React.useMemo(() => generateMockChartData(timePeriod), [timePeriod]);

  const totalPages = Math.ceil(filteredSensors.length / itemsPerPage);
  const paginatedSensors = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSensors.slice(start, start + itemsPerPage);
  }, [filteredSensors, currentPage]);

  // Reset to first page when search or farm selection changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFarm]);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-background">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <PageTitle>Sensors</PageTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor environmental conditions and sensor device status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsAlertConfigOpen(true)}
            className="active:scale-95 group"
          >
            <Icon name="NotificationIcon" className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            Alert Settings
          </Button>

          <FarmFilter
            value={selectedFarm}
            onValueChange={setSelectedFarm}
            variant="default"
            allOptionLabel="All Farms"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard
          title="Online"
          value={`${onlineCount} / ${sensors.length}`}
          icon="WifiIcon"
          iconColor="text-success"
          trend={{ value: 100, direction: 'up', label: 'Network Uptime' }}
        />
        <MetricCard
          title="Offline"
          value={offlineCount}
          icon="WifiOffIcon"
          iconColor={offlineCount > 0 ? "text-danger" : "text-muted-foreground"}
          trend={offlineCount > 0 ? { value: offlineCount, direction: 'up', label: 'Nodes Disconnected' } : undefined}
        />
        <MetricCard
          title="Active Alerts"
          value={alertCount}
          icon="AlertCircleIcon"
          iconColor={alertCount > 0 ? "text-warning" : "text-muted-foreground"}
          trend={alertCount > 0
            ? { value: alertCount, direction: 'up', label: 'Requires Attention' }
            : { value: 'Normal', direction: 'down', label: 'System Healthy' }
          }
        />
        <MetricCard
          title="Avg Temperature"
          value={averageTemperature !== null ? `${averageTemperature.toFixed(1)}°C` : '--'}
          icon="TemperatureIcon"
          iconColor="var(--warning)"
          trend={{ value: '0.4°C', direction: 'up', label: 'vs. Yesterday' }}
        />
      </div>

      {/* Live Sensor Metrics Chart */}
      <div className="mb-8">
        <MetricChart
          title="Live Sensor Metrics"
          subtitle="Environmental readings from all connected sensors"
          data={chartData}
          series={[
            { key: 'temperature', name: 'Temperature', color: 'hsl(var(--chart-1))', unit: '°C' },
            { key: 'humidity', name: 'Humidity', color: 'hsl(var(--chart-4))', unit: '%' },
            { key: 'ammonia', name: 'Ammonia', color: 'hsl(var(--chart-3))', unit: 'ppm' },
          ]}
          periods={[
            { label: '24 Hours', value: '24h' },
            { label: '7 Days', value: '7d' },
          ]}
          activePeriod={timePeriod}
          onPeriodChange={(period) => setTimePeriod(period as TimePeriod)}
          height={320}
        />
      </div>

      {/* Sensor Devices Table */}
      {/* Sensor Devices Section */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sensors</h3>
            <span className="px-2 py-0.5 rounded-[4px] text-micro font-bold bg-muted/50 text-muted-foreground border border-border/50 tracking-wide uppercase font-data">
              {filteredSensors.length} TOTAL
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Icon
                name="SearchIcon"
                size={14}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-0 text-xs rounded-lg h-9"
              />
            </div>

            <Button
              onClick={() => setIsAddSensorOpen(true)}
              className="h-9 rounded-lg active:scale-95 whitespace-nowrap"
            >
              <Icon name="PlusSignIcon" className="mr-2 h-4 w-4" />
              Add Sensor
            </Button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm relative">
          <SensorTable sensors={paginatedSensors} farms={farms} />
        </div>

        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={itemsPerPage}
          totalItems={filteredSensors.length}
          itemName="Active Nodes"
        />
      </div>

      {/* Sheets */}
      <AddSensorSheet isOpen={isAddSensorOpen} onClose={() => setIsAddSensorOpen(false)} />
      <AlertConfigSheet isOpen={isAlertConfigOpen} onClose={() => setIsAlertConfigOpen(false)} />
    </div>
  );
}
