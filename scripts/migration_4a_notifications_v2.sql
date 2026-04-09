-- =============================================================
-- Phase 4A: Notification System v2
-- Apply via: Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. ALTER notifications — add v2 columns
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS event_type  TEXT,
  ADD COLUMN IF NOT EXISTS urgency     TEXT CHECK (urgency IN ('critical','warning','info')),
  ADD COLUMN IF NOT EXISTS link        TEXT,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS farm_id     UUID REFERENCES farms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cycle_id    UUID REFERENCES production_cycles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS read_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at  TIMESTAMPTZ;

-- Back-fill urgency from existing type field  
UPDATE notifications
SET urgency = CASE
  WHEN type IN ('mortality_alert','vaccination_overdue','sensor_alert_critical') THEN 'critical'
  WHEN type IN ('low_stock','daily_report_reminder','sensor_alert') THEN 'warning'
  ELSE 'info'
END
WHERE urgency IS NULL;

-- 2. CREATE push_subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint      TEXT NOT NULL UNIQUE,
  p256dh        TEXT NOT NULL,
  auth          TEXT NOT NULL,
  device_label  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions (user_id);

-- RLS: push_subscriptions — user reads/writes own
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_subs_own" ON push_subscriptions;
CREATE POLICY "push_subs_own" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- 3. RLS: notifications — user reads own; realtime enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_own_read" ON notifications;
CREATE POLICY "notifications_own_read" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_own_update" ON notifications;
CREATE POLICY "notifications_own_update" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- 4. DB trigger: on cash_advance_requests changes → create notification
CREATE OR REPLACE FUNCTION fn_notify_cash_advance()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_org_id    UUID;
  v_admin_id  UUID;
BEGIN
  SELECT org_id INTO v_org_id FROM profiles WHERE id = NEW.employee_id;

  IF TG_OP = 'INSERT' THEN
    -- Notify admin on new submission
    FOR v_admin_id IN
      SELECT id FROM profiles WHERE org_id = v_org_id AND role IN ('admin','owner')
    LOOP
      INSERT INTO notifications (org_id, user_id, type, event_type, urgency, title, message, link)
      VALUES (
        v_org_id, v_admin_id, 'cash_advance_request', 'cash_advance_submitted', 'info',
        'New Cash Advance Request',
        'A cash advance request has been submitted and requires your review.',
        '/finance?tab=cash-advances'
      );
    END LOOP;

  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Notify employee on approval/rejection
    INSERT INTO notifications (org_id, user_id, type, event_type, urgency, title, message, link)
    VALUES (
      v_org_id, NEW.employee_id, 'cash_advance_update', 'cash_advance_reviewed',
      CASE WHEN NEW.status = 'approved' THEN 'info' ELSE 'warning' END,
      CASE WHEN NEW.status = 'approved' THEN 'Cash Advance Approved' ELSE 'Cash Advance Rejected' END,
      CASE WHEN NEW.status = 'approved'
        THEN 'Your cash advance request has been approved.'
        ELSE COALESCE('Your cash advance request was rejected: ' || NEW.review_note, 'Your cash advance request was not approved.')
      END,
      '/finance?tab=cash-advances'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_cash_advance ON cash_advance_requests;
CREATE TRIGGER trg_notify_cash_advance
  AFTER INSERT OR UPDATE ON cash_advance_requests
  FOR EACH ROW EXECUTE FUNCTION fn_notify_cash_advance();

-- 5. DB trigger: on cycle create/close → notify
CREATE OR REPLACE FUNCTION fn_notify_cycle_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_farm_name TEXT;
BEGIN
  SELECT name INTO v_farm_name FROM farms WHERE id = NEW.farm_id;

  IF TG_OP = 'INSERT' THEN
    -- Notify org admins
    INSERT INTO notifications (org_id, user_id, type, event_type, urgency, title, message, link, farm_id, cycle_id)
    SELECT
      NEW.org_id, p.id, 'cycle_started', 'cycle_created', 'info',
      'New Cycle Started',
      COALESCE(v_farm_name, 'A farm') || ' started a new production cycle.',
      '/farms/' || NEW.farm_id,
      NEW.farm_id, NEW.id
    FROM profiles p
    WHERE p.org_id = NEW.org_id AND p.role IN ('admin','owner');

  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'closed' AND NEW.status = 'closed' THEN
    INSERT INTO notifications (org_id, user_id, type, event_type, urgency, title, message, link, farm_id, cycle_id)
    SELECT
      NEW.org_id, p.id, 'cycle_closed', 'cycle_completed', 'info',
      'Cycle Closed',
      COALESCE(v_farm_name, 'A farm') || ' has closed a production cycle.',
      '/production-cycles/' || NEW.id,
      NEW.farm_id, NEW.id
    FROM profiles p
    WHERE p.org_id = NEW.org_id AND p.role IN ('admin','owner');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_cycle ON production_cycles;
CREATE TRIGGER trg_notify_cycle
  AFTER INSERT OR UPDATE ON production_cycles
  FOR EACH ROW EXECUTE FUNCTION fn_notify_cycle_event();

-- 6. Weekly TTL purge: delete expired notifications
-- Requires pg_cron extension:
-- SELECT cron.schedule('purge-expired-notifications', '0 2 * * 0', $$
--   DELETE FROM notifications WHERE expires_at < NOW();
-- $$);
