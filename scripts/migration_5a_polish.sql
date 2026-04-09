-- migration_5a_polish.sql
-- Sprint 3 polish: DB trigger to notify org admins when a user is deactivated.
--
-- Trigger fires AFTER UPDATE on profiles when status changes from a non-inactive
-- value to 'inactive'. Inserts a notification row for each admin/owner in the org.
--
-- Deploy: Run this SQL in the Supabase SQL editor or via supabase db push.

-- ─────────────────────────────────────────────────────────────────
-- Trigger function
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_user_deactivated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin RECORD;
  v_expires_at TIMESTAMPTZ := NOW() + INTERVAL '7 days';
  v_full_name TEXT;
BEGIN
  -- Only fire when status transitions TO 'inactive'
  IF OLD.status IS NOT DISTINCT FROM 'inactive' THEN
    RETURN NEW;
  END IF;
  IF NEW.status <> 'inactive' THEN
    RETURN NEW;
  END IF;
  -- Skip if no org
  IF NEW.org_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_full_name := TRIM(NEW.first_name || ' ' || NEW.last_name);

  -- Notify all admins/owners in the same org
  FOR v_admin IN
    SELECT id FROM profiles
    WHERE org_id = NEW.org_id
      AND role IN ('admin', 'owner')
      AND id <> NEW.id
      AND deleted_at IS NULL
      AND status = 'active'
  LOOP
    INSERT INTO notifications (
      recipient_id,
      org_id,
      type,
      event_type,
      urgency,
      title,
      message,
      link,
      expires_at
    ) VALUES (
      v_admin.id,
      NEW.org_id,
      'user_deactivated',
      'user_deactivated',
      'info',
      'User Deactivated',
      v_full_name || ' (' || NEW.email || ') has been deactivated.',
      '/settings?tab=personnel',
      v_expires_at
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- Attach trigger to profiles table
-- ─────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_notify_user_deactivated ON profiles;

CREATE TRIGGER trg_notify_user_deactivated
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_deactivated();
