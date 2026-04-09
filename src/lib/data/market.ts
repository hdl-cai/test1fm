import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { requireOrgId } from './context';
import { toDataLayerError } from './errors';

export type MarketPrice = Database['public']['Tables']['market_prices']['Row'];
export type MarketPriceInsert = Database['public']['Tables']['market_prices']['Insert'];
export type MarketPriceUpdate = Database['public']['Tables']['market_prices']['Update'];
export type MarketPriceWithProfile = MarketPrice & {
  profiles: { first_name: string | null; last_name: string | null } | null;
};

/**
 * Fetch market prices for an organization, optionally filtered by region or date range
 */
export async function fetchMarketPrices(
  orgId: string,
  filters?: {
    region?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<MarketPriceWithProfile[]> {
  try {
    const resolvedOrgId = requireOrgId(orgId);
    let query = supabase
      .from('market_prices')
      .select('*, profiles!entered_by(first_name, last_name)')
      .eq('org_id', resolvedOrgId)
      .order('price_date', { ascending: false });

    if (filters?.region) {
      query = query.eq('region', filters.region);
    }

    if (filters?.startDate) {
      query = query.gte('price_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('price_date', filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as MarketPriceWithProfile[];
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch market prices.', 'market.fetchMarketPrices');
  }
}

/**
 * Fetch the latest market price for a specific region
 */
export async function fetchLatestMarketPrice(
  orgId: string,
  region: string
): Promise<MarketPrice | null> {
  try {
    const resolvedOrgId = requireOrgId(orgId);
    const { data, error } = await supabase
      .from('market_prices')
      .select('*')
      .eq('org_id', resolvedOrgId)
      .eq('region', region)
      .order('price_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to fetch latest market price.', 'market.fetchLatestMarketPrice');
  }
}

/**
 * Create or update a market price entry
 */
export async function upsertMarketPrice(
  orgId: string,
  priceData: Omit<MarketPriceInsert, 'org_id' | 'entered_by'>,
  userId: string
): Promise<MarketPrice> {
  try {
    const resolvedOrgId = requireOrgId(orgId);
    
    // Check if an entry already exists for this date and region to handle upsert correctly
    // Note: The table might not have a unique constraint on (org_id, price_date, region)
    // but the UI typically wants to update if it exists or create new if not.
    
    const { data, error } = await supabase
      .from('market_prices')
      .upsert({
        ...priceData,
        org_id: resolvedOrgId,
        entered_by: userId,
        last_verified_at: new Date().toISOString() // Manual entries are verified on entry
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to save market price.', 'market.upsertMarketPrice');
  }
}

/**
 * Verify a market price entry (used for auto-imported data)
 */
export async function verifyMarketPrice(
  priceId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('market_prices')
      .update({
        last_verified_at: new Date().toISOString()
      })
      .eq('id', priceId);

    if (error) throw error;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to verify market price.', 'market.verifyMarketPrice');
  }
}

/**
 * Delete a market price entry
 */
export async function deleteMarketPrice(
  priceId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('market_prices')
      .delete()
      .eq('id', priceId);

    if (error) throw error;
  } catch (error) {
    throw toDataLayerError(error, 'Failed to delete market price.', 'market.deleteMarketPrice');
  }
}
