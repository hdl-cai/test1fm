import { useMemo } from 'react';
import { MetricCard } from '@/components/shared';
import { payrollRecords } from '@/data/finance';

export function PayrollStats() {
    const stats = useMemo(() => {
        return payrollRecords.reduce((acc, record) => {
            acc.totalPayroll += record.totalAmount;
            acc.totalBonuses += record.bonuses;
            acc.totalDeductions += record.deductions;
            return acc;
        }, {
            totalPayroll: 0,
            totalBonuses: 0,
            totalDeductions: 0
        });
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <MetricCard
                title="Total Payroll"
                value={formatCurrency(stats.totalPayroll)}
                icon="UsersIcon"
                iconColor="#F59E0B"
                trend={{ value: '4.2%', direction: 'down', label: 'vs last month' }}
            />
            <MetricCard
                title="Total Bonuses"
                value={formatCurrency(stats.totalBonuses)}
                icon="Money01Icon"
                iconColor="#10B981"
                trend={{ value: '12.5%', direction: 'up', label: 'vs last month' }}
            />
            <MetricCard
                title="Total Deductions"
                value={formatCurrency(stats.totalDeductions)}
                icon="ArrowDown01Icon"
                iconColor="#EF4444"
                trend={{ value: '2.1%', direction: 'up', label: 'vs last month' }}
            />
        </div>
    );
}
