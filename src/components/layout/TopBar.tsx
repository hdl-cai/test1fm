/**
 * TopBar Component
 * 
 * Features:
 * - Page title display
 * - Search input
 * - Notifications button with badge
 * - Theme toggle (dark/light)
 */

import { useUIStore } from '@/stores/useUIStore';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const {
    theme,
    toggleTheme,
    toggleSidebar,
  } = useUIStore();



  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-card border-b border-border">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Left Section: Toggle + Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0 text-foreground"
            aria-label="Toggle Sidebar"
          >
            <Icon name="Menu01Icon" size={24} />
          </Button>

          {title && (
            <h1 className="text-xl font-semibold text-foreground hidden sm:block">
              {title}
            </h1>
          )}
        </div>

        {/* Right Section: Search + Notifications + Theme */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative hidden md:block">
            <Icon
              name="SearchIcon"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              placeholder="Search entire system..."
              className={cn(
                "w-64 lg:w-80 pl-10 h-10 rounded-full",
                "bg-muted/30 border-border",
                "placeholder:text-muted-foreground text-sm"
              )}
            />
          </div>

          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0 text-foreground"
            aria-label="Search"
          >
            <Icon name="SearchIcon" size={20} />
          </Button>

          {/* Notifications Bell */}
          <NotificationBell />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="shrink-0 text-foreground"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Icon name="MoonIcon" size={20} />
            ) : (
              <Icon name="SunIcon" size={20} />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
