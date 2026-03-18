/**
 * UI Store
 * Zustand store for UI state management
 */

import { create } from 'zustand';
import type { Theme, NavSection } from '@/types';

export interface UIState {
  // Theme
  theme: Theme;
  
  // Layout
  sidebarOpen: boolean;
  currentNavSection: NavSection;
  
  // Current selections
  currentFarmId: string | null;
  currentCycleId: string | null;
  
  // Sheet/Modal state
  activeSheet: string | null;
  isSheetOpen: boolean;
  
  // Notifications
  unreadNotifications: number;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentNavSection: (section: NavSection) => void;
  setCurrentFarm: (farmId: string | null) => void;
  setCurrentCycle: (cycleId: string | null) => void;
  openSheet: (sheetId: string) => void;
  closeSheet: () => void;
  setUnreadNotifications: (count: number) => void;
  incrementUnreadNotifications: () => void;
  clearUnreadNotifications: () => void;
}

// Get initial theme from localStorage or default to dark
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('flockmate-theme') as Theme | null;
  return stored || 'dark';
};

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  theme: getInitialTheme(),
  sidebarOpen: true,
  currentNavSection: 'dashboard',
  currentFarmId: null,
  currentCycleId: null,
  activeSheet: null,
  isSheetOpen: false,
  unreadNotifications: 3, // Start with 3 for demo
  
  // Actions
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('flockmate-theme', theme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
    set({ theme });
  },
  
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setCurrentNavSection: (section) => set({ currentNavSection: section }),
  
  setCurrentFarm: (farmId) => set({ currentFarmId: farmId }),
  
  setCurrentCycle: (cycleId) => set({ currentCycleId: cycleId }),
  
  openSheet: (sheetId) => set({ activeSheet: sheetId, isSheetOpen: true }),
  
  closeSheet: () => set({ activeSheet: null, isSheetOpen: false }),
  
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  
  incrementUnreadNotifications: () => 
    set((state) => ({ unreadNotifications: state.unreadNotifications + 1 })),
  
  clearUnreadNotifications: () => set({ unreadNotifications: 0 }),
}));
