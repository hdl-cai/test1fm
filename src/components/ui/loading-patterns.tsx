import { Skeleton } from './skeleton';

const CHART_SKELETON_HEIGHTS = ['24%', '56%', '38%', '72%', '46%', '82%', '60%', '34%', '68%', '50%', '76%', '42%'] as const;

/**
 * Standard Metric Card Loading Skeleton
 */
export function MetricCardSkeleton() {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <div className="flex gap-2 items-center pt-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

/**
 * Standard Table Loading Skeleton
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 p-4 border-b border-border">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4 flex gap-4">
              {Array.from({ length: cols }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Chart Loading Skeleton
 */
export function ChartSkeleton({ height = "300px" }: { height?: string }) {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border w-full space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div style={{ height }} className="relative flex items-end gap-2 px-2 pb-8 pt-4">
        {/* Mocking bars/area height variations */}
        {CHART_SKELETON_HEIGHTS.map((heightValue, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t-lg" 
            style={{ height: heightValue }} 
          />
        ))}
        {/* Bottom axis line */}
        <div className="absolute bottom-6 left-0 right-0 h-px bg-border" />
      </div>
    </div>
  );
}

/**
 * Global Page Loading Overlay
 */
export function LoadingOverlay({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 animate-ping rounded-full border-4 border-primary/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-[0_0_15px_rgba(var(--color-primary),0.3)]"></div>
        </div>
      </div>
      <p className="mt-8 text-micro font-black uppercase tracking-[0.4em] text-primary animate-pulse">
        {message}
      </p>
    </div>
  );
}
