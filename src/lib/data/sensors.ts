import {
  eachDayOfInterval,
  eachHourOfInterval,
  endOfHour,
  format as formatDate,
  startOfDay,
  startOfHour,
  subDays,
} from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { Sensor } from '@/types';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase';
import { requireOrgId, requireUserId } from './context';
import { toDataLayerError } from './errors';

type SensorNodeRow = Tables<'sensor_nodes'>;
type SensorMetricRow = Tables<'sensor_node_metrics'>;
type SensorReadingRow = Tables<'sensor_readings'>;
type SensorAlertRow = Tables<'sensor_alerts'>;
type AlertThresholdRow = Tables<'alert_thresholds'>;
type SensorMetricType = Sensor['type'];

export interface SensorHistoryPoint {
  name: string;
  temperature: number;
  humidity: number;
  ammonia: number;
  [key: string]: string | number;
}

export interface SensorDashboardSummary {
  farmsWithActiveSensors: number;
  farmsWithAlerts: number;
  farmsInAlertState: Array<{ farmId: string; farmName: string; alertCount: number }>;
}

function isSensorMetricType(metricType: string): metricType is SensorMetricType {
  return metricType === 'temperature' || metricType === 'humidity' || metricType === 'ammonia';
}

function roundMetric(value: number | null | undefined) {
  return value == null ? 0 : Number(value.toFixed(2));
}

function getThresholdForMetric(
  thresholds: AlertThresholdRow[],
  farmId: string,
  nodeId: string,
  metricType: SensorMetricType,
) {
  const active = thresholds.filter((item) => item.metric_type === metricType && item.is_active);
  return (
    active.find((item) => item.sensor_id === nodeId) ??
    active.find((item) => item.farm_id === farmId) ??
    active.find((item) => item.scope_type === 'org_default') ??
    null
  );
}

function computeSensorStatus(input: {
  node: SensorNodeRow;
  latestReading: SensorReadingRow | null;
  activeAlert: SensorAlertRow | null;
}) {
  const lastSeenAt = input.latestReading?.recorded_at ?? input.node.last_seen_at;
  if (!lastSeenAt) return 'offline' as const;

  const ageMinutes = (Date.now() - new Date(lastSeenAt).getTime()) / 60000;
  if (input.node.status === 'offline' || ageMinutes > 15) return 'offline' as const;
  if (input.activeAlert) return 'alert' as const;
  return 'online' as const;
}

export async function fetchSensors(orgId: string): Promise<Sensor[]> {
  try {
    const resolvedOrgId = requireOrgId(orgId);
    const { data: nodes, error: nodesError } = await supabase
      .from('sensor_nodes')
      .select('*, sensor_node_metrics(*)')
      .eq('org_id', resolvedOrgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (nodesError) throw nodesError;

    const sensorNodes = (nodes || []) as Array<SensorNodeRow & { sensor_node_metrics?: SensorMetricRow[] | null }>;
    const metrics = sensorNodes.flatMap((node) => (node.sensor_node_metrics || []).filter((metric) => metric.is_active));
    const metricIds = metrics.map((metric) => metric.id);
    const nodeIds = sensorNodes.map((node) => node.id);

    const [readingsResult, alertsResult, thresholdsResult] = await Promise.all([
      metricIds.length
        ? supabase
            .from('sensor_readings')
            .select('*')
            .in('metric_id', metricIds)
            .order('recorded_at', { ascending: false })
            .limit(Math.max(metricIds.length * 20, 100))
        : Promise.resolve({ data: [] as SensorReadingRow[], error: null }),
      nodeIds.length
        ? supabase
            .from('sensor_alerts')
            .select('*')
            .in('node_id', nodeIds)
            .is('resolved_at', null)
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [] as SensorAlertRow[], error: null }),
      supabase
        .from('alert_thresholds')
        .select('*')
        .eq('org_id', resolvedOrgId)
        .eq('is_active', true)
        .is('deleted_at', null),
    ]);

    if (readingsResult.error) throw readingsResult.error;
    if (alertsResult.error) throw alertsResult.error;
    if (thresholdsResult.error) throw thresholdsResult.error;

    const readings = (readingsResult.data || []) as SensorReadingRow[];
    const alerts = (alertsResult.data || []) as SensorAlertRow[];
    const thresholds = (thresholdsResult.data || []) as AlertThresholdRow[];

    const latestByMetric = new Map<string, SensorReadingRow>();
    readings.forEach((reading) => {
      if (!latestByMetric.has(reading.metric_id)) {
        latestByMetric.set(reading.metric_id, reading);
      }
    });

    const activeAlertByKey = new Map<string, SensorAlertRow>();
    alerts.forEach((alert) => {
      const key = `${alert.node_id}:${alert.metric_id ?? 'any'}`;
      if (!activeAlertByKey.has(key)) {
        activeAlertByKey.set(key, alert);
      }
    });

    return sensorNodes.flatMap((node) => {
      const nodeMetrics = (node.sensor_node_metrics || []).filter((metric) => metric.is_active && isSensorMetricType(metric.metric_type));

      return nodeMetrics.map((metric) => {
        const metricType = metric.metric_type as SensorMetricType;
        const latestReading = latestByMetric.get(metric.id) ?? null;
        const activeAlert = activeAlertByKey.get(`${node.id}:${metric.id}`) ?? activeAlertByKey.get(`${node.id}:any`) ?? null;
        const threshold = getThresholdForMetric(thresholds, node.farm_id, node.id, metricType);

        return {
          id: metric.id,
          nodeId: node.id,
          metricId: metric.id,
          nodeIdCode: node.node_id_code,
          farmId: node.farm_id,
          location: node.location_tag ?? 'Unassigned',
          type: metricType,
          reading: latestReading?.value ?? null,
          unit: metric.unit,
          battery: node.battery_level ?? 0,
          status: computeSensorStatus({ node, latestReading, activeAlert }),
          firmwareVersion: node.device_model ?? 'Unknown',
          isActive: node.is_active ?? true,
          thresholdMin: threshold?.min_value ?? null,
          thresholdMax: threshold?.max_value ?? null,
          alertMessage: activeAlert?.message ?? null,
          lastReading: latestReading ? new Date(latestReading.recorded_at) : node.last_seen_at ? new Date(node.last_seen_at) : undefined,
        } satisfies Sensor;
      });
    });
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch sensors.', 'sensors.fetchSensors');
  }
}

