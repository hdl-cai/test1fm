/**
 * Offline Queue — IndexedDB-backed action queue for offline-capable submissions.
 *
 * Supported action types (per Phase 5 spec):
 *  - 'daily_report'     → addDailyLogRecord
 *  - 'weight_sample'    → insert into weight_samples
 *  - 'supply_delivery'  → insert into delivered_inputs
 *
 * On reconnect the queue is flushed in FIFO order. Conflicts (e.g. duplicate
 * daily log for the same date) surface as in-app toast notifications.
 */

import { openDB, type IDBPDatabase } from 'idb';
import { supabase } from '@/lib/supabase';

// ─── DB Schema ───────────────────────────────────────────────────────────────

const DB_NAME = 'flockmate-offline';
const DB_VERSION = 1;
const STORE = 'pending-actions';

export type QueuedActionType = 'daily_report' | 'weight_sample' | 'supply_delivery';

export interface QueuedAction {
  id?: number; // auto-increment key
  type: QueuedActionType;
  payload: Record<string, unknown>;
  createdAt: string; // ISO string
  retries: number;
}

let _db: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
  return _db;
}

// ─── Write ────────────────────────────────────────────────────────────────────

/** Enqueue an action to be flushed when online. */
export async function enqueueAction(
  type: QueuedActionType,
  payload: Record<string, unknown>,
): Promise<void> {
  const db = await getDb();
  const action: QueuedAction = {
    type,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  };
  await db.add(STORE, action);
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/** Return all pending actions in insertion order. */
export async function getPendingActions(): Promise<QueuedAction[]> {
  const db = await getDb();
  return db.getAll(STORE) as Promise<QueuedAction[]>;
}

export async function getPendingCount(): Promise<number> {
  const db = await getDb();
  return db.count(STORE);
}

// ─── Flush ────────────────────────────────────────────────────────────────────

type FlushResult = { succeeded: number; failed: number; conflicts: string[] };

/**
 * Flush all queued actions. Processes FIFO.
 * Returns a summary of results so the caller can surface conflicts to the user.
 */
export async function flushQueue(): Promise<FlushResult> {
  if (!navigator.onLine) return { succeeded: 0, failed: 0, conflicts: [] };

  const db = await getDb();
  const actions = (await db.getAll(STORE)) as QueuedAction[];
  const result: FlushResult = { succeeded: 0, failed: 0, conflicts: [] };

  for (const action of actions) {
    try {
      await executeAction(action);
      await db.delete(STORE, action.id!);
      result.succeeded++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (isConflict(message)) {
        // Duplicate submission — remove from queue but report to user
        await db.delete(STORE, action.id!);
        result.conflicts.push(`${action.type} at ${action.createdAt}`);
      } else {
        // Transient error — increment retries, keep in queue
        const updated: QueuedAction = { ...action, retries: action.retries + 1 };
        await db.put(STORE, updated);
        result.failed++;
      }
    }
  }

  return result;
}

/** Clear the entire queue (used in testing / user-initiated reset). */
export async function clearQueue(): Promise<void> {
  const db = await getDb();
  await db.clear(STORE);
}

// ─── Executors ────────────────────────────────────────────────────────────────

async function executeAction(action: QueuedAction): Promise<void> {
  switch (action.type) {
    case 'daily_report':
      await executeDailyReport(action.payload);
      break;
    case 'weight_sample':
      await executeWeightSample(action.payload);
      break;
    case 'supply_delivery':
      await executeSupplyDelivery(action.payload);
      break;
    default:
      throw new Error(`Unknown action type: ${(action as QueuedAction).type}`);
  }
}

async function executeDailyReport(p: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from('daily_logs').insert({
    org_id: p.orgId as string,
    cycle_id: p.cycleId as string,
    log_date: p.logDate as string,
    mortality_count: (p.mortalityCount as number) ?? 0,
    culled_count: (p.culledCount as number) ?? 0,
    feed_used_kg: p.feedUsedKg as number,
    avg_temp_c: (p.avgTempC as number | null) ?? null,
    avg_humidity_pct: (p.avgHumidityPct as number | null) ?? null,
    submitted_by: p.userId as string,
    entry_type: 'grower_entry',
    status: 'submitted',
  });
  if (error) throw error;
}

async function executeWeightSample(p: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from('weight_samples').insert({
    org_id: p.orgId as string,
    cycle_id: p.cycleId as string,
    farm_id: p.farmId as string,
    sample_date: p.sampleDate as string,
    sample_weight_g: p.sampleWeightG as number,
    bird_count: p.birdCount as number,
    recorded_by: p.recordedBy as string,
    notes: (p.notes as string | null) ?? null,
  });
  if (error) throw error;
}

async function executeSupplyDelivery(p: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from('delivered_inputs').insert({
    org_id: p.orgId as string,
    cycle_id: p.cycleId as string,
    farm_id: p.farmId as string,
    item_name: p.itemName as string,
    item_type: (p.itemType as string) ?? 'feed',
    quantity_delivered: p.quantityDelivered as number,
    unit: (p.unit as string) ?? 'kg',
    cost_per_unit: (p.costPerUnit as number) ?? 0,
    delivery_date: p.deliveryDate as string,
    received_by: (p.receivedBy as string | null) ?? null,
    notes: (p.notes as string | null) ?? null,
  });
  if (error) throw error;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isConflict(message: string): boolean {
  // Supabase/Postgres unique violation code
  return (
    message.includes('unique') ||
    message.includes('duplicate') ||
    message.includes('23505')
  );
}

// ─── Online Listener ─────────────────────────────────────────────────────────

let _listenerAttached = false;

/**
 * Call once on app mount. Automatically flushes the queue when the browser
 * comes back online. Returns the flush result via the provided callback.
 */
export function registerOnlineListener(
  onFlush: (result: FlushResult) => void,
): () => void {
  if (_listenerAttached) return () => undefined;

  const handler = async () => {
    const result = await flushQueue();
    if (result.succeeded > 0 || result.failed > 0 || result.conflicts.length > 0) {
      onFlush(result);
    }
  };

  window.addEventListener('online', handler);
  _listenerAttached = true;

  return () => {
    window.removeEventListener('online', handler);
    _listenerAttached = false;
  };
}
