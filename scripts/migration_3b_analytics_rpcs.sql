-- =============================================================
-- Phase 3B: Advanced Analytics RPCs
-- Apply via: Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. fn_fcr_trend — FCR per closed cycle
CREATE OR REPLACE FUNCTION fn_fcr_trend(p_org_id UUID)
RETURNS TABLE (cycle_label TEXT, fcr NUMERIC, end_date DATE)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    COALESCE(farms.name || ' - ' || TO_CHAR(pc.end_date::date, 'Mon YY'), pc.id::text) AS cycle_label,
    gp.final_fcr AS fcr,
    pc.end_date::date AS end_date
  FROM production_cycles pc
  JOIN grower_performance gp ON gp.cycle_id = pc.id
  JOIN farms ON farms.id = pc.farm_id
  WHERE pc.org_id = p_org_id
    AND pc.status = 'closed'
    AND gp.final_fcr IS NOT NULL
  ORDER BY pc.end_date ASC
  LIMIT 20;
$$;

-- 2. fn_mortality_trend — Mortality % per closed cycle
CREATE OR REPLACE FUNCTION fn_mortality_trend(p_org_id UUID)
RETURNS TABLE (cycle_label TEXT, mortality_pct NUMERIC, end_date DATE)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    COALESCE(farms.name || ' - ' || TO_CHAR(pc.end_date::date, 'Mon YY'), pc.id::text),
    ROUND(gp.final_mortality_rate * 100, 2),
    pc.end_date::date
  FROM production_cycles pc
  JOIN grower_performance gp ON gp.cycle_id = pc.id
  JOIN farms ON farms.id = pc.farm_id
  WHERE pc.org_id = p_org_id
    AND pc.status = 'closed'
    AND gp.final_mortality_rate IS NOT NULL
  ORDER BY pc.end_date ASC
  LIMIT 20;
$$;

-- 3. fn_adg_trend — Average Daily Gain per cycle
CREATE OR REPLACE FUNCTION fn_adg_trend(p_org_id UUID)
RETURNS TABLE (cycle_label TEXT, adg_g NUMERIC, end_date DATE)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    COALESCE(farms.name || ' - ' || TO_CHAR(pc.end_date::date, 'Mon YY'), pc.id::text),
    ROUND(
      (gp.average_harvest_weight_kg * 1000) /
      GREATEST(1, EXTRACT(DAY FROM pc.end_date - pc.start_date)::integer),
      1
    ),
    pc.end_date::date
  FROM production_cycles pc
  JOIN grower_performance gp ON gp.cycle_id = pc.id
  JOIN farms ON farms.id = pc.farm_id
  WHERE pc.org_id = p_org_id
    AND pc.status = 'closed'
    AND gp.average_harvest_weight_kg IS NOT NULL
  ORDER BY pc.end_date ASC
  LIMIT 20;
$$;

