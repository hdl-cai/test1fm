import { supabase } from '@/lib/supabase';
import {
  mapCycleRowToProductionCycle,
  type CycleDetailsRow,
  type DeliveredInputRow,
  type HealthRecordWithVeterinarianRow,
  type HarvestSaleRow,
  type VaccinationScheduleWithProfile,
} from '@/lib/data-adapters';
import { getCycles } from '@/lib/queries/cycles';
import type { Tables, TablesInsert } from '@/types/supabase';
import { requireOrgId, requireUserId } from './context';
import { toDataLayerError } from './errors';

type CycleLatestMetric = NonNullable<CycleDetailsRow['performance_metrics']>[number];
type CycleExpenseWithCategoryRow = Tables<'cycle_expenses'> & {
  expense_categories: { name: string } | null;
};

type CycleDetailsState = CycleDetailsRow & {
  latestMetrics: CycleLatestMetric | null;
};

export interface CycleDetailsData {
  cycle: CycleDetailsState;
  dailyLogs: Tables<'daily_logs'>[];
  healthRecords: HealthRecordWithVeterinarianRow[];
  vaccinationSchedules: VaccinationScheduleWithProfile[];
  harvestRecords: Tables<'harvest_logs'>[];
  salesRecords: HarvestSaleRow[];
  deliveredInputs: DeliveredInputRow[];
  cycleExpenses: CycleExpenseWithCategoryRow[];
}

export async function fetchCycles(orgId: string) {
  try {
    const data = await getCycles(requireOrgId(orgId));
    return ((data || []) as Array<Parameters<typeof mapCycleRowToProductionCycle>[0]>).map(mapCycleRowToProductionCycle);
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch production cycles.', 'cycles.fetchCycles');
  }
}

export async function createCycleRecord(input: {
  batchName: string;
  farmId: string;
  growerId: string;
  birdCount: number;
  startDate: string;
  anticipatedHarvestDate: string;
  orgId?: string | null;
}) {
  try {
    const payload: TablesInsert<'production_cycles'> = {
      org_id: requireOrgId(input.orgId),
      farm_id: input.farmId,
      grower_id: input.growerId,
      batch_name: input.batchName,
      initial_birds: input.birdCount,
      start_date: input.startDate,
      anticipated_harvest_date: input.anticipatedHarvestDate,
      status: 'active',
    };

    const { data, error } = await supabase
      .from('production_cycles')
      .insert(payload)
      .select(`
        *,
        performance_metrics (fcr_to_date, livability_pct, created_at)
      `)
      .single();

    if (error || !data) {
      throw error ?? new Error('Production cycle creation failed.');
    }

    return mapCycleRowToProductionCycle(data);
  } catch (error) {
    throw toDataLayerError(error, 'Failed to create production cycle.', 'cycles.createCycleRecord');
  }
}

