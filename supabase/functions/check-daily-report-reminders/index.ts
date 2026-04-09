// check-daily-report-reminders
// Scheduled Edge Function — runs daily at 6 PM and 9 PM Manila time (UTC+8)
// via Supabase cron: '0 10,13 * * *' (10:00 and 13:00 UTC = 18:00 and 21:00 PHT)
//
// Finds all active production cycles that have NO daily_log for today,
// then dispatches a reminder notification to the cycle's grower + farm technicians.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const todayPHT = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    // Get all active cycles
    const { data: cycles, error: cyclesError } = await supabase
      .from('production_cycles')
      .select('id, org_id, farm_id, grower_id, batch_name, farm:farms!production_cycles_farm_id_fkey(name)')
      .eq('status', 'active');

    if (cyclesError) throw cyclesError;
    if (!cycles || cycles.length === 0) {
      return new Response(JSON.stringify({ ok: true, checked: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find cycles that have no daily log for today
    const { data: logsToday } = await supabase
      .from('daily_logs')
      .select('cycle_id')
      .eq('log_date', todayPHT);

    const loggedCycleIds = new Set((logsToday ?? []).map((l: { cycle_id: string }) => l.cycle_id));

    const pendingCycles = cycles.filter((c: { id: string }) => !loggedCycleIds.has(c.id));

    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    let dispatched = 0;

    for (const cycle of pendingCycles) {
      const farmName = (cycle.farm as { name?: string } | null)?.name ?? 'Your farm';

      // Notify grower
      if (cycle.grower_id) {
        await supabase.from('notifications').insert({
          recipient_id: cycle.grower_id,
          org_id: cycle.org_id,
          type: 'daily_report_reminder',
          event_type: 'daily_report_reminder',
          urgency: 'warning',
          title: 'Daily Report Reminder',
          message: `Don't forget to submit today's daily report for ${farmName}.`,
          link: `/production-cycles/${cycle.id}`,
          farm_id: cycle.farm_id,
          cycle_id: cycle.id,
          expires_at: expiresAt,
        });
        dispatched++;
      }
    }

    return new Response(JSON.stringify({ ok: true, checked: cycles.length, dispatched }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
