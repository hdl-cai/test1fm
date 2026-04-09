// check-feed-stock-low
// Scheduled Edge Function — runs daily at 7 AM Manila time (UTC+8) = 23:00 UTC previous day
// via Supabase cron: '0 23 * * *'
//
// Finds feed inventory items where current_qty <= low_stock_threshold (projected
// to run out within ~5 days based on the org-configured threshold) and dispatches
// a warning notification per farm.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const todayPHT = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().split('T')[0];
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Get all feed stock that is at or below the low_stock_threshold
    const { data: lowStockItems, error } = await supabase
      .from('inventory_stock')
      .select(`
        id, current_qty, farm_id, item_id, org_id,
        item:inventory_items!inventory_stock_item_id_fkey(
          name, low_stock_threshold,
          category:inventory_categories!inventory_items_category_id_fkey(name)
        ),
        farm:farms!inventory_stock_farm_id_fkey(name)
      `);

    if (error) throw error;

    let notified = 0;

    for (const stock of lowStockItems ?? []) {
      const item = Array.isArray(stock.item) ? stock.item[0] : stock.item;
      if (!item) continue;

      const category = Array.isArray(item.category) ? item.category[0] : item.category;
      const categoryName: string = (category?.name ?? '').toLowerCase();

      // Only process feed items
      if (!categoryName.includes('feed')) continue;

      const threshold = item.low_stock_threshold ?? 0;
      // Skip items with no threshold set or that are above threshold
      if (threshold <= 0 || stock.current_qty > threshold) continue;

      // Dedup: skip if already notified today for this item+farm
      const { count: existingCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', stock.org_id)
        .eq('event_type', 'feed_stock_low_projected')
        .gte('created_at', `${todayPHT}T00:00:00+08:00`)
        .eq('farm_id', stock.farm_id)
        .like('link', `%${stock.item_id}%`);

      if ((existingCount ?? 0) > 0) continue;

      const farmName = (Array.isArray(stock.farm) ? stock.farm[0] : stock.farm)?.name ?? 'a farm';

      // Notify org admins + owners
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('org_id', stock.org_id)
        .in('role', ['admin', 'owner']);

      for (const admin of admins ?? []) {
        await supabase.from('notifications').insert({
          recipient_id: admin.id,
          org_id: stock.org_id,
          type: 'feed_stock_low_projected',
          event_type: 'feed_stock_low_projected',
          urgency: 'warning',
          title: 'Feed Stock Running Low',
          message: `${item.name} stock at ${farmName} is low (${stock.current_qty} remaining). Projected to run out within 5 days — consider reordering.`,
          link: `/inventory?item=${stock.item_id}`,
          farm_id: stock.farm_id,
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