export async function fetchCycleDetails(cycleId: string): Promise<CycleDetailsData> {
  try {
    const { data: cycleData, error: cycleError } = await supabase
      .from('production_cycles')
      .select(`
        *,
        farms (id, name, capacity, region),
        profiles (id, first_name, last_name, email),
        performance_metrics (fcr_to_date, livability_pct, created_at)
      `)
      .eq('id', cycleId)
      .single();

    if (cycleError || !cycleData) {
      throw cycleError ?? new Error('Cycle not found.');
    }

    const typedCycleData = cycleData as CycleDetailsRow;
    const metrics = typedCycleData.performance_metrics || [];
    const latestMetrics =
      metrics.length > 0
        ? [...metrics].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : null;

    const [
      { data: logs, error: logsError },
      { data: vaccs, error: vaccError },
      { data: health, error: healthError },
      { data: harvests, error: harvestError },
      { data: sales, error: salesError },
      { data: inputs, error: inputsError },
      { data: expenses, error: expensesError },
    ] = await Promise.all([
      supabase.from('daily_logs').select('*').eq('cycle_id', cycleId).order('log_date', { ascending: false }),
      supabase.from('vaccination_schedules').select(`
        *,
        verified_by:profiles!vaccination_schedules_verified_by_tech_id_fkey(first_name, last_name)
      `).eq('cycle_id', cycleId).order('scheduled_date', { ascending: true }),
      supabase
        .from('health_records')
        .select(`
          *,
          veterinarian:profiles!health_records_veterinarian_id_fkey (first_name, last_name)
        `)
        .eq('cycle_id', cycleId)
        .order('record_date', { ascending: false }),
      supabase.from('harvest_logs').select('*').eq('cycle_id', cycleId),
      supabase.from('harvest_sales').select('*').eq('cycle_id', cycleId),
      supabase.from('delivered_inputs').select('*').eq('cycle_id', cycleId).order('delivery_date', { ascending: true }),
      supabase
        .from('cycle_expenses')
        .select(`
          *,
          expense_categories (name)
        `)
        .eq('cycle_id', cycleId)
        .order('created_at', { ascending: false }),
    ]);

    if (logsError) throw logsError;
    if (vaccError) throw vaccError;
    if (healthError) throw healthError;
    if (harvestError) throw harvestError;
    if (salesError) throw salesError;
    if (inputsError) throw inputsError;
    if (expensesError) throw expensesError;

    return {
      cycle: {
        ...typedCycleData,
        latestMetrics,
      },
      dailyLogs: logs || [],
      healthRecords: (health as HealthRecordWithVeterinarianRow[]) || [],
      vaccinationSchedules: (vaccs as VaccinationScheduleWithProfile[]) || [],
      harvestRecords: harvests || [],
      salesRecords: (sales as HarvestSaleRow[]) || [],
      deliveredInputs: (inputs as DeliveredInputRow[]) || [],
      cycleExpenses: (expenses as CycleExpenseWithCategoryRow[]) || [],
    };
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch cycle details.', 'cycles.fetchCycleDetails');
  }
}

export async function addDailyLogRecord(input: {
  cycleId: string;
  orgId?: string | null;
  userId?: string | null;
  mortalityCount?: number;
  culledCount?: number;
  feedUsedKg: number;
  avgTempC?: number | null;
  avgHumidityPct?: number | null;
  logDate?: string;
}) {
  try {
    const payload: TablesInsert<'daily_logs'> = {
      org_id: requireOrgId(input.orgId),
      cycle_id: input.cycleId,
      log_date: input.logDate ?? new Date().toISOString().split('T')[0],
      mortality_count: input.mortalityCount ?? 0,
      culled_count: input.culledCount ?? 0,
      feed_used_kg: input.feedUsedKg,
      avg_temp_c: input.avgTempC ?? null,
      avg_humidity_pct: input.avgHumidityPct ?? null,
      submitted_by: requireUserId(input.userId),
      entry_type: 'grower_entry',
      status: 'submitted',
    };

    const { error } = await supabase.from('daily_logs').insert(payload);
    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to save daily log.', 'cycles.addDailyLogRecord');
  }
}

export async function fetchExpenseCategories() {
  try {
    const { data, error } = await supabase.from('expense_categories').select('id, name').order('name');
    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch expense categories.', 'cycles.fetchExpenseCategories');
  }
}

export async function addCycleExpenseRecord(input: {
  cycleId: string;
  farmId: string;
  categoryId: string;
  description: string;
  amount: number;
  orgId?: string | null;
  userId?: string | null;
}) {
  try {
    const payload: TablesInsert<'cycle_expenses'> = {
      org_id: requireOrgId(input.orgId),
      cycle_id: input.cycleId,
      farm_id: input.farmId,
      category_id: input.categoryId,
      description: input.description,
      amount_excl_vat: input.amount,
      total_paid: input.amount,
      submitted_by: requireUserId(input.userId),
      status: 'approved',
    };

    const { error } = await supabase.from('cycle_expenses').insert(payload);
    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to add cycle expense.', 'cycles.addCycleExpenseRecord');
  }
}

