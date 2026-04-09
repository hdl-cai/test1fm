import type { AuthUser } from '../stores/useAuthStore.ts';
import type { HealthRecord, Person, ProductionCycle, UserRole } from '../types/index.ts';
import { USER_ROLES } from '../types/index.ts';
import type { Tables, TablesUpdate } from '../types/supabase.ts';

export type ProfileRow = Tables<'profiles'>;
export type FarmAssignmentRow = Tables<'farm_assignments'>;
export type PerformanceMetricRow = Tables<'performance_metrics'>;
export type ProductionCycleRow = Tables<'production_cycles'>;
export type VaccinationScheduleRow = Tables<'vaccination_schedules'>;
export type HealthRecordRow = Tables<'health_records'>;
export type HarvestSaleRow = Tables<'harvest_sales'>;
export type DeliveredInputRow = Tables<'delivered_inputs'>;
export type CycleExpenseRow = Tables<'cycle_expenses'>;
export type InventoryItemRow = Tables<'inventory_items'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

type ProfileForAuth = Pick<ProfileRow, 'id' | 'email' | 'first_name' | 'last_name' | 'role' | 'org_id'>;
type CycleMetricRow = Pick<PerformanceMetricRow, 'created_at' | 'fcr_to_date' | 'livability_pct'>;

export interface CycleDetailsRow extends ProductionCycleRow {
  farms: { id: string; name: string; capacity: number; region: string } | null;
  profiles: { id: string; first_name: string; last_name: string; email: string } | null;
  performance_metrics: CycleMetricRow[] | null;
}

export interface PersonnelProfileRow extends ProfileRow {
  assignments: Pick<FarmAssignmentRow, 'farm_id' | 'role'>[] | null;
}

export interface GrowerPerformanceRow extends Tables<'grower_performance'> {
  profiles: Pick<ProfileRow, 'first_name' | 'last_name'> | null;
}

export interface CycleExpenseWithCategoryRow extends CycleExpenseRow {
  category: { name: string } | null;
}

export interface HealthRecordWithVeterinarianRow extends HealthRecordRow {
  veterinarian: Pick<ProfileRow, 'first_name' | 'last_name'> | null;
}

export interface VaccinationScheduleWithProfile extends VaccinationScheduleRow {
  verified_by: Pick<ProfileRow, 'first_name' | 'last_name'> | null;
}

export function isUserRole(role: string): role is UserRole {
  return (USER_ROLES as readonly string[]).includes(role);
}

export function toUserRole(role: string): UserRole {
  return isUserRole(role) ? role : 'personnel';
}

export function toPersonStatus(status: string): Person['status'] {
  return status === 'inactive' ? 'inactive' : 'active';
}

export function toHealthRecordType(recordType: string): HealthRecord['type'] {
  switch (recordType) {
    case 'vaccination':
    case 'treatment':
    case 'inspection':
      return recordType;
    default:
      return 'inspection';
  }
}

export function toHealthRecordStatus(isGahpCompliant: boolean): HealthRecord['status'] {
  return isGahpCompliant ? 'completed' : 'scheduled';
}

export function toVaccinationStepStatus(status: string): 'completed' | 'overdue' | 'scheduled' {
  if (status === 'completed' || status === 'overdue' || status === 'scheduled') {
    return status;
  }

  return 'scheduled';
}

export function mapProfileRowToAuthUser(profile: ProfileForAuth): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    name: `${profile.first_name} ${profile.last_name}`.trim(),
    role: toUserRole(profile.role),
    orgId: profile.org_id,
  };
}

export function mapProfileRowToPerson(profile: PersonnelProfileRow): Person {
  return {
    id: profile.id,
    name: `${profile.first_name} ${profile.last_name}`.trim(),
    email: profile.email,
    phone: profile.contact_number || '',
    role: toUserRole(profile.role),
    status: toPersonStatus(profile.status),
    avatar: profile.avatar_url || undefined,
    assignedFarms: (profile.assignments || []).map((assignment) => assignment.farm_id),
  };
}

export function mapCycleRowToProductionCycle(
  row: ProductionCycleRow & { performance_metrics?: CycleMetricRow[] | null }
): ProductionCycle {
  const sortedMetrics = (row.performance_metrics || []).slice().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const latest = sortedMetrics[0];

  return {
    id: row.id,
    farmId: row.farm_id,
    growerId: row.grower_id,
    batchName: row.batch_name,
    startDate: new Date(row.start_date),
    expectedEndDate: new Date(row.anticipated_harvest_date || row.start_date),
    birdCount: row.initial_birds,
    status: row.status === 'completed' ? 'completed' : row.status === 'pending' ? 'pending' : 'active',
    mortalityRate: latest?.livability_pct ? 100 - latest.livability_pct * 100 : 0,
    feedConsumed: 0,
    currentFeedStock: 0,
    fcr: latest?.fcr_to_date || 0,
  };
}
