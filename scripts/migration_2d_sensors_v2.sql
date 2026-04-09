-- =============================================================
-- Phase 2D: IoT Sensors v2 — HTTP Push Model
-- Apply via: Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. ALTER sensor_nodes — add is_active
ALTER TABLE sensor_nodes
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. ALTER farms — add sensors_enabled
ALTER TABLE farms
  ADD COLUMN IF NOT EXISTS sensors_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. CREATE sensor_readings_hourly — aggregated table for archival
CREATE TABLE IF NOT EXISTS sensor_readings_hourly (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_node_id    UUID NOT NULL REFERENCES sensor_nodes(id) ON DELETE CASCADE,
  farm_id           UUID NOT NULL,
  org_id            UUID NOT NULL,
  metric_type       TEXT NOT NULL,
  hour_start        TIMESTAMPTZ NOT NULL,
  avg_value         NUMERIC NOT NULL,
  min_value         NUMERIC NOT NULL,
  max_value         NUMERIC NOT NULL,
  reading_count     INTEGER NOT NULL DEFAULT 0,
  unit              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sensor_node_id, metric_type, hour_start)
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_hourly_farm ON sensor_readings_hourly (org_id, farm_id, hour_start);

-- 4. DB function: mark offline sensors (call via pg_cron or trigger)
CREATE OR REPLACE FUNCTION fn_mark_offline_sensors()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE sensor_nodes
  SET status = 'offline'
  WHERE is_active = TRUE
    AND status != 'offline'
    AND last_seen_at IS NOT NULL
    AND last_seen_at < NOW() - INTERVAL '15 minutes';
END;
$$;

-- 5. pg_cron: run offline check every 5 minutes
-- Requires pg_cron extension. Run separately if extension is enabled:
-- SELECT cron.schedule('mark-offline-sensors', '*/5 * * * *', 'SELECT fn_mark_offline_sensors()');

-- 6. RLS: sensor_readings — insert via service_role (Edge Function); read by role
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sensor_readings_select_role" ON sensor_readings;
CREATE POLICY "sensor_readings_select_role" ON sensor_readings
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    AND (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner', 'technician'))
      OR farm_id IN (
        SELECT farm_id FROM farm_assignments WHERE user_id = auth.uid()
      )
    )
  );

-- 7. RLS: sensor_readings_hourly — same access pattern
ALTER TABLE sensor_readings_hourly ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sensor_readings_hourly_select_role" ON sensor_readings_hourly;
CREATE POLICY "sensor_readings_hourly_select_role" ON sensor_readings_hourly
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

-- 8. RLS: sensor_nodes — Admin+Tech CRUD; all read
ALTER TABLE sensor_nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sensor_nodes_select_org" ON sensor_nodes;
CREATE POLICY "sensor_nodes_select_org" ON sensor_nodes
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "sensor_nodes_write_admin_tech" ON sensor_nodes;
CREATE POLICY "sensor_nodes_write_admin_tech" ON sensor_nodes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND org_id = sensor_nodes.org_id
        AND role IN ('admin', 'owner', 'technician')
    )
  );