export async function addDeliveryLogRecord(input: {
  cycleId: string;
  farmId: string;
  itemName: string;
  itemType: string;
  quantityDelivered: number;
  unit: string;
  costPerUnit: number;
  deliveryDate: string;
  notes?: string;
  orgId?: string | null;
}) {
  try {
    const payload: TablesInsert<'delivered_inputs'> = {
      org_id: requireOrgId(input.orgId),
      cycle_id: input.cycleId,
      farm_id: input.farmId,
      item_name: input.itemName,
      item_type: input.itemType,
      quantity_delivered: input.quantityDelivered,
      unit: input.unit,
      cost_per_unit: input.costPerUnit,
      delivery_date: input.deliveryDate,
      notes: input.notes || null,
    };

    const { error } = await supabase.from('delivered_inputs').insert(payload);
    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to save delivery log.', 'cycles.addDeliveryLogRecord');
  }
}

export async function addDocLoadingRecord(input: {
  cycleId: string;
  hatcheryName?: string;
  sourceFarmCertNo: string;
  deliveredQuantity: number;
  actualPlacedQuantity: number;
  deadOnArrivalCount?: number;
  averageChickWeightG?: number | null;
  orgId?: string | null;
  userId?: string | null;
}) {
  try {
    const payload: TablesInsert<'doc_loading'> = {
      org_id: requireOrgId(input.orgId),
      cycle_id: input.cycleId,
      hatchery_name: input.hatcheryName || null,
      source_farm_cert_no: input.sourceFarmCertNo,
      delivered_quantity: input.deliveredQuantity,
      actual_placed_quantity: input.actualPlacedQuantity,
      dead_on_arrival_count: input.deadOnArrivalCount ?? 0,
      average_chick_weight_g: input.averageChickWeightG ?? null,
      recorded_by: input.userId ?? null,
    };

    const { error } = await supabase.from('doc_loading').insert(payload);
    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to save DOC loading record.', 'cycles.addDocLoadingRecord');
  }
}

export async function addHarvestLogRecord(input: {
  cycleId: string;
  harvestDateStart: string;
  birdsHarvestedCount: number;
  grossWeightKg: number;
  birdsRejectedCount?: number;
  rejectWeightKg?: number;
  loadingLossCount?: number;
  fleetUsed?: string;
  harvestTeamNotes?: string;
  orgId?: string | null;
}) {
  try {
    const payload: TablesInsert<'harvest_logs'> = {
      org_id: requireOrgId(input.orgId),
      cycle_id: input.cycleId,
      harvest_date_start: input.harvestDateStart,
      birds_harvested_count: input.birdsHarvestedCount,
      gross_weight_kg: input.grossWeightKg,
      birds_rejected_count: input.birdsRejectedCount ?? 0,
      reject_weight_kg: input.rejectWeightKg ?? 0,
      loading_loss_count: input.loadingLossCount ?? 0,
      fleet_used: input.fleetUsed || null,
      harvest_team_notes: input.harvestTeamNotes || null,
    };

    const { error } = await supabase.from('harvest_logs').insert(payload);
    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to save harvest log.', 'cycles.addHarvestLogRecord');
  }
}

export async function validateHarvestLogRecord(input: { recordId: string; userId?: string | null }) {
  try {
    const { error } = await supabase
      .from('harvest_logs')
      .update({
        is_validated: true,
        validated_by: requireUserId(input.userId),
        validated_at: new Date().toISOString(),
      })
      .eq('id', input.recordId);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to validate harvest log.', 'cycles.validateHarvestLogRecord');
  }
}

export async function disputeHarvestLogRecord(input: { recordId: string; note: string }) {
  try {
    const { error } = await supabase
      .from('harvest_logs')
      .update({
        harvest_team_notes: `[DISPUTED] ${input.note}`,
      })
      .eq('id', input.recordId);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to dispute harvest log.', 'cycles.disputeHarvestLogRecord');
  }
}

export async function completeCycleRecord(cycleId: string) {
  try {
    const { error } = await supabase
      .from('production_cycles')
      .update({
        status: 'completed',
        actual_end_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', cycleId);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toDataLayerError(error, 'Failed to close cycle.', 'cycles.completeCycleRecord');
  }
}
