/**
 * Sensors Store
 * Zustand store for sensor management
 */

import { create } from 'zustand';
import type { Sensor } from '@/types';
import { sensors } from '@/data/sensors';

export interface SensorsState {
  // Data
  sensors: Sensor[];
  
  // Computed values
  onlineCount: number;
  offlineCount: number;
  alertCount: number;
  lowBatteryCount: number;
  averageTemperature: number | null;
  averageHumidity: number | null;
  averageAmmonia: number | null;
  
  // Actions
  setSensors: (sensors: Sensor[]) => void;
  addSensor: (sensor: Omit<Sensor, 'id' | 'lastReading'>) => void;
  updateSensor: (sensorId: string, updates: Partial<Sensor>) => void;
  updateSensorReading: (sensorId: string, reading: number | null) => void;
  
  // Selectors
  getSensorsByFarmId: (farmId: string) => Sensor[];
  getSensorsByStatus: (status: Sensor['status']) => Sensor[];
  getSensorsByType: (type: Sensor['type']) => Sensor[];
  getAverageTemperature: (farmId?: string) => number | null;
  getAverageHumidity: (farmId?: string) => number | null;
  getAverageAmmonia: (farmId?: string) => number | null;
  getLowBatterySensors: (threshold?: number) => Sensor[];
}

export const useSensorsStore = create<SensorsState>((set, get) => ({
  // Initial state
  sensors: sensors,
  
  // Computed values
  get onlineCount() {
    return get().sensors.filter(s => s.status === 'online').length;
  },
  get offlineCount() {
    return get().sensors.filter(s => s.status === 'offline').length;
  },
  get alertCount() {
    return get().sensors.filter(s => s.status === 'alert').length;
  },
  get lowBatteryCount() {
    return get().sensors.filter(s => s.battery <= 20 && s.battery > 0).length;
  },
  get averageTemperature() {
    const temps = get().sensors.filter(s => s.type === 'temperature' && s.reading !== null);
    if (temps.length === 0) return null;
    return temps.reduce((sum, s) => sum + (s.reading || 0), 0) / temps.length;
  },
  get averageHumidity() {
    const humidities = get().sensors.filter(s => s.type === 'humidity' && s.reading !== null);
    if (humidities.length === 0) return null;
    return humidities.reduce((sum, s) => sum + (s.reading || 0), 0) / humidities.length;
  },
  get averageAmmonia() {
    const ammonia = get().sensors.filter(s => s.type === 'ammonia' && s.reading !== null);
    if (ammonia.length === 0) return null;
    return ammonia.reduce((sum, s) => sum + (s.reading || 0), 0) / ammonia.length;
  },
  
  // Actions
  setSensors: (newSensors) => set({ sensors: newSensors }),
  
  addSensor: (sensorData) => set((state) => {
    const existingIds = state.sensors.map((s) => s.id);
    let counter = 1;
    while (existingIds.includes(`sen-${String(counter).padStart(3, '0')}`)) {
      counter++;
    }
    return {
      sensors: [
        ...state.sensors,
        {
          ...sensorData,
          id: `sen-${String(counter).padStart(3, '0')}`,
          lastReading: new Date(),
        },
      ],
    };
  }),
  
  updateSensor: (sensorId, updates) => set((state) => ({
    sensors: state.sensors.map(sensor => 
      sensor.id === sensorId 
        ? { ...sensor, ...updates }
        : sensor
    ),
  })),
  
  updateSensorReading: (sensorId, reading) => set((state) => ({
    sensors: state.sensors.map(sensor => 
      sensor.id === sensorId 
        ? { 
            ...sensor, 
            reading, 
            lastReading: new Date() 
          }
        : sensor
    ),
  })),
  
  // Selectors
  getSensorsByFarmId: (farmId) => get().sensors.filter(s => s.farmId === farmId),
  getSensorsByStatus: (status) => get().sensors.filter(s => s.status === status),
  getSensorsByType: (type) => get().sensors.filter(s => s.type === type),
  getAverageTemperature: (farmId) => {
    const temps = get().sensors.filter(s => 
      s.type === 'temperature' && s.reading !== null && (!farmId || s.farmId === farmId)
    );
    if (temps.length === 0) return null;
    return temps.reduce((sum, s) => sum + (s.reading || 0), 0) / temps.length;
  },
  getAverageHumidity: (farmId) => {
    const humidities = get().sensors.filter(s => 
      s.type === 'humidity' && s.reading !== null && (!farmId || s.farmId === farmId)
    );
    if (humidities.length === 0) return null;
    return humidities.reduce((sum, s) => sum + (s.reading || 0), 0) / humidities.length;
  },
  getAverageAmmonia: (farmId) => {
    const ammonia = get().sensors.filter(s => 
      s.type === 'ammonia' && s.reading !== null && (!farmId || s.farmId === farmId)
    );
    if (ammonia.length === 0) return null;
    return ammonia.reduce((sum, s) => sum + (s.reading || 0), 0) / ammonia.length;
  },
  getLowBatterySensors: (threshold = 20) => 
    get().sensors.filter(s => s.battery <= threshold && s.battery > 0),
}));