export async function fetchSensorHistory(orgId: string, options?: { farmId?: string; days?: 1 | 7 | 30 }): Promise<SensorHistoryPoint[]> {
  try {
    const resolvedOrgId = requireOrgId(orgId);
    const days = options?.days ?? 1;
    const since = subDays(new Date(), days === 30 ? 29 : days - 1);

    let nodeIds: string[] | null = null;
    if (options?.farmId) {
      const { data: nodes, error: nodesError } = await supabase
        .from('sensor_nodes')
        .select('id')
        .eq('farm_id', options.farmId)
        .is('deleted_at', null);

      if (nodesError) throw nodesError;
      nodeIds = (nodes || []).map((node) => node.id);
      if (!nodeIds.length) return [];
    }

    let metricsQuery = supabase
      .from('sensor_node_metrics')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null);

    if (nodeIds) {
      metricsQuery = metricsQuery.in('node_id', nodeIds);
    }

    const { data: metrics, error: metricsError } = await metricsQuery;
    if (metricsError) throw metricsError;

    const typedMetrics = ((metrics || []) as SensorMetricRow[]).filter((metric) => isSensorMetricType(metric.metric_type));
    const metricMap = new Map(typedMetrics.map((metric) => [metric.id, metric.metric_type as SensorMetricType]));
    const metricIds = typedMetrics.map((metric) => metric.id);
    if (!metricIds.length) return [];

    const { data: readings, error: readingsError } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('org_id', resolvedOrgId)
      .in('metric_id', metricIds)
      .gte('recorded_at', since.toISOString())
      .order('recorded_at', { ascending: true });

    if (readingsError) throw readingsError;

    const buckets = new Map<string, { label: string; temperature: number[]; humidity: number[]; ammonia: number[] }>();
    const timeline = days === 1
      ? eachHourOfInterval({ start: startOfHour(since), end: endOfHour(new Date()) })
      : eachDayOfInterval({ start: startOfDay(since), end: startOfDay(new Date()) });

    timeline.forEach((point) => {
      const key = days === 1 ? formatDate(point, "yyyy-MM-dd'T'HH:00") : formatDate(point, 'yyyy-MM-dd');
      buckets.set(key, {
        label: days === 1 ? formatDate(point, 'HH:mm') : formatDate(point, days === 30 ? 'MMM d' : 'EEE'),
        temperature: [],
        humidity: [],
        ammonia: [],
      });
    });

    (readings || []).forEach((reading) => {
      const metricType = metricMap.get(reading.metric_id);
      if (!metricType) return;
      const bucketKey = days === 1
        ? formatDate(new Date(reading.recorded_at), "yyyy-MM-dd'T'HH:00")
        : formatDate(new Date(reading.recorded_at), 'yyyy-MM-dd');
      const bucket = buckets.get(bucketKey);
      if (!bucket) return;
      bucket[metricType].push(reading.value);
    });

    return Array.from(buckets.values()).map((bucket) => ({
      name: bucket.label,
      temperature: roundMetric(bucket.temperature.length ? bucket.temperature.reduce((sum, value) => sum + value, 0) / bucket.temperature.length : null),
      humidity: roundMetric(bucket.humidity.length ? bucket.humidity.reduce((sum, value) => sum + value, 0) / bucket.humidity.length : null),
      ammonia: roundMetric(bucket.ammonia.length ? bucket.ammonia.reduce((sum, value) => sum + value, 0) / bucket.ammonia.length : null),
    }));
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch sensor history.', 'sensors.fetchSensorHistory');
  }
}

