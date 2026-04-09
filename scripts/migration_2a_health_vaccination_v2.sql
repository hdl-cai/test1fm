-- =============================================================
-- Phase 2A: Health & Vaccination Management — v2 Schema Changes
-- Apply via: Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. Extend vaccination_schedules with v2 columns
ALTER TABLE vaccination_schedules
  ADD COLUMN IF NOT EXISTS vaccine_brand_batch TEXT,
  ADD COLUMN IF NOT EXISTS reschedule_note TEXT;

-- 2. Extend health_records with v2 columns
ALTER TABLE health_records
  ADD COLUMN IF NOT EXISTS medication_name TEXT,
  ADD COLUMN IF NOT EXISTS dosage TEXT,
  ADD COLUMN IF NOT EXISTS birds_affected INTEGER,
  ADD COLUMN IF NOT EXISTS outcome TEXT CHECK (outcome IN ('resolved', 'ongoing', 'escalated'));

-- 3. RLS: vaccination_schedules
ALTER TABLE vaccination_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_members_read_vaccination_schedules" ON vaccination_schedules;
DROP POLICY IF EXISTS "admin_tech_write_vaccination_schedules" ON vaccination_schedules;
DROP POLICY IF EXISTS "admin_tech_update_vaccination_schedules" ON vaccination_schedules;

CREATE POLICY "org_members_read_vaccination_schedules" ON vaccination_schedules
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_tech_write_vaccination_schedules" ON vaccination_schedules
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid() AND role IN ('owner','admin','technician','vet')
    )
  );

CREATE POLICY "admin_tech_update_vaccination_schedules" ON vaccination_schedules
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid() AND role IN ('owner','admin','technician','vet')
    )
  );

-- 4. RLS: health_records
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_members_read_health_records" ON health_records;
DROP POLICY IF EXISTS "admin_tech_write_health_records" ON health_records;
DROP POLICY IF EXISTS "admin_tech_update_health_records" ON health_records;

CREATE POLICY "org_members_read_health_records" ON health_records
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_tech_write_health_records" ON health_records
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid() AND role IN ('owner','admin','technician','vet')
    )
  );

CREATE POLICY "admin_tech_update_health_records" ON health_records
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid() AND role IN ('owner','admin','technician','vet')
    )
  );

-- 5. DB function: auto-generate vaccination_schedules when a cycle is created
CREATE OR REPLACE FUNCTION auto_generate_vaccination_schedules()
RETURNS TRIGGER AS $$
DECLARE
  template_id_to_use UUID;
  template_item RECORD;
  scheduled_date DATE;
BEGIN
  -- Prefer org-specific active template; fall back to system default
  SELECT id INTO template_id_to_use
  FROM vaccination_schedule_templates
  WHERE (org_id = NEW.org_id OR is_system_default = true)
    AND is_active = true
  ORDER BY org_id NULLS LAST
  LIMIT 1;

  IF template_id_to_use IS NULL THEN
    RETURN NEW;
  END IF;

  FOR template_item IN
    SELECT *
    FROM vaccination_template_items
    WHERE template_id = template_id_to_use
    ORDER BY sequence_order ASC
  LOOP
    scheduled_date := NEW.start_date::DATE + template_item.target_age_days;

    INSERT INTO vaccination_schedules (
      cycle_id, org_id, vaccine_name, admin_method,
      target_age_days, scheduled_date, status, template_item_id
    ) VALUES (
      NEW.id, NEW.org_id,
      template_item.vaccine_name, template_item.admin_method,
      template_item.target_age_days, scheduled_date, 'scheduled', template_item.id
    )
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_vaccination_schedules ON production_cycles;
CREATE TRIGGER trg_auto_vaccination_schedules
  AFTER INSERT ON production_cycles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_vaccination_schedules();

-- 6. DB function: mark vaccinations as overdue (call via pg_cron daily)
-- To schedule: SELECT cron.schedule('mark-overdue-vaccinations', '0 0 * * *', 'SELECT mark_vaccinations_overdue()');
CREATE OR REPLACE FUNCTION mark_vaccinations_overdue()
RETURNS void AS $$
BEGIN
  UPDATE vaccination_schedules
  SET status = 'overdue'
  WHERE status = 'scheduled'
    AND scheduled_date < CURRENT_DATE
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
