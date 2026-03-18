/**
 * Sensors Data
 * 
 * 24 Sensors: 16 online, 4 offline, 4 alert
 * Distributed across 5 farms (higher density on active farms)
 * Types: temperature, humidity, ammonia
 */

import type { Sensor } from '@/types';

export const sensors: Sensor[] = [
  // Farm 001 - Bukidnon Highlands (8 sensors, 6 online, 1 offline, 1 alert)
  {
    id: 'sen-001-temp',
    farmId: 'farm-001',
    location: 'North House A',
    type: 'temperature',
    reading: 26.5,
    unit: '°C',
    battery: 78,
    status: 'online',
    firmwareVersion: '2.1.3',
    lastReading: new Date('2026-02-03T09:30:00'),
  },
  {
    id: 'sen-001-humid',
    farmId: 'farm-001',
    location: 'North House A',
    type: 'humidity',
    reading: 65,
    unit: '%',
    battery: 82,
    status: 'online',
    firmwareVersion: '2.1.3',
    lastReading: new Date('2026-02-03T09:30:00'),
  },
  {
    id: 'sen-001-nh3',
    farmId: 'farm-001',
    location: 'North House A',
    type: 'ammonia',
    reading: 18,
    unit: 'ppm',
    battery: 45,
    status: 'alert',
    firmwareVersion: '2.1.3',
    lastReading: new Date('2026-02-03T09:15:00'),
  },
  {
    id: 'sen-002-temp',
    farmId: 'farm-001',
    location: 'South House B',
    type: 'temperature',
    reading: 25.8,
    unit: '°C',
    battery: 91,
    status: 'online',
    firmwareVersion: '2.1.4',
    lastReading: new Date('2026-02-03T09:30:00'),
  },
  {
    id: 'sen-002-humid',
    farmId: 'farm-001',
    location: 'South House B',
    type: 'humidity',
    reading: 68,
    unit: '%',
    battery: 88,
    status: 'online',
    firmwareVersion: '2.1.4',
    lastReading: new Date('2026-02-03T09:30:00'),
  },
  {
    id: 'sen-002-nh3',
    farmId: 'farm-001',
    location: 'South House B',
    type: 'ammonia',
    reading: 22,
    unit: 'ppm',
    battery: 89,
    status: 'online',
    firmwareVersion: '2.1.4',
    lastReading: new Date('2026-02-03T09:30:00'),
  },
  {
    id: 'sen-003-temp',
    farmId: 'farm-001',
    location: 'East House C',
    type: 'temperature',
    reading: null,
    unit: '°C',
    battery: 12,
    status: 'offline',
    firmwareVersion: '2.0.8',
    lastReading: new Date('2026-02-01T14:20:00'),
  },
  {
    id: 'sen-003-humid',
    farmId: 'farm-001',
    location: 'East House C',
    type: 'humidity',
    reading: 72,
    unit: '%',
    battery: 95,
    status: 'online',
    firmwareVersion: '2.1.4',
    lastReading: new Date('2026-02-03T09:30:00'),
  },
  
  // Farm 002 - Cagayan Valley (6 sensors, 5 online, 1 offline)
  {
    id: 'sen-004-temp',
    farmId: 'farm-002',
    location: 'Building 1',
    type: 'temperature',
    reading: 24.2,
    unit: '°C',
    battery: 85,
    status: 'online',
    firmwareVersion: '2.1.3',
    lastReading: new Date('2026-02-03T09:28:00'),
  },
  {
    id: 'sen-004-humid',
    farmId: 'farm-002',
    location: 'Building 1',
    type: 'humidity',
    reading: 61,
    unit: '%',
    battery: 87,
    status: 'online',
    firmwareVersion: '2.1.3',
    lastReading: new Date('2026-02-03T09:28:00'),
  },
  {
    id: 'sen-005-temp',
    farmId: 'farm-002',
    location: 'Building 2',
    type: 'temperature',
    reading: 23.9,
    unit: '°C',
    battery: 79,
    status: 'online',
    firmwareVersion: '2.1.3',
    lastReading: new Date('2026-02-03T09:28:00'),
  },
  {
    id: 'sen-005-humid',
    farmId: 'farm-002',
    location: 'Building 2',
    type: 'humidity',
    reading: 63,
    unit: '%',
    battery: 81,
    status: 'online',
    firmwareVersion: '2.1.3',
    lastReading: new Date('2026-02-03T09:28:00'),
  },
  {
    id: 'sen-005-nh3',
    farmId: 'farm-002',
    location: 'Building 2',
    type: 'ammonia',
    reading: 12,
    unit: 'ppm',
    battery: 76,
    status: 'online',
    firmwareVersion: '2.1.3',
    lastReading: new Date('2026-02-03T09:28:00'),
  },
  {
    id: 'sen-006-temp',
    farmId: 'farm-002',
    location: 'Building 3',
    type: 'temperature',
    reading: null,
    unit: '°C',
    battery: 5,
    status: 'offline',
    firmwareVersion: '2.0.6',
    lastReading: new Date('2026-01-30T11:45:00'),
  },
  
  // Farm 003 - Tarlac Plains (5 sensors, 4 online, 1 alert)
  {
    id: 'sen-007-temp',
    farmId: 'farm-003',
    location: 'Main Shed',
    type: 'temperature',
    reading: 27.1,
    unit: '°C',
    battery: 73,
    status: 'alert',
    firmwareVersion: '2.1.2',
    lastReading: new Date('2026-02-03T09:25:00'),
  },
  {
    id: 'sen-007-humid',
    farmId: 'farm-003',
    location: 'Main Shed',
    type: 'humidity',
    reading: 74,
    unit: '%',
    battery: 77,
    status: 'online',
    firmwareVersion: '2.1.2',
    lastReading: new Date('2026-02-03T09:25:00'),
  },
  {
    id: 'sen-008-temp',
    farmId: 'farm-003',
    location: 'Secondary Shed',
    type: 'temperature',
    reading: 25.5,
    unit: '°C',
    battery: 92,
    status: 'online',
    firmwareVersion: '2.1.5',
    lastReading: new Date('2026-02-03T09:25:00'),
  },
  {
    id: 'sen-008-humid',
    farmId: 'farm-003',
    location: 'Secondary Shed',
    type: 'humidity',
    reading: 66,
    unit: '%',
    battery: 94,
    status: 'online',
    firmwareVersion: '2.1.5',
    lastReading: new Date('2026-02-03T09:25:00'),
  },
  {
    id: 'sen-008-nh3',
    farmId: 'farm-003',
    location: 'Secondary Shed',
    type: 'ammonia',
    reading: 8,
    unit: 'ppm',
    battery: 90,
    status: 'online',
    firmwareVersion: '2.1.5',
    lastReading: new Date('2026-02-03T09:25:00'),
  },
  
  // Farm 004 - Pampanga Fields (2 sensors, both offline - empty farm)
  {
    id: 'sen-009-temp',
    farmId: 'farm-004',
    location: 'House A',
    type: 'temperature',
    reading: null,
    unit: '°C',
    battery: 0,
    status: 'offline',
    firmwareVersion: '2.0.5',
    lastReading: new Date('2026-01-20T08:00:00'),
  },
  {
    id: 'sen-009-humid',
    farmId: 'farm-004',
    location: 'House A',
    type: 'humidity',
    reading: null,
    unit: '%',
    battery: 0,
    status: 'offline',
    firmwareVersion: '2.0.5',
    lastReading: new Date('2026-01-20T08:00:00'),
  },
  
  // Farm 005 - Davao Del Sur (3 sensors, 1 online, 2 offline - maintenance)
  {
    id: 'sen-010-temp',
    farmId: 'farm-005',
    location: 'Zone 1',
    type: 'temperature',
    reading: 28.3,
    unit: '°C',
    battery: 45,
    status: 'alert',
    firmwareVersion: '2.1.1',
    lastReading: new Date('2026-02-03T08:15:00'),
  },
  {
    id: 'sen-010-humid',
    farmId: 'farm-005',
    location: 'Zone 1',
    type: 'humidity',
    reading: null,
    unit: '%',
    battery: 0,
    status: 'offline',
    firmwareVersion: '2.1.1',
    lastReading: new Date('2026-01-29T16:30:00'),
  },
  {
    id: 'sen-011-temp',
    farmId: 'farm-005',
    location: 'Zone 2',
    type: 'temperature',
    reading: null,
    unit: '°C',
    battery: 0,
    status: 'offline',
    firmwareVersion: '2.0.9',
    lastReading: new Date('2026-01-25T10:00:00'),
  },
];

