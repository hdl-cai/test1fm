/// <reference types="node" />

import assert from 'node:assert/strict';
import {
  mapCycleRowToProductionCycle,
  mapProfileRowToAuthUser,
  mapProfileRowToPerson,
  toHealthRecordStatus,
  toHealthRecordType,
  toUserRole,
} from '../../data-adapters.ts';
import { DataLayerError, toDataLayerError } from '../errors.ts';

function runCheck(name: string, check: () => void) {
  try {
    check();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

runCheck('toUserRole falls back to personnel for unknown roles', () => {
  assert.equal(toUserRole('owner'), 'owner');
  assert.equal(toUserRole('not-a-role'), 'personnel');
});

runCheck('health adapters normalize unsupported values safely', () => {
  assert.equal(toHealthRecordType('vaccination'), 'vaccination');
  assert.equal(toHealthRecordType('mystery'), 'inspection');
  assert.equal(toHealthRecordStatus(true), 'completed');
  assert.equal(toHealthRecordStatus(false), 'scheduled');
});

runCheck('mapProfileRowToAuthUser builds an auth-safe profile shape', () => {
  const profile: Parameters<typeof mapProfileRowToAuthUser>[0] = {
    id: 'user-1',
    email: 'ada@example.com',
    first_name: 'Ada',
    last_name: 'Lovelace',
    role: 'owner',
    org_id: 'org-1',
  };

  assert.deepEqual(mapProfileRowToAuthUser(profile), {
    id: 'user-1',
    email: 'ada@example.com',
    name: 'Ada Lovelace',
    role: 'owner',
    orgId: 'org-1',
  });
});

runCheck('mapProfileRowToPerson keeps phone fallback and farm assignments', () => {
  const profile: Parameters<typeof mapProfileRowToPerson>[0] = {
    id: 'user-2',
    first_name: 'Grace',
    last_name: 'Hopper',
    email: 'grace@example.com',
    contact_number: null,
    role: 'not-a-real-role',
    status: 'inactive',
    avatar_url: null,
    assignments: [
      { farm_id: 'farm-1', role: 'grower' },
      { farm_id: 'farm-2', role: 'technician' },
    ],
  } as Parameters<typeof mapProfileRowToPerson>[0];

  assert.deepEqual(mapProfileRowToPerson(profile), {
    id: 'user-2',
    name: 'Grace Hopper',
    email: 'grace@example.com',
    phone: '',
    role: 'personnel',
    status: 'inactive',
    avatar: undefined,
    assignedFarms: ['farm-1', 'farm-2'],
  });
});

runCheck('mapCycleRowToProductionCycle uses the latest metric snapshot', () => {
  const cycle: Parameters<typeof mapCycleRowToProductionCycle>[0] = {
    id: 'cycle-1',
    farm_id: 'farm-1',
    grower_id: 'user-1',
    batch_name: 'Batch A',
    start_date: '2026-01-01',
    anticipated_harvest_date: '2026-02-01',
    initial_birds: 1000,
    status: 'active',
    performance_metrics: [
      { created_at: '2026-01-02', fcr_to_date: 1.5, livability_pct: 0.96 },
      { created_at: '2026-01-05', fcr_to_date: 1.45, livability_pct: 0.98 },
    ],
  } as Parameters<typeof mapCycleRowToProductionCycle>[0];

  const mapped = mapCycleRowToProductionCycle(cycle);

  assert.equal(mapped.id, 'cycle-1');
  assert.equal(mapped.batchName, 'Batch A');
  assert.equal(mapped.status, 'active');
  assert.equal(mapped.fcr, 1.45);
  assert.equal(mapped.mortalityRate, 2);
  assert.equal(mapped.expectedEndDate.toISOString().startsWith('2026-02-01'), true);
});

runCheck('toDataLayerError preserves an existing data-layer error', () => {
  const original = new DataLayerError('Already normalized', { context: 'tests.data-layer' });

  assert.equal(toDataLayerError(original, 'Fallback', 'tests.other'), original);
});

runCheck('toDataLayerError wraps standard errors with context', () => {
  const wrapped = toDataLayerError(new Error('Boom'), 'Fallback', 'tests.data-layer');

  assert.equal(wrapped.name, 'DataLayerError');
  assert.equal(wrapped.message, 'Boom');
  assert.equal(wrapped.context, 'tests.data-layer');
  assert.ok(wrapped.cause instanceof Error);
});

console.log('All data-layer checks passed.');
