-- =============================================================
-- Phase 3A: Grower Performance v2 — EPEF, Career Tiers, Leaderboard
-- Apply via: Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. ALTER grower_performance — add v2 fields
ALTER TABLE grower_performance
  ADD COLUMN IF NOT EXISTS rank_at_close    INTEGER,
  ADD COLUMN IF NOT EXISTS career_tier      TEXT CHECK (career_tier IN ('training','junior','senior','elite')),
  ADD COLUMN IF NOT EXISTS calculated_at   TIMESTAMPTZ;

-- 2. DB function: calculate_epef(cycle_id)
-- Computes Livability%, ADG, FCR, EPEF for a closed cycle
-- EPEF = (Livability% × ADG_g) / (FCR × harvest_age_days) × 100
CREATE OR REPLACE FUNCTION calculate_epef(p_cycle_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_cycle           RECORD;
  v_livability_pct  NUMERIC;
  v_adg_g           NUMERIC;
  v_fcr             NUMERIC;
  v_harvest_age     INTEGER;
  v_epef            NUMERIC;
  v_total_birds     INTEGER;
  v_total_harvested INTEGER;
  v_total_feed_kg   NUMERIC;
  v_avg_weight_kg   NUMERIC;
BEGIN
  -- Get cycle data
  SELECT c.*, 
         gp.total_birds_placed,
         gp.total_birds_harvested,
         gp.total_feed_consumed_kg,
         gp.average_harvest_weight_kg
  INTO v_cycle
  FROM production_cycles c
  LEFT JOIN grower_performance gp ON gp.cycle_id = c.id
  WHERE c.id = p_cycle_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Cycle not found');
  END IF;

  v_total_birds     := COALESCE(v_cycle.total_birds_placed, v_cycle.bird_count, 0);
  v_total_harvested := COALESCE(v_cycle.total_birds_harvested, 0);
  v_total_feed_kg   := COALESCE(v_cycle.total_feed_consumed_kg, 0);
  v_avg_weight_kg   := COALESCE(v_cycle.average_harvest_weight_kg, 0);

  -- Cannot compute without data
  IF v_total_birds = 0 OR v_total_harvested = 0 OR v_total_feed_kg = 0 OR v_avg_weight_kg = 0 THEN
    RETURN jsonb_build_object('status', 'pending', 'reason', 'Incomplete data');
  END IF;

  -- Harvest age in days
  v_harvest_age := GREATEST(1,
    EXTRACT(DAY FROM (COALESCE(v_cycle.end_date, NOW()::date) - v_cycle.start_date))::integer
  );

  -- Livability %
  v_livability_pct := (v_total_harvested::numeric / v_total_birds::numeric) * 100;

  -- ADG in grams
  v_adg_g := (v_avg_weight_kg * 1000) / v_harvest_age;

  -- FCR = total_feed_kg / (total_harvested_birds × avg_weight_kg)
  v_fcr := v_total_feed_kg / (v_total_harvested * v_avg_weight_kg);

  -- EPEF
  v_epef := (v_livability_pct * v_adg_g) / (v_fcr * v_harvest_age) * 100;

  RETURN jsonb_build_object(
    'status',          'computed',
    'livability_pct',  ROUND(v_livability_pct, 2),
    'adg_g',           ROUND(v_adg_g, 2),
    'fcr',             ROUND(v_fcr, 3),
    'harvest_age',     v_harvest_age,
    'epef',            ROUND(v_epef, 1)
  );
END;
$$;

-- 3. DB function: calculate_career_tier(grower_id)
-- Reads last 5 completed cycles, computes avg EPEF → tier
CREATE OR REPLACE FUNCTION calculate_career_tier(p_grower_id UUID)
RETURNS TEXT LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_cycle_count INTEGER;
  v_avg_epef    NUMERIC;
BEGIN
  SELECT COUNT(*), AVG(epef_score)
  INTO v_cycle_count, v_avg_epef
  FROM (
    SELECT gp.epef_score
    FROM grower_performance gp
    JOIN production_cycles pc ON pc.id = gp.cycle_id
    WHERE gp.grower_id = p_grower_id
      AND pc.status = 'closed'
      AND gp.epef_score IS NOT NULL
    ORDER BY pc.end_date DESC
    LIMIT 5
  ) recent;

  IF v_cycle_count < 3 THEN RETURN 'training'; END IF;
  IF v_avg_epef >= 350 THEN RETURN 'elite'; END IF;
  IF v_avg_epef >= 280 THEN RETURN 'senior'; END IF;
  RETURN 'junior';
END;
$$;

-- 4. DB function: calculate_ranks(org_id)
-- Ranks growers by latest EPEF score
CREATE OR REPLACE FUNCTION calculate_ranks(p_org_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Update rank_at_close and career_tier for the latest performance record per grower
  WITH ranked AS (
    SELECT
      gp.id AS perf_id,
      gp.grower_id,
      gp.epef_score,
      RANK() OVER (ORDER BY gp.epef_score DESC NULLS LAST) AS rk,
      calculate_career_tier(gp.grower_id) AS tier
    FROM grower_performance gp
    JOIN production_cycles pc ON pc.id = gp.cycle_id
    WHERE gp.org_id = p_org_id
      AND pc.status = 'closed'
      AND gp.epef_score IS NOT NULL
      AND gp.id IN (
        -- Only the most recent performance per grower
        SELECT DISTINCT ON (grower_id) id
        FROM grower_performance
        WHERE org_id = p_org_id
        ORDER BY grower_id, created_at DESC
      )
  )
  UPDATE grower_performance gp
  SET rank_at_close  = ranked.rk,
      career_tier    = ranked.tier,
      calculated_at  = NOW()
  FROM ranked
  WHERE gp.id = ranked.perf_id;
END;
$$;

-- 5. RLS: grower_performance
ALTER TABLE grower_performance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gp_admin_all" ON grower_performance;
CREATE POLICY "gp_admin_all" ON grower_performance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND org_id = grower_performance.org_id
        AND role IN ('admin', 'owner')
    )
  );

DROP POLICY IF EXISTS "gp_grower_own" ON grower_performance;
CREATE POLICY "gp_grower_own" ON grower_performance
  FOR SELECT USING (
    grower_id = auth.uid()
  );

DROP POLICY IF EXISTS "gp_tech_assigned" ON grower_performance;
CREATE POLICY "gp_tech_assigned" ON grower_performance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'technician'
      AND org_id = grower_performance.org_id
    )
  );
