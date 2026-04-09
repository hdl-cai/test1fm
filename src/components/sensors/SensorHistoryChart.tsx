import { MetricChart } from '@/components/shared';
import type { SensorHistoryPoint } from '@/lib/data/sensors';

interface SensorHistoryChartProps {
  data: SensorHistoryPoint[];
  period: '24h' | '7d' | '30d';
  onPeriodChange: (period: '24h' | '7d' | '30d') => void;
}

export function SensorHistoryChart({ data, period, onPeriodChange }: SensorHistoryChartProps) {
  return (
    <MetricChart
      title="Historical Readings"
      subtitle="Temperature, humidity, and ammonia trends"
      data={data}
      series={[
        { key: 'temperature', name: 'Temperature', color: '#F59E0B', unit: '°C' },
        { key: 'humidity', name: 'Humidity', color: '#0EA5E9', unit: '%' },
        { key: 'ammonia', name: 'Ammonia', color: '#EF4444', unit: 'ppm' },
      ]}
      periods={[
        { label: '24H', value: '24h' },
        { label: '7D', value: '7d' },
        { label: '30D', value: '30d' },
      ]}
      activePeriod={period}
      onPeriodChange={(value) => onPeriodChange(value as '24h' | '7d' | '30d')}
      height={280}
    />
  );
}