// check-vaccination-overdue
// Scheduled Edge Function — runs daily at 8 AM Manila time (UTC+8) = 00:00 UTC
// via Supabase cron: '0 0 * * *'
//
// Marks vaccination schedules as overdue and dispatches notifications
// when scheduled_date < today and status is still 'scheduled'.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const todayPHT = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    // Find scheduled vaccinations that are now overdue
    const { data: overdue, error: overdueError } = await supabase
      .from('vaccination_schedules')
      .select(`
        id, cycle_id, scheduled_date,
        cycle:production_cycles!vaccination_schedules_cycle_id_fkey(
          org_id, farm_id, grower_id,
          farm:farms!production_cycles_farm_id_fkey(name)
        )
      `)
      .eq('status', 'scheduled')
      .lt('scheduled_date', todayPHT);

    if (overdueError) throw overdueError;
    if (!overdue || overdue.length === 0) {
      return new Response(JSON.stringify({ ok: true, overdue: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark all found as overdue
    const overdueIds = overdue.map((v: { id: string }) => v.id);
    await supabase
      .from('vaccination_schedules')
      .update({ status: 'overdue' })
      .in('id', overdueIds);

    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    let notified = 0;

    // Group by cycle to avoid duplicate notifications per cycle
    const cyclesSeen = new Set<string>();

    for (const vax of overdue) {
      const cycleData = Array.isArray(vax.cycle) ? vax.cycle[0] : vax.cycle;
      const cycle = cycleData as {
        org_id: string;
        farm_id: string;
        grower_id: string | null;
        farm: { name?: string } | null;
      } | null;

      if (!cycle || cyclesSeen.has(vax.cycle_id)) continue;
      cyclesSeen.add(vax.cycle_id);

      const farmName = cycle.farm?.name ?? 'A farm';

      // Notify admins and technicians
      const { data: recipients } = await supabase
        .from('profiles')
        .select('id')
        .eq('org_id', cycle.org_id)
        .in('role', ['admin', 'owner', 'technician']);

      for (const recipient of recipients ?? []) {
        await supabase.from('notifications').insert({
          recipient_id: recipient.id,
          org_id: cycle.org_id,
          type: 'vaccination_overdue',
          event_type: 'vaccination_overdue',
          urgency: 'critical',
          title: 'Overdue Vaccination',
          message: `A scheduled vaccination for ${farmName} is overdue and has not been completed.`,
          link: `/production-cycles/${vax.cycle_id}`,
          farm_id: cycle.farm_id,
          cycle_id: vax.cycle_id,
          expires_at: expiresAt,
        });
        notified++;
      }

      // Notify grower too (if assigned)
      if (cycle.grower_id) {
        await supabase.from('notifications').insert({
          recipient_id: cycle.grower_id,
          org_id: cycle.org_id,
          type: 'vaccination_overdue',
          event_type: 'vaccination_overdue',
          urgency: 'critical',
          title: 'Overdue Vaccination',
          message: `A scheduled vaccination for ${farmName} is overdue. Please contact your technician.`,
          link: `/production-cycles/${vax.cycle_id}`,
          farm_id: cycle.farm_id,
          cycle_id: vax.cycle_id,
          expires_at: expiresAt,
        });
        notified++;
      }
    }

    // ── Due-Soon: vaccinations scheduled in the next 2 days ──────────────────
    const twoDaysLater = new Date(Date.now() + 8 * 60 * 60 * 1000 + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data: dueSoon } = await supabase
      .from('vaccination_schedules')
      .select(`
        id, cycle_id, scheduled_date,
        cycle:production_cycles!vaccination_schedules_cycle_id_fkey(
          org_id, farm_id, grower_id,
          farm:farms!production_cycles_farm_id_fkey(name)
        )
      `)
      .eq('status', 'scheduled')
      .gte('scheduled_date', todayPHT)
      .lte('scheduled_date', twoDaysLater);

    let dueSoonNotified = 0;
    const dueSoonCyclesSeen = new Set<string>();

    for (const vax of dueSoon ?? []) {
      const cycleData = Array.isArray(vax.cycle) ? vax.cycle[0] : vax.cycle;
      const cycle = cycleData as {
        org_id: string;
        farm_id: string;
        grower_id: string | null;
        farm: { name?: string } | null;
      } | null;

      if (!cycle || dueSoonCyclesSeen.has(vax.cycle_id)) continue;
      dueSoonCyclesSeen.add(vax.cycle_id);

      const farmName = cycle.farm?.name ?? 'A farm';

      // Dedup: skip if a due-soon notification was already sent for this cycle today
      const { count: existingCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('cycle_id', vax.cycle_id)
        .eq('event_type', 'vaccination_due_soon')
        .gte('created_at', `${todayPHT}T00:00:00+08:00`);

      if ((existingCount ?? 0) > 0) continue;

      const { data: recipients } = await supabase
        .from('profiles')
        .select('id')
        .eq('org_id', cycle.org_id)
        .in('role', ['admin', 'owner', 'technician']);

      for (const recipient of recipients ?? []) {
        await supabase.from('notifications').insert({
          recipient_id: recipient.id,
          org_id: cycle.org_id,
          type: 'vaccination_due_soon',
          event_type: 'vaccination_due_soon',
          urgency: 'warning',
          title: 'Vaccination Due Soon',
          message: `A vaccination for ${farmName} is due within 2 days (${vax.scheduled_date}). Please prepare accordingly.`,
          link: `/production-cycles/${vax.cycle_id}`,
          farm_id: cycle.farm_id,
          cycle_id: vax.cycle_id,
          expires_at: expiresAt,
        });
        dueSoonNotified++;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, overdue: overdue.length, notified, dueSoonNotified }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
