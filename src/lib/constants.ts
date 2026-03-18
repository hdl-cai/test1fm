/**
 * FlockMate Constants
 * Color tokens, route paths, and other app-wide constants
 */

// ============================================================================
// Color Tokens (matches CSS variables)
// ============================================================================

export const COLORS = {
  // Dark Mode (Default)
  dark: {
    background: '#0A0A0A',
    card: '#121212',
    primary: '#F59E0B',
    success: '#1DB954',
    purple: '#8B5CF6',
    danger: '#EF4444',
    warning: '#F59E0B',
    muted: '#9CA3AF',
    mutedForeground: '#6B7280',
    foreground: '#FFFFFF',
    secondary: '#1F1F1F',
    border: '#27272A',
    input: '#27272A',
    ring: '#F59E0B',
    chart1: '#F59E0B',
    chart2: '#1DB954',
    chart3: '#8B5CF6',
    chart4: '#EF4444',
    chart5: '#9CA3AF',
  },
  // Light Mode
  light: {
    background: '#F9FAFB',
    card: '#FFFFFF',
    primary: '#D97706',
    success: '#059669',
    purple: '#6D28D9',
    danger: '#DC2626',
    warning: '#D97706',
    muted: '#6B7280',
    mutedForeground: '#9CA3AF',
    foreground: '#111827',
    secondary: '#F3F4F6',
    border: '#E5E7EB',
    input: '#E5E7EB',
    ring: '#D97706',
    chart1: '#D97706',
    chart2: '#059669',
    chart3: '#6D28D9',
    chart4: '#DC2626',
    chart5: '#6B7280',
  },
} as const;

// ============================================================================
// Route Paths
// ============================================================================

export const ROUTES = {
  DASHBOARD: '/',
  FARMS: '/farms',
  SENSORS: '/sensors',
  PRODUCTION_CYCLES: '/production-cycles',
  PRODUCTION_CYCLE_DETAILS: '/production-cycles/:id',
  HEALTH: '/health',
  FINANCE: '/finance',
  PERFORMANCE: '/performance',
  PERSONNEL: '/personnel',
  INVENTORY: '/inventory',
  SETTINGS: '/settings',
} as const;

// ============================================================================
// Navigation Items
// ============================================================================

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  section: 'main' | 'farm' | 'flock' | 'business' | 'footer';
}

export const NAV_ITEMS: NavItem[] = [
  // Main Section
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'DashboardSquareIcon', section: 'main' },
  
  // Farm Management Section
  { label: 'Farms', path: ROUTES.FARMS, icon: 'FarmIcon', section: 'farm' },
  { label: 'Inventory', path: ROUTES.INVENTORY, icon: 'InventoryIcon', section: 'farm' },
  { label: 'Sensors', path: ROUTES.SENSORS, icon: 'SensorIcon', section: 'farm' },
  
  // Flock Management Section
  { label: 'Production Cycles', path: ROUTES.PRODUCTION_CYCLES, icon: 'CycleIcon', section: 'flock' },
  { label: 'Health', path: ROUTES.HEALTH, icon: 'MedicalFileIcon', section: 'flock' },
  
  // Business Section
  { label: 'Finance', path: ROUTES.FINANCE, icon: 'MoneyIcon', section: 'business' },
  { label: 'Performance', path: ROUTES.PERFORMANCE, icon: 'AnalyticsIcon', section: 'business' },
  { label: 'Personnel', path: ROUTES.PERSONNEL, icon: 'UserGroupIcon', section: 'business' },
  
  // Footer Section
  { label: 'Settings', path: ROUTES.SETTINGS, icon: 'SettingsIcon', section: 'footer' },
];

// ============================================================================
// Status Colors
// ============================================================================

export const STATUS_COLORS = {
  // Farm Status
  'active': { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
  'empty': { bg: 'bg-muted/10', text: 'text-muted', border: 'border-muted/20' },
  'maintenance': { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
  
  // Sensor Status
  'online': { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
  'offline': { bg: 'bg-muted/10', text: 'text-muted', border: 'border-muted/20' },
  'alert': { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20' },
  
  // Inventory Status
  'in_stock': { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
  'low_stock': { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
  'out_of_stock': { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20' },
  
  // Cycle Status
  'pending': { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
  'cycle_completed': { bg: 'bg-muted/10', text: 'text-muted', border: 'border-muted/20' },
  
  // Transaction Status
  'approved': { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
  'rejected': { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20' },
  
  // Health Status
  'scheduled': { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
  'health_completed': { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
  'overdue': { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20' },
  
  // Alert Types
  'critical': { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20' },
  'warning': { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
  'info': { bg: 'bg-purple/10', text: 'text-purple', border: 'border-purple/20' },
} as const;

// ============================================================================
// Chart Configuration
// ============================================================================

export const CHART_CONFIG = {
  colors: {
    temperature: '#F59E0B',  // Amber
    humidity: '#1DB954',     // Green
    ammonia: '#8B5CF6',      // Purple
    mortality: '#EF4444',    // Red
    fcr: '#3B82F6',          // Blue
    revenue: '#F59E0B',      // Amber
    cost: '#EF4444',         // Red
    profit: '#1DB954',       // Green
  },
  strokeWidth: 2,
  gridColor: '#27272A',
  tooltipBg: '#121212',
  tooltipBorder: '#27272A',
} as const;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULTS = {
  pageSize: 10,
  dateFormat: 'MMM d, yyyy',
  dateTimeFormat: 'MMM d, yyyy h:mm a',
  currency: 'PHP',
  currencyLocale: 'en-PH',
  temperatureUnit: '°C',
  humidityUnit: '%',
  weightUnit: 'kg',
} as const;

// ============================================================================
// Mock Data Counts
// ============================================================================

export const MOCK_DATA_COUNTS = {
  farms: 5,
  sensors: 24,
  productionCycles: 8,
  personnel: 12,
  inventoryItems: 24,
  healthRecords: 30,
  transactions: 50,
  alerts: 8,
} as const;

// ============================================================================
// Sensor Thresholds (for alerts)
// ============================================================================

export const SENSOR_THRESHOLDS = {
  temperature: { min: 18, max: 28, unit: '°C' },
  humidity: { min: 50, max: 70, unit: '%' },
  ammonia: { min: 0, max: 25, unit: 'ppm' },
  battery: { min: 20, unit: '%' },
} as const;
