-- ============================================================================
-- FlockMate v2 — Phase 2B: Finance v2 — Payroll & Cash Advances
-- Apply via: Supabase Dashboard > SQL Editor
-- ============================================================================

-- ============================================================================
-- SECTION 1: employee_payroll_profiles (2b-db-1)
-- ============================================================================

CREATE TABLE IF NOT EXISTS employee_payroll_profiles (
  id                     uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id                 uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  monthly_basic_salary   numeric(12,2) NOT NULL DEFAULT 0,
  pay_schedule           text        NOT NULL DEFAULT 'semi_monthly'
                           CHECK (pay_schedule IN ('semi_monthly', 'monthly')),
  sss_bracket_id         text,
  philhealth_bracket_id  text,
  pagibig_rate           text        DEFAULT '1_pct'
                           CHECK (pagibig_rate IN ('1_pct', '2_pct')),
  rice_allowance         numeric(12,2) DEFAULT 0,
  transport_allowance    numeric(12,2) DEFAULT 0,
  other_allowances       numeric(12,2) DEFAULT 0,
  other_deductions       numeric(12,2) DEFAULT 0,
  effective_date         date        NOT NULL DEFAULT CURRENT_DATE,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now(),
  UNIQUE (user_id, org_id)
);

ALTER TABLE employee_payroll_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_payroll_profiles" ON employee_payroll_profiles
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ============================================================================
-- SECTION 2: payroll_records (v2 schema) (2b-db-2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payroll_records (
  id                      uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                 uuid        NOT NULL REFERENCES profiles(id),
  org_id                  uuid        NOT NULL REFERENCES organizations(id),
  pay_period_start        date        NOT NULL,
  pay_period_end          date        NOT NULL,
  gross_pay               numeric(12,2) NOT NULL DEFAULT 0,
  sss_employee            numeric(12,2) DEFAULT 0,
  sss_employer            numeric(12,2) DEFAULT 0,
  philhealth_employee     numeric(12,2) DEFAULT 0,
  philhealth_employer     numeric(12,2) DEFAULT 0,
  pagibig_employee        numeric(12,2) DEFAULT 0,
  pagibig_employer        numeric(12,2) DEFAULT 0,
  cash_advance_deduction  numeric(12,2) DEFAULT 0,
  other_deductions        numeric(12,2) DEFAULT 0,
  net_pay                 numeric(12,2) NOT NULL DEFAULT 0,
  status                  text        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'released')),
  released_by             uuid        REFERENCES profiles(id),
  released_at             timestamptz,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_payroll_records" ON payroll_records
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "employee_read_own_payroll" ON payroll_records
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- SECTION 3: Statutory contribution reference tables (2b-db-3)
-- ============================================================================

