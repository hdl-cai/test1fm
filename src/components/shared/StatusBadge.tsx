/**
 * StatusBadge Component
 * 
 * Reusable status badge for farm and entity status indicators.
 * Standardized to the FlockMate Design System badge utility classes.
 */

import { cn } from '@/lib/utils';
import type { Farm } from '@/types';

type FarmStatus = Farm['status'];
type GenericStatus =
  | 'online' | 'offline' | 'alert'
  | 'in_stock' | 'low_stock' | 'out_of_stock'
  | 'pending' | 'on_route' | 'completed'
  | 'scheduled' | 'overdue' | 'approved' | 'rejected'
  | 'paid' | 'partial' | 'processing' | 'repaid' | 'inactive'
  | 'audit_passed' | 'replenish' | 'critical' | 'on_track' | 'market_peak';

interface StatusBadgeProps {
  status: FarmStatus | GenericStatus | string;
  label?: string;
  showDot?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pill';
  animate?: boolean;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'muted'; pulse?: boolean; glow?: boolean }> = {
  // Farm statuses
  active: { label: 'Active', variant: 'success' },
  empty: { label: 'Empty', variant: 'muted' },
  maintenance: { label: 'Maintenance', variant: 'warning', pulse: true },

  // Sensor/Connection statuses
  online: { label: 'Online', variant: 'success' },
  offline: { label: 'Offline', variant: 'muted' },
  alert: { label: 'Alert', variant: 'danger', pulse: true },

  // Inventory statuses
  in_stock: { label: 'In Stock', variant: 'success' },
  low_stock: { label: 'Low Stock', variant: 'warning' },
  out_of_stock: { label: 'Out of Stock', variant: 'danger' },

  // Generic statuses
  pending: { label: 'Pending', variant: 'warning' },
  on_route: { label: 'On Route', variant: 'info' },
  completed: { label: 'Completed', variant: 'success', glow: true },
  scheduled: { label: 'Scheduled', variant: 'info' },
  overdue: { label: 'Overdue', variant: 'danger', pulse: true },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  paid: { label: 'Paid', variant: 'success' },
  partial: { label: 'Partial', variant: 'warning' },
  processing: { label: 'Processing', variant: 'info', pulse: true },
  repaid: { label: 'Repaid', variant: 'info' },
  inactive: { label: 'Inactive', variant: 'muted' },

  // Specialized statuses (Phase 3)
  audit_passed: { label: 'Audit Passed', variant: 'success', glow: true },
  replenish: { label: 'Replenish', variant: 'warning', pulse: true },
  critical: { label: 'Critical', variant: 'danger', pulse: true },
  on_track: { label: 'On Track', variant: 'success', pulse: true },
  optimal: { label: 'Optimal', variant: 'success' },
  market_peak: { label: 'Market Peak', variant: 'warning' },
};

const variantClasses = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  muted: 'badge-muted',
};

const sizeConfig = {
  sm: 'px-2 py-0.5 text-micro gap-1.5 rounded-md',
  md: 'px-2.5 py-1 text-micro gap-2 rounded-md',
  lg: 'px-3 py-1.5 text-caption gap-2 rounded-lg',
};

export function StatusBadge({
  status,
  label: customLabel,
  showDot = true,
  className,
  size = 'md',
  variant = 'default',
  animate: forceAnimate
}: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || {
    label: typeof status === 'string' ? status.replace(/_/g, ' ') : String(status),
    variant: 'muted'
  };

  const label = customLabel || config.label;

  const shouldAnimate = forceAnimate !== undefined ? forceAnimate : config.pulse;
  const shouldGlow = config.glow;

  return (
    <span
      className={cn(
        'badge transition-all duration-300',
        variantClasses[config.variant as keyof typeof variantClasses],
        sizeConfig[size],
        variant === 'pill' && 'badge-pill',
        shouldAnimate && 'animate-pulse',
        shouldGlow && config.variant === 'success' && 'shadow-[0_0_12px_rgba(42,122,82,0.35)] dark:shadow-[0_0_12px_rgba(74,155,111,0.3)]',
        className
      )}
    >
      {showDot && (
        <span className={cn(
          'h-1.5 w-1.5 rounded-full shrink-0',
          config.variant === 'success' && 'bg-success',
          config.variant === 'warning' && 'bg-warning',
          config.variant === 'danger' && 'bg-danger',
          config.variant === 'info' && 'bg-info',
          config.variant === 'muted' && 'bg-muted-foreground'
        )} />
      )}
      {label}
    </span>
  );
}

export default StatusBadge;
