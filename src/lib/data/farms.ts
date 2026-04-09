import { supabase } from '@/lib/supabase';
import type { Farm } from '@/types';
import type { Tables, TablesInsert } from '@/types/supabase';
import { getActiveCyclesByFarms, getFarmInventoryStock, getFarmPersonnel, getFarms } from '@/lib/queries/farms';
import { requireOrgId } from './context';
import { toDataLayerError } from './errors';

type FarmMetricRow = Pick<Tables<'performance_metrics'>, 'created_at' | 'fcr_to_date' | 'livability_pct'>;
type FarmCycleRow = Pick<
  Tables<'production_cycles'>,
  'id' | 'farm_id' | 'initial_birds' | 'batch_name' | 'start_date' | 'actual_end_date' | 'status'
> & {
  performance_metrics: FarmMetricRow[] | null;
};

type FarmHistoryRow = FarmCycleRow;
type FarmPersonnelRow = Pick<Tables<'farm_assignments'>, 'role' | 'status'> & {
  profiles: Pick<Tables<'profiles'>, 'id' | 'first_name' | 'last_name' | 'email'> | null;
};
type FarmStockRow = Pick<Tables<'inventory_stock'>, 'current_qty'> & {
  inventory_items: Pick<Tables<'inventory_items'>, 'name' | 'unit'> | null;
};

export interface FarmDetailsData {
  farmHistory: FarmHistoryRow[];
  farmPersonnel: FarmPersonnelRow[];
  farmStock: FarmStockRow[];
}

function toFarmStatus(status: string | null): Farm['status'] {
  if (status === 'empty' || status === 'maintenance') {
    return status;
  }

  return 'active';
}

function toFarmIdCode(name: string) {
  return `${name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function mapFarmRowToFarm(row: Tables<'farms'>, farmCycles: FarmCycleRow[]): Farm {
  const currentBirdCount = farmCycles.reduce((acc, cycle) => acc + (cycle.initial_birds || 0), 0);

  let totalFCR = 0;
  let totalLivability = 0;
  let metricsCount = 0;

  farmCycles.forEach((cycle) => {
    const metrics = cycle.performance_metrics || [];
    if (!metrics.length) {
      return;
    }

    const latest = metrics
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    totalFCR += latest.fcr_to_date || 0;
    totalLivability += latest.livability_pct || 1;
    metricsCount += 1;
  });

  const avgFCR = metricsCount > 0 ? totalFCR / metricsCount : 0;
  const avgLivability = metricsCount > 0 ? totalLivability / metricsCount : 1;
  const bpi = avgFCR > 0 ? (avgLivability * 100 * 1.8) / (avgFCR * 32) * 100 : 0;

  return {
    id: row.id,
    name: row.name,
    region: row.region || 'Unknown',
    status: toFarmStatus(row.status),
    sensorsEnabled: row.sensors_enabled ?? false,
    capacity: row.capacity,
    currentBirdCount,
    activeCycles: farmCycles.length,
    avgFCR,
    avgLiveWeight: 0,
    bpi,
    coordinates: {
      lat: row.location_lat || 14.5995,
      lng: row.location_lng || 120.9842,
    },
    lastUpdated: new Date(row.created_at),
  };
}

export async function fetchFarms(orgId: string) {
  try {
    const resolvedOrgId = requireOrgId(orgId);
    const farmsData = await getFarms(resolvedOrgId);
    const farmIds = (farmsData || []).map((farm) => farm.id);
    const cyclesData = farmIds.length ? await getActiveCyclesByFarms(resolvedOrgId, farmIds) : [];

    return (farmsData || []).map((farm) => {
      const farmCycles = ((cyclesData || []) as FarmCycleRow[]).filter((cycle) => cycle.farm_id === farm.id);
      return mapFarmRowToFarm(farm, farmCycles);
    });
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch farms.', 'farms.fetchFarms');
  }
}

export async function fetchFarmDetails(farmId: string): Promise<FarmDetailsData> {
  try {
    const [{ data: history, error: historyError }, personnel, stock] = await Promise.all([
      supabase
        .from('production_cycles')
        .select(`
          id,
          batch_name,
          initial_birds,
          start_date,
          actual_end_date,
          status,
          performance_metrics (created_at, fcr_to_date, livability_pct)
        `)
        .eq('farm_id', farmId)
        .order('actual_end_date', { ascending: false }),
      getFarmPersonnel(farmId),
      getFarmInventoryStock(farmId),
    ]);

    if (historyError) {
      throw historyError;
    }

    return {
      farmHistory: (history || []) as FarmHistoryRow[],
      farmPersonnel: (personnel || []) as FarmPersonnelRow[],
      farmStock: (stock || []) as FarmStockRow[],
    };
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch farm details.', 'farms.fetchFarmDetails');
  }
}

export async function createFarmRecord(input: {
  name: string;
  region: string;
  capacity: number;
  houseCount?: number;
  lat?: number;
  lng?: number;
  orgId?: string | null;
}) {
  try {
    const payload: TablesInsert<'farms'> = {
      org_id: requireOrgId(input.orgId),
      farm_id_code: toFarmIdCode(input.name),
      name: input.name,
      region: input.region,
      capacity: input.capacity,
      house_count: input.houseCount ?? 1,
      location_lat: input.lat ?? null,
      location_lng: input.lng ?? null,
      sensors_enabled: false,
      status: 'active',
    };

    const { data, error } = await supabase
      .from('farms')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      throw error ?? new Error('Farm creation failed.');
    }

    return mapFarmRowToFarm(data, []);
  } catch (error) {
    throw toDataLayerError(error, 'Failed to create farm.', 'farms.createFarmRecord');
  }
}