-- SSS
CREATE TABLE IF NOT EXISTS sss_contribution_table (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  salary_bracket_min  numeric(12,2) NOT NULL,
  salary_bracket_max  numeric(12,2),
  employee_share      numeric(12,2) NOT NULL,
  employer_share      numeric(12,2) NOT NULL,
  effective_date      date        NOT NULL,
  is_current          boolean     DEFAULT true,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE sss_contribution_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_sss" ON sss_contribution_table
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_write_sss" ON sss_contribution_table
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- PhilHealth
CREATE TABLE IF NOT EXISTS philhealth_contribution_table (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  premium_rate_pct  numeric(5,4)  NOT NULL,
  income_floor      numeric(12,2) NOT NULL,
  income_ceiling    numeric(12,2) NOT NULL,
  effective_date    date          NOT NULL,
  is_current        boolean       DEFAULT true,
  created_at        timestamptz   DEFAULT now()
);

ALTER TABLE philhealth_contribution_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_philhealth" ON philhealth_contribution_table
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_write_philhealth" ON philhealth_contribution_table
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Pag-IBIG
CREATE TABLE IF NOT EXISTS pagibig_contribution_table (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  salary_threshold    numeric(12,2) NOT NULL,
  rate_below_pct      numeric(5,4)  NOT NULL,
  rate_above_pct      numeric(5,4)  NOT NULL,
  max_employee_share  numeric(12,2) NOT NULL,
  max_employer_share  numeric(12,2) NOT NULL,
  effective_date      date          NOT NULL,
  is_current          boolean       DEFAULT true,
  created_at          timestamptz   DEFAULT now()
);

ALTER TABLE pagibig_contribution_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_pagibig" ON pagibig_contribution_table
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_write_pagibig" ON pagibig_contribution_table
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ============================================================================
-- SECTION 4: ALTER cash_advance_requests (2b-db-4)
-- ============================================================================

ALTER TABLE cash_advance_requests
  ADD COLUMN IF NOT EXISTS review_note           text,
  ADD COLUMN IF NOT EXISTS reviewed_at           timestamptz,
  ADD COLUMN IF NOT EXISTS deducted_in_payroll_id uuid
    REFERENCES payroll_records(id) ON DELETE SET NULL;

-- ============================================================================
-- SECTION 5: weight_samples (2b-db-5)
-- ============================================================================

CREATE TABLE IF NOT EXISTS weight_samples (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id       uuid        NOT NULL REFERENCES production_cycles(id) ON DELETE CASCADE,
  org_id         uuid        NOT NULL REFERENCES organizations(id),
  farm_id        uuid        NOT NULL REFERENCES farms(id),
  sample_date    date        NOT NULL,
  sample_weight_g numeric(10,2) NOT NULL,
  bird_count     integer     NOT NULL DEFAULT 10,
  recorded_by    uuid        NOT NULL REFERENCES profiles(id),
  notes          text,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE weight_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_member_read_weight_samples" ON weight_samples
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_all_weight_samples" ON weight_samples
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "tech_grower_insert_weight_samples" ON weight_samples
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    AND recorded_by = auth.uid()
  );

-- ============================================================================
-- SECTION 6: Seed statutory contribution tables — 2025/2026 rates (2b-db-6)
-- ============================================================================

-- SSS 2025: 4.5% employee, 8.5% employer
-- Brackets: ₱0 – ₱35,000 MSC in ₱500 increments (effective Jan 1, 2025)
-- salary_bracket_min/max = compensation range that maps to that MSC level

INSERT INTO sss_contribution_table
  (salary_bracket_min, salary_bracket_max, employee_share, employer_share, effective_date, is_current)
VALUES
  (0,       5249.99,  225.00,   425.00,  '2025-01-01', true),
  (5250,    5749.99,  247.50,   467.50,  '2025-01-01', true),
  (5750,    6249.99,  270.00,   510.00,  '2025-01-01', true),
  (6250,    6749.99,  292.50,   552.50,  '2025-01-01', true),
  (6750,    7249.99,  315.00,   595.00,  '2025-01-01', true),
  (7250,    7749.99,  337.50,   637.50,  '2025-01-01', true),
  (7750,    8249.99,  360.00,   680.00,  '2025-01-01', true),
  (8250,    8749.99,  382.50,   722.50,  '2025-01-01', true),
  (8750,    9249.99,  405.00,   765.00,  '2025-01-01', true),
  (9250,    9749.99,  427.50,   807.50,  '2025-01-01', true),
  (9750,   10249.99,  450.00,   850.00,  '2025-01-01', true),
  (10250,  10749.99,  472.50,   892.50,  '2025-01-01', true),
  (10750,  11249.99,  495.00,   935.00,  '2025-01-01', true),
  (11250,  11749.99,  517.50,   977.50,  '2025-01-01', true),
  (11750,  12249.99,  540.00,  1020.00,  '2025-01-01', true),
  (12250,  12749.99,  562.50,  1062.50,  '2025-01-01', true),
  (12750,  13249.99,  585.00,  1105.00,  '2025-01-01', true),
  (13250,  13749.99,  607.50,  1147.50,  '2025-01-01', true),
  (13750,  14249.99,  630.00,  1190.00,  '2025-01-01', true),
  (14250,  14749.99,  652.50,  1232.50,  '2025-01-01', true),
  (14750,  15249.99,  675.00,  1275.00,  '2025-01-01', true),
  (15250,  15749.99,  697.50,  1317.50,  '2025-01-01', true),
  (15750,  16249.99,  720.00,  1360.00,  '2025-01-01', true),
  (16250,  16749.99,  742.50,  1402.50,  '2025-01-01', true),
  (16750,  17249.99,  765.00,  1445.00,  '2025-01-01', true),
  (17250,  17749.99,  787.50,  1487.50,  '2025-01-01', true),
  (17750,  18249.99,  810.00,  1530.00,  '2025-01-01', true),
  (18250,  18749.99,  832.50,  1572.50,  '2025-01-01', true),
  (18750,  19249.99,  855.00,  1615.00,  '2025-01-01', true),
  (19250,  19749.99,  877.50,  1657.50,  '2025-01-01', true),
  (19750,  20249.99,  900.00,  1700.00,  '2025-01-01', true),
  (20250,  20749.99,  922.50,  1742.50,  '2025-01-01', true),
  (20750,  21249.99,  945.00,  1785.00,  '2025-01-01', true),
  (21250,  21749.99,  967.50,  1827.50,  '2025-01-01', true),
  (21750,  22249.99,  990.00,  1870.00,  '2025-01-01', true),
  (22250,  22749.99, 1012.50,  1912.50,  '2025-01-01', true),
  (22750,  23249.99, 1035.00,  1955.00,  '2025-01-01', true),
  (23250,  23749.99, 1057.50,  1997.50,  '2025-01-01', true),
  (23750,  24249.99, 1080.00,  2040.00,  '2025-01-01', true),
  (24250,  24749.99, 1102.50,  2082.50,  '2025-01-01', true),
  (24750,  25249.99, 1125.00,  2125.00,  '2025-01-01', true),
  (25250,  25749.99, 1147.50,  2167.50,  '2025-01-01', true),
  (25750,  26249.99, 1170.00,  2210.00,  '2025-01-01', true),
  (26250,  26749.99, 1192.50,  2252.50,  '2025-01-01', true),
  (26750,  27249.99, 1215.00,  2295.00,  '2025-01-01', true),
  (27250,  27749.99, 1237.50,  2337.50,  '2025-01-01', true),
  (27750,  28249.99, 1260.00,  2380.00,  '2025-01-01', true),
  (28250,  28749.99, 1282.50,  2422.50,  '2025-01-01', true),
  (28750,  29249.99, 1305.00,  2465.00,  '2025-01-01', true),
  (29250,  29749.99, 1327.50,  2507.50,  '2025-01-01', true),
  (29750,  30249.99, 1350.00,  2550.00,  '2025-01-01', true),
  (30250,  30749.99, 1372.50,  2592.50,  '2025-01-01', true),
  (30750,  31249.99, 1395.00,  2635.00,  '2025-01-01', true),
  (31250,  31749.99, 1417.50,  2677.50,  '2025-01-01', true),
  (31750,  32249.99, 1440.00,  2720.00,  '2025-01-01', true),
  (32250,  32749.99, 1462.50,  2762.50,  '2025-01-01', true),
  (32750,  33249.99, 1485.00,  2805.00,  '2025-01-01', true),
  (33250,  33749.99, 1507.50,  2847.50,  '2025-01-01', true),
  (33750,  34249.99, 1530.00,  2890.00,  '2025-01-01', true),
  (34250,  34749.99, 1552.50,  2932.50,  '2025-01-01', true),
  (34750,       NULL, 1575.00,  2975.00,  '2025-01-01', true)
ON CONFLICT DO NOTHING;

-- PhilHealth 2025: 5% total (2.5% EE + 2.5% ER), floor ₱10,000, ceiling ₱100,000
-- premium_rate_pct = 0.025 = employee's share (2.5%)
INSERT INTO philhealth_contribution_table
  (premium_rate_pct, income_floor, income_ceiling, effective_date, is_current)
VALUES
  (0.025, 10000.00, 100000.00, '2025-01-01', true)
ON CONFLICT DO NOTHING;

-- Pag-IBIG 2025: ≤ ₱1,500 salary → 1% EE + 2% ER; > ₱1,500 → 2% EE + 2% ER
-- max EE ₱100, max ER ₱100 (mandatory ceiling)
INSERT INTO pagibig_contribution_table
  (salary_threshold, rate_below_pct, rate_above_pct, max_employee_share, max_employer_share, effective_date, is_current)
VALUES
  (1500.00, 0.01, 0.02, 100.00, 100.00, '2025-01-01', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 7: DB function run_payroll (2b-db-7)
-- ============================================================================

CREATE OR REPLACE FUNCTION run_payroll(
  p_org_id         uuid,
  p_pay_period_start date,
  p_pay_period_end   date
)
RETURNS SETOF payroll_records
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile       RECORD;
  v_gross_pay     numeric;
  v_divisor       integer;
  v_sss_ee        numeric := 0;
  v_sss_er        numeric := 0;
  v_phi_ee        numeric := 0;
  v_phi_er        numeric := 0;
  v_pag_ee        numeric := 0;
  v_pag_er        numeric := 0;
  v_ca_total      numeric := 0;
  v_other_ded     numeric := 0;
  v_net_pay       numeric;
  v_record        payroll_records;
BEGIN
  FOR v_profile IN
    SELECT
      ep.*,
      (ep.monthly_basic_salary
        + COALESCE(ep.rice_allowance, 0)
        + COALESCE(ep.transport_allowance, 0)
        + COALESCE(ep.other_allowances, 0)
      ) AS total_monthly_gross
    FROM employee_payroll_profiles ep
    WHERE ep.org_id = p_org_id
      AND ep.effective_date <= p_pay_period_end
  LOOP
    v_divisor := CASE WHEN v_profile.pay_schedule = 'semi_monthly' THEN 2 ELSE 1 END;
    v_gross_pay := v_profile.total_monthly_gross / v_divisor;

    -- SSS: monthly amount looked up, halved for semi-monthly
    SELECT
      COALESCE(employee_share, 0) / v_divisor,
      COALESCE(employer_share, 0) / v_divisor
    INTO v_sss_ee, v_sss_er
    FROM sss_contribution_table
    WHERE is_current = true
      AND salary_bracket_min <= v_profile.monthly_basic_salary
      AND (salary_bracket_max IS NULL OR salary_bracket_max >= v_profile.monthly_basic_salary)
    ORDER BY salary_bracket_min DESC
    LIMIT 1;

    -- PhilHealth: monthly = rate × clamp(salary, floor, ceiling); halve for semi-monthly
    SELECT
      COALESCE(
        premium_rate_pct
        * LEAST(GREATEST(v_profile.monthly_basic_salary, income_floor), income_ceiling)
        / v_divisor,
        0
      )
    INTO v_phi_ee
    FROM philhealth_contribution_table
    WHERE is_current = true
    ORDER BY effective_date DESC
    LIMIT 1;
    v_phi_er := v_phi_ee;

    -- Pag-IBIG: monthly contribution capped at max_employee_share; halve for semi-monthly
    SELECT
      CASE
        WHEN v_profile.monthly_basic_salary <= salary_threshold
          THEN LEAST(v_profile.monthly_basic_salary * rate_below_pct, max_employee_share) / v_divisor
        ELSE
          LEAST(v_profile.monthly_basic_salary * rate_above_pct, max_employee_share) / v_divisor
      END,
      LEAST(v_profile.monthly_basic_salary * 0.02, max_employer_share) / v_divisor
    INTO v_pag_ee, v_pag_er
    FROM pagibig_contribution_table
    WHERE is_current = true
    ORDER BY effective_date DESC
    LIMIT 1;

    -- Sum approved cash advances not yet deducted
    SELECT COALESCE(SUM(amount), 0)
    INTO v_ca_total
    FROM cash_advance_requests
    WHERE employee_id = v_profile.user_id
      AND org_id = p_org_id
      AND status = 'approved'
      AND deducted_in_payroll_id IS NULL;

    v_other_ded := COALESCE(v_profile.other_deductions, 0) / v_divisor;

    v_net_pay := v_gross_pay
      - COALESCE(v_sss_ee, 0)
      - COALESCE(v_phi_ee, 0)
      - COALESCE(v_pag_ee, 0)
      - v_ca_total
      - v_other_ded;

    INSERT INTO payroll_records (
      user_id, org_id,
      pay_period_start, pay_period_end,
      gross_pay,
      sss_employee, sss_employer,
      philhealth_employee, philhealth_employer,
      pagibig_employee, pagibig_employer,
      cash_advance_deduction, other_deductions,
      net_pay, status
    ) VALUES (
      v_profile.user_id, p_org_id,
      p_pay_period_start, p_pay_period_end,
      v_gross_pay,
      COALESCE(v_sss_ee, 0), COALESCE(v_sss_er, 0),
      COALESCE(v_phi_ee, 0), COALESCE(v_phi_er, 0),
      COALESCE(v_pag_ee, 0), COALESCE(v_pag_er, 0),
      v_ca_total, v_other_ded,
      v_net_pay, 'draft'
    )
    RETURNING * INTO v_record;

    RETURN NEXT v_record;
  END LOOP;
END;
$$;

-- ============================================================================
-- SECTION 8: DB function release_payroll (2b-db-8)
-- ============================================================================

CREATE OR REPLACE FUNCTION release_payroll(
  p_payroll_record_id uuid,
  p_admin_id          uuid
)
RETURNS payroll_records
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record payroll_records;
BEGIN
  UPDATE payroll_records
  SET
    status      = 'released',
    released_by = p_admin_id,
    released_at = now(),
    updated_at  = now()
  WHERE id = p_payroll_record_id
    AND status = 'draft'
  RETURNING * INTO v_record;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payroll record % not found or already released.', p_payroll_record_id;
  END IF;

  -- 2b-db-9: auto-mark approved cash advances as deducted
  UPDATE cash_advance_requests
  SET
    status                 = 'deducted',
    deducted_in_payroll_id = p_payroll_record_id
  WHERE employee_id = v_record.user_id
    AND org_id      = v_record.org_id
    AND status      = 'approved'
    AND deducted_in_payroll_id IS NULL;

  RETURN v_record;
END;
$$;

-- ============================================================================
-- NOTES FOR ADMINISTRATOR
-- ============================================================================
-- 1. After applying this migration, verify RLS policies by testing as different roles.
-- 2. The `run_payroll` function generates DRAFT records — always review before releasing.
-- 3. Statutory rates are seeded for 2025; update the reference tables when rates change.
-- 4. Old payroll_payouts and payroll_deductions_breakdown tables are retained for history.
-- 5. weight_samples is used by the Grower mobile experience (Phase 5).
