/**
 * Sidebar Component
 * 
 * Main navigation sidebar with sections:
 * - Main (Dashboard)
 * - Farm Management (Farms, Inventory, Sensors)
 * - Flock Management (Production Cycles, Health)
 * - Business (Finance, Performance, Personnel)
 * - Footer (Settings, Help, User Profile)
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Icon } from '@/hooks/useIcon';
import { cn } from '@/lib/utils';
import type { NavSection } from '@/types';

interface NavItem {
  id: NavSection;
  label: string;
  icon: string;
  path: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'DashboardSquareIcon', path: '/' },
    ],
  },
  {
    title: 'Farm Management',
    items: [
      { id: 'farms', label: 'Farms', icon: 'FarmIcon', path: '/farms' },
      { id: 'inventory', label: 'Inventory', icon: 'InventoryIcon', path: '/inventory' },
    ],
  },
  {
    title: 'Flock Management',
    items: [
      { id: 'production-cycles', label: 'Production Cycles', icon: 'CycleIcon', path: '/production-cycles' },
    ],
  },
  {
    title: 'Business',
    items: [
      { id: 'finance', label: 'Finance', icon: 'MoneyIcon', path: '/finance' },
      { id: 'performance', label: 'Performance', icon: 'AnalyticsIcon', path: '/performance' },
      { id: 'personnel', label: 'Personnel', icon: 'UserGroupIcon', path: '/personnel' },
    ],
  },
];

// Avatar component: shows initials with a colored background
function UserAvatar() {
  const { user } = useAuthStore();
  const name = user?.name || 'User';
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="h-9 w-9 rounded-full flex items-center justify-center ring-2 ring-sidebar-border bg-primary text-primary-foreground text-xs font-bold">
      {initials}
    </div>
  );
}

const FOOTER_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: 'SettingsIcon', path: '/settings' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentNavSection, sidebarOpen, unreadNotifications } = useUIStore();
  const { signOut, user } = useAuthStore();

  const handleNavClick = (item: NavItem) => {
    setCurrentNavSection(item.id);
    navigate(item.path);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col',
        'bg-sidebar border-r border-sidebar-border',
        'transition-colors duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Icon name="PlantIcon" size={18} className="text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground leading-tight">FlockMate</span>
            <span className="text-micro font-medium text-muted-foreground tracking-wider uppercase">
              Farm Operations
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path) && item.path !== '/';
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-[width] duration-200 relative',
                        'text-sm font-medium',
                        isActive
                          ? 'text-sidebar-primary border-l-2 border-sidebar-primary dark:bg-warning/15 dark:text-warning dark:border-warning bg-success/15 text-success border-success'
                          : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <Icon
                        name={item.icon}
                        size={20}
                      />
                      <span>{item.label}</span>
                      {item.id === 'dashboard' && unreadNotifications > 0 && (
                        <span className="ml-auto flex h-2 w-2 rounded-full bg-destructive" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Section */}
      <div className="border-t border-sidebar-border py-2 px-3 space-y-1">
        {FOOTER_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200',
                'text-sm font-medium',
                isActive
                  ? 'text-sidebar-primary border-l-2 border-sidebar-primary dark:bg-warning/15 dark:text-warning dark:border-warning bg-success/15 text-success border-success'
                  : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon
                name={item.icon}
                size={20}
              />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground transition-colors duration-200"
        >
          <Icon name="HelpCircleIcon" size={20} />
          <span>Help Center</span>
        </button>

        {/* User Profile */}
        <div className="mt-4 pt-4 border-t border-sidebar-border">
          <div className="flex items-center group px-1">
            <UserAvatar />
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-micro text-muted-foreground uppercase font-semibold">{user?.role || 'Member'}</p>
            </div>
            <button
              onClick={() => { signOut(); navigate('/login'); }}
              className="text-muted-foreground hover:text-sidebar-foreground transition-colors p-1 cursor-pointer"
              aria-label="Sign out"
            >
              <Icon name="LogoutIcon" size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
