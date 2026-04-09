// dispatch-notification
// Generic notification dispatcher.
// Called by application code or DB webhooks to:
//   1. Insert a notifications row (if not already done by a trigger)
//   2. Optionally send an email via Resend
//   3. Optionally send a Web Push via /functions/v1/send-push
//
// POST body:
// {
//   recipientId: string,
//   orgId: string,
//   type: string,
//   eventType?: string,
//   urgency?: 'critical' | 'warning' | 'info',
//   title: string,
//   message: string,
//   link?: string,
//   farmId?: string,
//   cycleId?: string,
//   skipInsert?: boolean   // true when DB trigger already inserted the row
// }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      recipientId,
      orgId,
      type = 'system',
      eventType,
      urgency = 'info',
      title,
      message,
      link,
      farmId,
      cycleId,
      skipInsert = false,
    } = body;

    if (!recipientId || !orgId || !title || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Insert notification row (unless DB trigger already did it)
    if (!skipInsert) {
      const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      const { error: insertError } = await supabase.from('notifications').insert({
        recipient_id: recipientId,
        org_id: orgId,
        type,
        event_type: eventType ?? null,
        urgency,
        title,
        message,
        link: link ?? null,
        farm_id: farmId ?? null,
        cycle_id: cycleId ?? null,
        expires_at: expiresAt,
      });
      if (insertError) throw insertError;
    }

    // 2. Check user notification preferences
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('email_enabled, push_enabled, disabled_event_types')
      .eq('user_id', recipientId)
      .single();

    const emailEnabled = prefs?.email_enabled ?? true;
    const pushEnabled = prefs?.push_enabled ?? false;
    const disabledTypes: string[] = prefs?.disabled_event_types ?? [];

    if (eventType && disabledTypes.includes(eventType) && urgency !== 'critical') {
      // User has opted out of this event type (critical events always delivered)
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Email dispatch via Resend
    if (emailEnabled && RESEND_API_KEY) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', recipientId)
        .single();

      if (profile?.email) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'FlockMate <notifications@flockmate.app>',
            to: [profile.email],
            subject: title,
            html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
              <h2 style="color:#166534">${title}</h2>
              <p>${message}</p>
              ${link ? `<p><a href="${link}" style="color:#16a34a">View in FlockMate →</a></p>` : ''}
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
              <p style="font-size:12px;color:#6b7280">You received this because you have email notifications enabled in FlockMate. <a href="/settings?tab=notifications">Manage preferences</a></p>
            </div>`,
          }),
        });
      }
    }

    // 4. Web Push dispatch (delegates to send-push function)
    if (pushEnabled) {
      const pushUrl = `${SUPABASE_URL}/functions/v1/send-push`;
      await fetch(pushUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipientId, title, message, link }),
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
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
