// check-harvest-pending
// Scheduled Edge Function — runs daily at 7 AM Manila time (UTC+8) = 23:00 UTC previous day
// via Supabase cron: '0 23 * * *'
//
// Finds harvest logs that have been submitted (created) but not yet validated
// (is_validated = false) for more than 24 hours, and notifies org admins to review.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const todayPHT = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().split('T')[0];
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Find harvest logs that are unvalidated and older than 24 hours
    const { data: pendingLogs, error } = await supabase
      .from('harvest_logs')
      .select('id, cycle_id, org_id, harvest_date_start, created_at')
      .eq('is_validated', false)
      .is('deleted_at', null)
      .lt('created_at', cutoffTime);

    if (error) throw error;

    let notified = 0;

    for (const log of pendingLogs ?? []) {
      // Dedup: skip if we already sent this notification today for this harvest log
      const { count: existingCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', log.org_id)
        .eq('event_type', 'harvest_pending_verification')
        .gte('created_at', `${todayPHT}T00:00:00+08:00`)
        .like('link', `%${log.cycle_id}%`);

      if ((existingCount ?? 0) > 0) continue;

      // Notify org admins + owners
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('org_id', log.org_id)
        .in('role', ['admin', 'owner']);

      for (const admin of admins ?? []) {
        await supabase.from('notifications').insert({
          recipient_id: admin.id,
          org_id: log.org_id,
          type: 'harvest_pending_verification',
          event_type: 'harvest_pending_verification',
          urgency: 'warning',
          title: 'Harvest Pending Verification',
          message: 'A harvest log has been submitted and is awaiting admin verification for more than 24 hours.',
          link: `/cycles/${log.cycle_id}?tab=harvest`,
          expires_at: expiresAt,
        });
        notified++;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, notified }),
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
