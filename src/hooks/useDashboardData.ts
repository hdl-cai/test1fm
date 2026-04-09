import { useEffect, useState } from 'react';
import {
  fetchDashboardData,
  type ChartData,
  type DashboardData,
  type DashboardStats,
  type FlockSummaryItem,
  type PendingApproval,
} from '@/lib/data/dashboard';
import { useAuthStore } from '@/stores/useAuthStore';

export function useDashboardData() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalBirds: 0,
    avgMortality: 0,
    avgFCR: 0,
    activeCyclesCount: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [flockSummary, setFlockSummary] = useState<FlockSummaryItem[]>([]);
  const [latestMarketPrice, setLatestMarketPrice] = useState<DashboardData['latestMarketPrice']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.orgId) {
      setIsLoading(false);
      return;
    }

    const orgId = user.orgId;

    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await fetchDashboardData(orgId);
        setStats(data.stats);
        setChartData(data.chartData);
        setPendingApprovals(data.pendingApprovals);
        setFlockSummary(data.flockSummary);
        setLatestMarketPrice(data.latestMarketPrice);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user?.orgId]);

  return { stats, chartData, pendingApprovals, flockSummary, latestMarketPrice, isLoading };
}
