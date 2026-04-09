/**
 * FlockMate TypeScript Type Definitions
 */

export const USER_ROLES = [
  'admin',
  'owner',
  'grower',
  'technician',
  'personnel',
  'farm_admin',
  'vet',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

// ============================================================================
// Farm Management
// ============================================================================

export interface Farm {
  id: string;
  name: string;
  region: string;
  status: 'active' | 'empty' | 'maintenance';
  sensorsEnabled?: boolean;
  capacity: number;
  currentBirdCount: number;
  activeCycles: number;
  avgFCR: number;
  avgLiveWeight: number;
  bpi: number;
  coordinates: { lat: number; lng: number };
  lastUpdated: Date;
}

export interface Sensor {
  id: string;
  nodeId?: string;
  metricId?: string;
  nodeIdCode?: string;
  farmId: string;
  location: string;
  type: 'temperature' | 'humidity' | 'ammonia';
  reading: number | null;
  unit: string;
  battery: number;
  status: 'online' | 'offline' | 'alert';
  firmwareVersion: string;
  isActive?: boolean;
  thresholdMin?: number | null;
  thresholdMax?: number | null;
  alertMessage?: string | null;
  lastReading?: Date;
}

// ============================================================================
// Inventory
// ============================================================================

export interface InventoryItem {
  id: string;
  name: string;
  category: 'feed' | 'medical' | 'supplements';
  currentStock: number;
  unit: string;
  threshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  farmId?: string; // null means global/shared
  lastRestocked?: Date;
}

// ============================================================================
// Production Cycles
// ============================================================================

export interface ProductionCycle {
  id: string;
  farmId: string;
  growerId: string;
  batchName: string;
  startDate: Date;
  expectedEndDate: Date;
  birdCount: number;
  status: 'active' | 'completed' | 'pending';
  mortalityRate: number;
  feedConsumed: number; // kg
  currentFeedStock: number; // links to inventory
  fcr?: number; // Feed Conversion Ratio
  averageWeight?: number; // grams
}

// ============================================================================
// Personnel
// ============================================================================

export interface Person {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  assignedFarms: string[];
  status: 'active' | 'inactive';
  avatar?: string;
}

// ============================================================================
// Health
// ============================================================================

export interface HealthRecord {
  id: string;
  cycleId: string;
  farmId?: string;
  date: Date;
  type: 'vaccination' | 'treatment' | 'inspection';
  description: string;
  vetId: string;
  status: 'scheduled' | 'completed' | 'overdue';
  notes?: string;
  medication?: string;
  dosage?: string;
}

// ============================================================================
// Finance
// ============================================================================

export interface Transaction {
  id: string;
  type: 'expense' | 'income' | 'payroll' | 'cash_advance';
  category: string;
  amount: number;
  date: Date;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy?: string;
  approvedBy?: string;
  farmId?: string;
  cycleId?: string;
}

export interface PayrollRecord {
  id: string;
  personId: string;
  periodStart: Date;
  periodEnd: Date;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing';
  paidDate?: Date;
}

export interface CashAdvance {
  id: string;
  personId: string;
  amount: number;
  requestDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'repaid';
  approvedBy?: string;
  approvedDate?: Date;
}

// ============================================================================
// Performance
// ============================================================================

export interface PerformanceMetrics {
  cycleId: string;
  farmId: string;
  fcr: number; // Feed Conversion Ratio
  mortalityRate: number;
  averageWeight: number;
  revenue: number;
  cost: number;
  profit: number;
  recordedAt: Date;
}

export interface GrowerPerformance {
  growerId: string;
  person?: Person;
  totalCycles: number;
  activeCycles: number;
  averageFCR: number;
  averageMortality: number;
  totalRevenue: number;
  ranking: number;
  epef: number;
  points: number;
}

// ============================================================================
// Orders
// ============================================================================

export interface Order {
  id: string;
  type: 'feed' | 'medical' | 'supplements';
  items: OrderItem[];
  status: 'pending' | 'on_route' | 'completed' | 'cancelled';
  totalAmount: number;
  supplier?: string;
  orderDate?: Date;
  expectedDelivery?: Date;
  deliveredDate?: Date;
  requestedBy: string;
  approvedBy?: string;
  farmId?: string;
}

export interface OrderItem {
  id: string;
  inventoryItemId: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

// ============================================================================
// Alerts & Notifications
// ============================================================================

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  farmId?: string;
  sensorId?: string;
  cycleId?: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface Notification {
  id: string;
  orgId: string;
  recipientId: string;
  type: string;
  eventType: string | null;
  urgency: 'critical' | 'warning' | 'info' | null;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  isArchived: boolean;
  farmId: string | null;
  cycleId: string | null;
  readAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

// ============================================================================
// Daily Logs
// ============================================================================

export interface DailyLog {
  id: string;
  cycleId: string;
  farmId: string;
  date: Date;
  mortality: number;
  culls: number;
  feedConsumed: number;
  waterConsumed: number;
  averageWeight: number;
  temperature: number;
  humidity: number;
  notes?: string;
  recordedBy: string;
}

// ============================================================================
// Harvest & Sales
// ============================================================================

export interface HarvestRecord {
  id: string;
  cycleId: string;
  farmId: string;
  harvestDate: Date;
  birdsHarvested: number;
  averageWeight: number;
  totalWeight: number;
  grade: 'A' | 'B' | 'C';
  notes?: string;
}

export interface SaleRecord {
  id: string;
  cycleId: string;
  farmId: string;
  harvestId: string;
  saleDate: Date;
  buyer: string;
  birdsSold: number;
  weightSold: number;
  pricePerKg: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'partial';
  amountPaid?: number;
}

// ============================================================================
// UI & App State
// ============================================================================

export type Theme = 'light' | 'dark';

export interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  currentFarmId: string | null;
  activeSheet: string | null;
}

export type NavSection =
  | 'dashboard'
  | 'farms'
  | 'inventory'
  | 'sensors'
  | 'production-cycles'
  | 'health'
  | 'finance'
  | 'performance'
  | 'analytics'
  | 'personnel'
  | 'settings'
  | 'notifications';
