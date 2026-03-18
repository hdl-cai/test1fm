import type { Alert } from '@/components/shared/AlertCard';

export const mockAlerts: Alert[] = [
    {
        id: 'alert-001',
        type: 'critical',
        title: 'High Ammonia Levels',
        description: 'North House A ammonia sensor reading 18 ppm, exceeds safe threshold of 15 ppm.',
        farmName: 'Bukidnon Highlands',
        time: '10 minutes ago',
    },
    {
        id: 'alert-002',
        type: 'warning',
        title: 'Sensor Offline',
        description: 'Temperature sensor sen-003-temp in East House C has been offline for 2 days.',
        farmName: 'Bukidnon Highlands',
        time: '2 hours ago',
    },
    {
        id: 'alert-003',
        type: 'critical',
        title: 'Low Battery Alert',
        description: 'Ammonia sensor battery at 12%. Schedule replacement within 24 hours.',
        farmName: 'Cagayan Valley',
        time: '4 hours ago',
    },
    {
        id: 'alert-004',
        type: 'warning',
        title: 'High Temperature',
        description: 'Main Shed temperature at 27.1°C, approaching maximum threshold of 28°C.',
        farmName: 'Tarlac Plains',
        time: '6 hours ago',
    },
    {
        id: 'alert-005',
        type: 'info',
        title: 'Feed Stock Low',
        description: 'Cagayan-2025-01 batch feed stock below 30% threshold. Order recommended.',
        farmName: 'Cagayan Valley',
        time: '8 hours ago',
    },
];
