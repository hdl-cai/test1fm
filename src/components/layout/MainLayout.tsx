/**
 * MainLayout Component
 * 
 * Combines Sidebar + TopBar + Content area
 * Handles layout responsiveness and consistent padding
 */

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Navigation Link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
        Skip to main content
      </a>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-col min-h-full transition-[height] duration-300 ease-in-out',
          sidebarOpen ? 'ml-64' : 'ml-0'
        )}
      >
        {/* TopBar */}
        <TopBar title={title} />

        {/* Page Content */}
        <main id="main-content" className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
