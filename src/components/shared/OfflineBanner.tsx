/**
 * OfflineBanner — sticky top banner that appears when the browser is offline.
 * Automatically hides when connectivity is restored.
 */

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/hooks/useIcon';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setDismissed(false); // reset so banner shows again on next offline event
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed top-0 left-0 right-0 z-[100]',
        'flex items-center justify-between gap-3 px-4 py-2',
        'bg-amber-500 text-amber-950 text-sm font-medium',
        'shadow-md',
      )}
    >
      <div className="flex items-center gap-2">
        <Icon name="WifiError01Icon" size={16} className="shrink-0" />
        <span>
          You&apos;re offline. Daily reports, weight samples, and deliveries will be queued and submitted
          when your connection is restored.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss offline banner"
        className="shrink-0 rounded p-0.5 hover:bg-amber-600/30 transition-colors"
      >
        <Icon name="Cancel01Icon" size={16} />
      </button>
    </div>
  );
}
