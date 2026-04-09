import { create } from 'zustand';
import type { Sensor } from '@/types';
import type { Tables } from '@/types/supabase';
import {
  createSensorNode,
  deactivateSensorNode,
  fetchAlertThresholds,
  fetchSensorDashboardSummary,
  fetchSensorHistory,
  fetchSensors,
  type SensorDashboardSummary,
  type SensorHistoryPoint,
  updateFarmSensorsEnabled,
  upsertAlertThreshold,
} from '@/lib/data/sensors';
import { getErrorMessage } from '@/lib/data/errors';

type AlertThresholdRow = Tables<'alert_thresholds'>;

export interface SensorsState {
  sensors: Sensor[];
  history: SensorHistoryPoint[];
  thresholds: AlertThresholdRow[];
  summary: SensorDashboardSummary | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  onlineCount: number;
  offlineCount: number;
  alertCount: number;
  lowBatteryCount: number;
  averageTemperature: number | null;
  averageHumidity: number | null;
  averageAmmonia: number | null;

  fetchSensors: (orgId: string) => Promise<void>;
  fetchHistory: (orgId: string, options?: { farmId?: string; days?: 1 | 7 | 30 }) => Promise<void>;
  fetchThresholds: (orgId: string, farmId?: string) => Promise<void>;
  fetchSummary: (orgId: string, farms: Array<{ id: string; name: string }>) => Promise<void>;
  saveThreshold: (input: { orgId: string; farmId: string; metricType: Sensor['type']; minValue?: number | null; maxValue?: number | null; userId: string }) => Promise<void>;
  toggleFarmSensors: (farmId: string, enabled: boolean) => Promise<void>;
  addSensorNode: (input: { orgId: string; farmId: string; metricType: Sensor['type']; locationTag: string; deviceModel?: string | null }) => Promise<void>;
  deactivateSensorNode: (nodeId: string) => Promise<void>;

  getSensorsByFarmId: (farmId: string) => Sensor[];
  getSensorsByStatus: (status: Sensor['status']) => Sensor[];
  getSensorsByType: (type: Sensor['type']) => Sensor[];
  getAverageTemperature: (farmId?: string) => number | null;
  getAverageHumidity: (farmId?: string) => number | null;
  getAverageAmmonia: (farmId?: string) => number | null;
  getLowBatterySensors: (threshold?: number) => Sensor[];
}

function averageForSensors(sensors: Sensor[], type: Sensor['type']) {
  const filtered = sensors.filter((sensor) => sensor.type === type && sensor.reading !== null);
  if (filtered.length === 0) return null;
  return filtered.reduce((sum, sensor) => sum + (sensor.reading || 0), 0) / filtered.length;
}

export const useSensorsStore = create<SensorsState>((set, get) => ({
  sensors: [],
  history: [],
  thresholds: [],
  summary: null,
  isLoading: false,
  isSaving: false,
  error: null,

  get onlineCount() {
    return get().sensors.filter((sensor) => sensor.status === 'online').length;
  },
  get offlineCount() {
    return get().sensors.filter((sensor) => sensor.status === 'offline').length;
  },
  get alertCount() {
    return get().sensors.filter((sensor) => sensor.status === 'alert').length;
  },
  get lowBatteryCount() {
    return get().sensors.filter((sensor) => sensor.battery <= 20 && sensor.battery > 0).length;
  },
  get averageTemperature() {
    return averageForSensors(get().sensors, 'temperature');
  },
  get averageHumidity() {
    return averageForSensors(get().sensors, 'humidity');
  },
  get averageAmmonia() {
    return averageForSensors(get().sensors, 'ammonia');
  },

  fetchSensors: async (orgId) => {
    set({ isLoading: true, error: null });
    try {
      const sensors = await fetchSensors(orgId);
      set({ sensors, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to fetch sensors.'), isLoading: false });
    }
  },

  fetchHistory: async (orgId, options) => {
    set({ isLoading: true, error: null });
    try {
      const history = await fetchSensorHistory(orgId, options);
      set({ history, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to fetch sensor history.'), isLoading: false });
    }
  },

  fetchThresholds: async (orgId, farmId) => {
    set({ isLoading: true, error: null });
    try {
      const thresholds = await fetchAlertThresholds(orgId, farmId);
      set({ thresholds, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to fetch sensor thresholds.'), isLoading: false });
    }
  },

  fetchSummary: async (orgId, farms) => {
    try {
      const summary = await fetchSensorDashboardSummary(orgId, farms);
      set({ summary });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to fetch sensor summary.') });
    }
  },

  saveThreshold: async (input) => {
    set({ isSaving: true, error: null });
    try {
      await upsertAlertThreshold(input);
      const thresholds = await fetchAlertThresholds(input.orgId, input.farmId);
      set({ thresholds, isSaving: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to save threshold.'), isSaving: false });
      throw error;
    }
  },

  toggleFarmSensors: async (farmId, enabled) => {
    set({ isSaving: true, error: null });
    try {
      await updateFarmSensorsEnabled(farmId, enabled);
      set({ isSaving: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to update farm sensor status.'), isSaving: false });
      throw error;
    }
  },

  addSensorNode: async (input) => {
    set({ isSaving: true, error: null });
    try {
      await createSensorNode(input);
      const sensors = await fetchSensors(input.orgId);
      set({ sensors, isSaving: false });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to add sensor.'), isSaving: false });
      throw error;
    }
  },

  deactivateSensorNode: async (nodeId) => {
    set({ isSaving: true, error: null });
    try {
      await deactivateSensorNode(nodeId);
      set((state) => ({
        sensors: state.sensors.map((sensor) =>
          sensor.nodeId === nodeId ? { ...sensor, isActive: false, status: 'offline' } : sensor,
        ),
        isSaving: false,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to deactivate sensor.'), isSaving: false });
      throw error;
    }
  },

  getSensorsByFarmId: (farmId) => get().sensors.filter((sensor) => sensor.farmId === farmId),
  getSensorsByStatus: (status) => get().sensors.filter((sensor) => sensor.status === status),
  getSensorsByType: (type) => get().sensors.filter((sensor) => sensor.type === type),
  getAverageTemperature: (farmId) => averageForSensors(farmId ? get().getSensorsByFarmId(farmId) : get().sensors, 'temperature'),
  getAverageHumidity: (farmId) => averageForSensors(farmId ? get().getSensorsByFarmId(farmId) : get().sensors, 'humidity'),
  getAverageAmmonia: (farmId) => averageForSensors(farmId ? get().getSensorsByFarmId(farmId) : get().sensors, 'ammonia'),
  getLowBatterySensors: (threshold = 20) => get().sensors.filter((sensor) => sensor.battery <= threshold && sensor.battery > 0),
}));
