import { EmptyState } from '@/components/ui/empty-state';

interface AnalyticsEmptyStateProps {
  className?: string;
}

export function AnalyticsEmptyState({ className }: AnalyticsEmptyStateProps) {
  return (
    <EmptyState
      icon="AnalyticsIcon"
      title="No analytics data yet"
      description="Analytics are generated once at least one production cycle is closed. Complete and close a cycle to unlock detailed performance and financial charts."
      className={className}
    />
  );
}
