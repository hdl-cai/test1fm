import { supabase } from '@/lib/supabase';
import {
  toHealthRecordStatus,
  toHealthRecordType,
  type VaccinationScheduleRow,
} from '@/lib/data-adapters';
import type { HealthRecord } from '@/types';
import { requireOrgId, requireUserId } from './context';
import { toDataLayerError } from './errors';
import type { TablesInsert, TablesUpdate } from '@/types/supabase';

export interface HealthData {
  records: HealthRecord[];
  schedules: VaccinationScheduleRow[];
  activeMedicationsCount: number;
  quarantinedBirdsCount: number;
  vaccinationCoverage: number;
}

export async function fetchHealthData(orgId: string): Promise<HealthData> {
  try {
    const resolvedOrgId = requireOrgId(orgId);
    const [
      { data: recordsData, error: recordsError },
      { data: medLogs, error: medError },
      { data: vaxData, error: vaxError },
    ] = await Promise.all([
      supabase
        .from('health_records')
        .select(`
          *,
          veterinarian:profiles!health_records_veterinarian_id_fkey(first_name, last_name)
        `)
        .eq('org_id', resolvedOrgId)
        .order('record_date', { ascending: false }),
      supabase.from('medication_logs').select('*').eq('org_id', resolvedOrgId),
      supabase.from('vaccination_schedules').select('*').eq('org_id', resolvedOrgId),
    ]);

    if (recordsError) throw recordsError;
    if (medError) throw medError;
    if (vaxError) throw vaxError;

    const records: HealthRecord[] = (recordsData || []).map((row) => ({
      id: row.id,
      type: toHealthRecordType(row.record_type),
      description: row.subject,
      date: new Date(row.record_date),
      vetId: row.veterinarian_id || '',
      status: toHealthRecordStatus(row.is_gahp_compliant),
      medication: row.notes?.split('\n')[0],
      dosage: 'As prescribed',
      cycleId: row.cycle_id,
    }));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeMedicationsCount = medLogs?.filter((log) => new Date(log.created_at) > sevenDaysAgo).length || 0;
    const quarantineRecords = recordsData?.filter((record) => record.subject.toLowerCase().includes('quarantine')) || [];
    const quarantinedBirdsCount = quarantineRecords.length > 0 ? 45 : 0;
    const completedVax = vaxData?.filter((schedule) => schedule.status === 'completed').length || 0;
    const totalVax = vaxData?.length || 1;
    const vaccinationCoverage = Math.round((completedVax / totalVax) * 100);

    return {
      records,
      schedules: (vaxData || []) as VaccinationScheduleRow[],
      activeMedicationsCount,
      quarantinedBirdsCount,
      vaccinationCoverage,
    };
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch health data.', 'health.fetchHealthData');
  }
}

export async function addHealthRecord(input: {
  cycleId: string;
  orgId?: string | null;
  userId?: string | null;
  recordDate: string;
  recordType: string;
  subject: string;
  notes?: string;
  medicationName?: string;
  dosage?: string;
  birdsAffected?: number;
  outcome?: 'resolved' | 'ongoing' | 'escalated';
  isGahpCompliant?: boolean;
}) {
  try {
    const payload: TablesInsert<'health_records'> = {
      cycle_id: input.cycleId,
      org_id: requireOrgId(input.orgId),
      submitted_by: requireUserId(input.userId),
      record_date: input.recordDate,
      record_type: input.recordType,
      subject: input.subject,
      notes: input.notes ?? null,
      medication_name: input.medicationName ?? null,
      dosage: input.dosage ?? null,
      birds_affected: input.birdsAffected ?? null,
      outcome: input.outcome ?? null,
      is_gahp_compliant: input.isGahpCompliant ?? false,
    };

    const { data, error } = await supabase
      .from('health_records')
      .insert(payload)
      .select(`*, veterinarian:profiles!health_records_veterinarian_id_fkey(first_name, last_name)`)
      .single();

    if (error || !data) throw error ?? new Error('Failed to create health record.');
    return data;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to add health record.', 'health.addHealthRecord');
  }
}

export async function markVaccinationDone(input: {
  scheduleId: string;
  completedDate: string;
  vaccineBrandBatch?: string;
  notes?: string;
  verifiedByTechId?: string;
}) {
  try {
    const updates: TablesUpdate<'vaccination_schedules'> = {
      status: 'completed',
      completed_date: input.completedDate,
      vaccine_brand_batch: input.vaccineBrandBatch ?? null,
      notes: input.notes ?? null,
      verified_by_tech_id: input.verifiedByTechId ?? null,
    };

    const { data, error } = await supabase
      .from('vaccination_schedules')
      .update(updates)
      .eq('id', input.scheduleId)
      .select('*')
      .single();

    if (error || !data) throw error ?? new Error('Failed to mark vaccination as done.');
    return data as VaccinationScheduleRow;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to mark vaccination as done.', 'health.markVaccinationDone');
  }
}

export async function rescheduleVaccination(input: {
  scheduleId: string;
  newDate: string;
  rescheduleNote: string;
}) {
  try {
    const updates: TablesUpdate<'vaccination_schedules'> = {
      scheduled_date: input.newDate,
      reschedule_note: input.rescheduleNote,
      status: 'scheduled',
    };

    const { data, error } = await supabase
      .from('vaccination_schedules')
      .update(updates)
      .eq('id', input.scheduleId)
      .select('*')
      .single();

    if (error || !data) throw error ?? new Error('Failed to reschedule vaccination.');
    return data as VaccinationScheduleRow;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to reschedule vaccination.', 'health.rescheduleVaccination');
  }
}