-- 4. fn_cycle_duration_distribution
CREATE OR REPLACE FUNCTION fn_cycle_duration_distribution(p_org_id UUID)
RETURNS TABLE (bucket TEXT, count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    CASE
      WHEN days < 35 THEN 'Under 35d'
      WHEN days BETWEEN 35 AND 38 THEN '35-38d'
      WHEN days BETWEEN 39 AND 42 THEN '39-42d'
      ELSE 'Over 42d'
    END AS bucket,
    COUNT(*) AS count
  FROM (
    SELECT EXTRACT(DAY FROM end_date - start_date)::integer AS days
    FROM production_cycles
    WHERE org_id = p_org_id AND status = 'closed' AND end_date IS NOT NULL
  ) sub
  GROUP BY 1
  ORDER BY MIN(days);
$$;

-- 5. fn_revenue_vs_expenses_monthly — last 12 months
CREATE OR REPLACE FUNCTION fn_revenue_vs_expenses_monthly(p_org_id UUID)
RETURNS TABLE (month TEXT, revenue NUMERIC, expenses NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  WITH months AS (
    SELECT DATE_TRUNC('month', gs) AS m
    FROM generate_series(
      DATE_TRUNC('month', NOW()) - INTERVAL '11 months',
      DATE_TRUNC('month', NOW()),
      '1 month'
    ) gs
  ),
  rev AS (
    SELECT DATE_TRUNC('month', transaction_date) AS m, SUM(amount) AS total
    FROM financial_transactions
    WHERE org_id = p_org_id AND type = 'income'
      AND transaction_date >= NOW() - INTERVAL '12 months'
    GROUP BY 1
  ),
  exp AS (
    SELECT DATE_TRUNC('month', transaction_date) AS m, SUM(amount) AS total
    FROM financial_transactions
    WHERE org_id = p_org_id AND type = 'expense'
      AND transaction_date >= NOW() - INTERVAL '12 months'
    GROUP BY 1
  )
  SELECT
    TO_CHAR(months.m, 'Mon YY') AS month,
    COALESCE(rev.total, 0) AS revenue,
    COALESCE(exp.total, 0) AS expenses
  FROM months
  LEFT JOIN rev ON rev.m = months.m
  LEFT JOIN exp ON exp.m = months.m
  ORDER BY months.m;
$$;

-- 6. fn_net_profit_per_cycle
CREATE OR REPLACE FUNCTION fn_net_profit_per_cycle(p_org_id UUID)
RETURNS TABLE (cycle_label TEXT, revenue NUMERIC, expenses NUMERIC, net_profit NUMERIC, end_date DATE)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    COALESCE(farms.name || ' ' || TO_CHAR(pc.end_date::date, 'Mon YY'), pc.id::text),
    COALESCE(pc.total_revenue, 0),
    COALESCE(pc.total_expenses, 0),
    COALESCE(pc.total_revenue, 0) - COALESCE(pc.total_expenses, 0),
    pc.end_date::date
  FROM production_cycles pc
  JOIN farms ON farms.id = pc.farm_id
  WHERE pc.org_id = p_org_id
    AND pc.status = 'closed'
    AND pc.end_date IS NOT NULL
  ORDER BY pc.end_date ASC
  LIMIT 20;
$$;

-- 7. fn_cost_distribution
CREATE OR REPLACE FUNCTION fn_cost_distribution(p_org_id UUID, p_months INTEGER DEFAULT 12)
RETURNS TABLE (category TEXT, total_amount NUMERIC, pct NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  WITH totals AS (
    SELECT expense_category, SUM(amount) AS total
    FROM financial_transactions
    WHERE org_id = p_org_id
      AND type = 'expense'
      AND transaction_date >= NOW() - (p_months || ' months')::interval
    GROUP BY expense_category
  ),
  grand_total AS (SELECT SUM(total) AS gt FROM totals)
  SELECT
    COALESCE(expense_category, 'Other') AS category,
    ROUND(total, 2),
    ROUND(total / NULLIF(grand_total.gt, 0) * 100, 1)
  FROM totals, grand_total
  ORDER BY total DESC;
$$;

-- 8. fn_cost_per_kg_trend
CREATE OR REPLACE FUNCTION fn_cost_per_kg_trend(p_org_id UUID)
RETURNS TABLE (cycle_label TEXT, cost_per_kg NUMERIC, end_date DATE)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    COALESCE(farms.name || ' ' || TO_CHAR(pc.end_date::date, 'Mon YY'), pc.id::text),
    CASE
      WHEN gp.total_birds_harvested > 0 AND gp.average_harvest_weight_kg > 0
      THEN ROUND(
        COALESCE(pc.total_expenses, 0) /
        (gp.total_birds_harvested * gp.average_harvest_weight_kg),
        2
      )
      ELSE NULL
    END,
    pc.end_date::date
  FROM production_cycles pc
  JOIN grower_performance gp ON gp.cycle_id = pc.id
  JOIN farms ON farms.id = pc.farm_id
  WHERE pc.org_id = p_org_id
    AND pc.status = 'closed'
    AND pc.end_date IS NOT NULL
  ORDER BY pc.end_date ASC
  LIMIT 20;
$$;

-- 9. fn_seasonality_mortality — avg mortality per calendar month
CREATE OR REPLACE FUNCTION fn_seasonality_mortality(p_org_id UUID)
RETURNS TABLE (month_num INTEGER, month_name TEXT, avg_mortality_pct NUMERIC, cycle_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    EXTRACT(MONTH FROM pc.end_date)::integer,
    TO_CHAR(DATE_TRUNC('month', pc.end_date), 'Mon'),
    ROUND(AVG(gp.final_mortality_rate) * 100, 2),
    COUNT(*)
  FROM production_cycles pc
  JOIN grower_performance gp ON gp.cycle_id = pc.id
  WHERE pc.org_id = p_org_id
    AND pc.status = 'closed'
    AND gp.final_mortality_rate IS NOT NULL
  GROUP BY 1, 2
  ORDER BY 1;
$$;

-- 10. fn_input_performance — avg harvest weight by feed brand / breed
CREATE OR REPLACE FUNCTION fn_input_performance(p_org_id UUID)
RETURNS TABLE (input_type TEXT, input_value TEXT, avg_harvest_weight_kg NUMERIC, avg_fcr NUMERIC, cycle_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    'breed' AS input_type,
    pc.breed_strain AS input_value,
    ROUND(AVG(gp.average_harvest_weight_kg), 3),
    ROUND(AVG(gp.final_fcr), 3),
    COUNT(*)
  FROM production_cycles pc
  JOIN grower_performance gp ON gp.cycle_id = pc.id
  WHERE pc.org_id = p_org_id
    AND pc.status = 'closed'
    AND pc.breed_strain IS NOT NULL
    AND gp.average_harvest_weight_kg IS NOT NULL
  GROUP BY pc.breed_strain
  HAVING COUNT(*) >= 3
  ORDER BY avg_harvest_weight_kg DESC;
$$;