export async function fetchAlertThresholds(orgId: string, farmId?: string): Promise<AlertThresholdRow[]> {
  try {
    let query = supabase
      .from('alert_thresholds')
      .select('*')
      .eq('org_id', requireOrgId(orgId))
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('metric_type', { ascending: true });

    if (farmId) {
      query = query.eq('farm_id', farmId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as AlertThresholdRow[];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch sensor thresholds.', 'sensors.fetchAlertThresholds');
  }
}

export async function upsertAlertThreshold(input: {
  orgId: string;
  farmId: string;
  metricType: SensorMetricType;
  minValue?: number | null;
  maxValue?: number | null;
  userId?: string | null;
}) {
  try {
    const resolvedOrgId = requireOrgId(input.orgId);
    const resolvedUserId = requireUserId(input.userId);
    const { data: existing, error: existingError } = await supabase
      .from('alert_thresholds')
      .select('id')
      .eq('org_id', resolvedOrgId)
      .eq('farm_id', input.farmId)
      .eq('metric_type', input.metricType)
      .eq('scope_type', 'farm')
      .is('sensor_id', null)
      .is('deleted_at', null)
      .maybeSingle();

    if (existingError) throw existingError;

    const payload: TablesInsert<'alert_thresholds'> | TablesUpdate<'alert_thresholds'> = {
      org_id: resolvedOrgId,
      farm_id: input.farmId,
      metric_type: input.metricType,
      min_value: input.minValue ?? null,
      max_value: input.maxValue ?? null,
      created_by: resolvedUserId,
      scope_type: 'farm',
      is_active: true,
      sensor_id: null,
    };

    const query = existing?.id
      ? supabase.from('alert_thresholds').update(payload).eq('id', existing.id)
      : supabase.from('alert_thresholds').insert(payload as TablesInsert<'alert_thresholds'>);

    const { error } = await query;
    if (error) throw error;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to save alert threshold.', 'sensors.upsertAlertThreshold');
  }
}

export async function updateFarmSensorsEnabled(farmId: string, enabled: boolean) {
  try {
    const { error } = await supabase
      .from('farms')
      .update({ sensors_enabled: enabled })
      .eq('id', farmId);

    if (error) throw error;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to update farm sensor status.', 'sensors.updateFarmSensorsEnabled');
  }
}

export async function createSensorNode(input: {
  orgId: string;
  farmId: string;
  metricType: SensorMetricType;
  locationTag: string;
  deviceModel?: string | null;
}) {
  try {
    const resolvedOrgId = requireOrgId(input.orgId);
    const nodeIdCode = `SN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const { data: node, error: nodeError } = await supabase
      .from('sensor_nodes')
      .insert({
        org_id: resolvedOrgId,
        farm_id: input.farmId,
        node_id_code: nodeIdCode,
        location_tag: input.locationTag,
        device_model: input.deviceModel ?? null,
        status: 'offline',
        is_active: true,
      })
      .select('*')
      .single();

    if (nodeError || !node) throw nodeError ?? new Error('Failed to create sensor node.');

    const unit = input.metricType === 'temperature' ? '°C' : input.metricType === 'humidity' ? '%' : 'ppm';
    const { error: metricError } = await supabase
      .from('sensor_node_metrics')
      .insert({
        node_id: node.id,
        metric_type: input.metricType,
        unit,
        is_active: true,
      });

    if (metricError) throw metricError;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to add sensor node.', 'sensors.createSensorNode');
  }
}

export async function deactivateSensorNode(nodeId: string) {
  try {
    const { error } = await supabase
      .from('sensor_nodes')
      .update({ is_active: false, status: 'offline' })
      .eq('id', nodeId);

    if (error) throw error;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to deactivate sensor node.', 'sensors.deactivateSensorNode');
  }
}

export async function fetchSensorDashboardSummary(orgId: string, farms: Array<{ id: string; name: string }>): Promise<SensorDashboardSummary> {
  const sensors = await fetchSensors(orgId);
  const activeFarmIds = new Set(sensors.filter((sensor) => sensor.isActive !== false).map((sensor) => sensor.farmId));
  const alertByFarm = new Map<string, number>();

  sensors.filter((sensor) => sensor.status === 'alert').forEach((sensor) => {
    alertByFarm.set(sensor.farmId, (alertByFarm.get(sensor.farmId) ?? 0) + 1);
  });

  return {
    farmsWithActiveSensors: activeFarmIds.size,
    farmsWithAlerts: alertByFarm.size,
    farmsInAlertState: Array.from(alertByFarm.entries()).map(([farmId, alertCount]) => ({
      farmId,
      farmName: farms.find((farm) => farm.id === farmId)?.name ?? 'Farm',
      alertCount,
    })),
  };
}