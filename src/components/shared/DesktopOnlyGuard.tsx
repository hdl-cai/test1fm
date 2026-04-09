/**
 * DesktopOnlyGuard — wraps a page or section and shows a friendly banner on
 * mobile viewports (< 768 px). The wrapped content is still rendered so the
 * page doesn't break server-side; the banner overlays it on small screens.
 *
 * Usage:
 *   <DesktopOnlyGuard>
 *     <Analytics />
 *   </DesktopOnlyGuard>
 */

import { type ReactNode } from 'react';
import { Icon } from '@/hooks/useIcon';

interface DesktopOnlyGuardProps {
  children: ReactNode;
  /** Optional custom message override. */
  message?: string;
}

export function DesktopOnlyGuard({ children, message }: DesktopOnlyGuardProps) {
  return (
    <>
      {/* Mobile banner — hidden on md+ via Tailwind */}
      <div className="flex md:hidden flex-col items-center justify-center min-h-[60vh] px-6 py-12 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <Icon name="Computer01Icon" size={32} className="text-muted-foreground" />
        </div>
        <div className="space-y-2 max-w-xs">
          <h2 className="text-lg font-semibold text-foreground">Desktop Required</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message ??
              'For the best experience, use FlockMate on a desktop browser. This section is not optimised for mobile devices.'}
          </p>
        </div>
      </div>

      {/* Desktop content — hidden on mobile */}
      <div className="hidden md:block">{children}</div>
    </>
  );
}