// Helper functions
export function getSensorById(id: string): Sensor | undefined {
  return sensors.find(sensor => sensor.id === id);
}

export function getSensorsByFarmId(farmId: string): Sensor[] {
  return sensors.filter(sensor => sensor.farmId === farmId);
}

export function getSensorsByStatus(status: Sensor['status']): Sensor[] {
  return sensors.filter(sensor => sensor.status === status);
}

export function getSensorsByType(type: Sensor['type']): Sensor[] {
  return sensors.filter(sensor => sensor.type === type);
}

export function getOnlineSensorsCount(): number {
  return sensors.filter(s => s.status === 'online').length;
}

export function getOfflineSensorsCount(): number {
  return sensors.filter(s => s.status === 'offline').length;
}

export function getAlertSensorsCount(): number {
  return sensors.filter(s => s.status === 'alert').length;
}

export function getAverageTemperature(farmId?: string): number | null {
  const temps = sensors.filter(s => 
    s.type === 'temperature' && 
    s.reading !== null &&
    (!farmId || s.farmId === farmId)
  );
  
  if (temps.length === 0) return null;
  return temps.reduce((sum, s) => sum + (s.reading || 0), 0) / temps.length;
}

export function getAverageHumidity(farmId?: string): number | null {
  const humidities = sensors.filter(s => 
    s.type === 'humidity' && 
    s.reading !== null &&
    (!farmId || s.farmId === farmId)
  );
  
  if (humidities.length === 0) return null;
  return humidities.reduce((sum, s) => sum + (s.reading || 0), 0) / humidities.length;
}

export function getAverageAmmonia(farmId?: string): number | null {
  const ammonia = sensors.filter(s => 
    s.type === 'ammonia' && 
    s.reading !== null &&
    (!farmId || s.farmId === farmId)
  );
  
  if (ammonia.length === 0) return null;
  return ammonia.reduce((sum, s) => sum + (s.reading || 0), 0) / ammonia.length;
}

export function getLowBatterySensors(threshold: number = 20): Sensor[] {
  return sensors.filter(s => s.battery <= threshold && s.battery > 0);
}
