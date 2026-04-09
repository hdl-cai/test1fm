-- =============================================================
-- Phase 2C: Inventory v2 — Stock Levels, Suppliers, Purchase Orders
-- Apply via: Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. ALTER suppliers — add supply_categories, is_archived, notes
ALTER TABLE suppliers
  ADD COLUMN IF NOT EXISTS supply_categories TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. ALTER inventory_orders — add order_date
ALTER TABLE inventory_orders
  ADD COLUMN IF NOT EXISTS order_date DATE;

-- Back-fill order_date from created_at for existing rows
UPDATE inventory_orders
  SET order_date = created_at::date
  WHERE order_date IS NULL;

-- 3. DB trigger: auto-increment inventory_stock when delivered_inputs row inserted
CREATE OR REPLACE FUNCTION fn_sync_stock_on_delivery()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_item_id   UUID;
  v_qty       NUMERIC;
  v_org_id    UUID;
  v_farm_id   UUID;
BEGIN
  -- Map delivered_inputs fields to inventory
  v_item_id  := NEW.inventory_item_id;  -- may be NULL if not linked
  v_qty      := COALESCE(NEW.quantity_delivered, 0);
  v_org_id   := NEW.org_id;
  v_farm_id  := NEW.farm_id;

  IF v_item_id IS NULL OR v_qty <= 0 THEN
    RETURN NEW;
  END IF;

  -- Upsert inventory_stock row
  INSERT INTO inventory_stock (org_id, farm_id, item_id, current_qty, last_updated)
  VALUES (v_org_id, v_farm_id, v_item_id, v_qty, NOW())
  ON CONFLICT (org_id, farm_id, item_id)
  DO UPDATE SET
    current_qty  = inventory_stock.current_qty + EXCLUDED.current_qty,
    last_updated = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_stock_on_delivery ON delivered_inputs;
CREATE TRIGGER trg_sync_stock_on_delivery
  AFTER INSERT ON delivered_inputs
  FOR EACH ROW EXECUTE FUNCTION fn_sync_stock_on_delivery();

-- 4. DB function: projected feed days remaining
-- Returns: days remaining = total_feed_stock_kg / avg_daily_consumption_kg
-- avg_daily_consumption is from daily_logs for the given farm over last 7 days
CREATE OR REPLACE FUNCTION projected_feed_days(p_org_id UUID, p_farm_id UUID)
RETURNS NUMERIC LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_total_feed_kg     NUMERIC := 0;
  v_avg_daily_feed_kg NUMERIC := 0;
BEGIN
  -- Total feed stock in kg for this org+farm
  SELECT COALESCE(SUM(s.current_qty), 0) INTO v_total_feed_kg
  FROM inventory_stock s
  JOIN inventory_items i ON i.id = s.item_id
  JOIN inventory_categories c ON c.id = i.category_id
  WHERE s.org_id = p_org_id
    AND s.farm_id = p_farm_id
    AND LOWER(c.name) = 'feed';

  -- Average daily feed consumption from last 7 daily_logs
  -- daily_logs does not have farm_id; scope farm via production_cycles
  SELECT COALESCE(AVG(dl.feed_used_kg), 0) INTO v_avg_daily_feed_kg
  FROM daily_logs dl
  JOIN production_cycles pc ON pc.id = dl.cycle_id
  WHERE dl.org_id = p_org_id
    AND pc.farm_id = p_farm_id
    AND dl.log_date >= CURRENT_DATE - INTERVAL '7 days';

  IF v_avg_daily_feed_kg <= 0 THEN
    RETURN NULL; -- Cannot compute without consumption data
  END IF;

  RETURN ROUND(v_total_feed_kg / v_avg_daily_feed_kg, 1);
END;
$$;

-- 5. RLS: Suppliers — Admin-only CRUD
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "suppliers_select_org" ON suppliers;
CREATE POLICY "suppliers_select_org" ON suppliers
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "suppliers_insert_admin" ON suppliers;
CREATE POLICY "suppliers_insert_admin" ON suppliers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND org_id = suppliers.org_id
        AND role IN ('admin', 'owner')
    )
  );

DROP POLICY IF EXISTS "suppliers_update_admin" ON suppliers;
CREATE POLICY "suppliers_update_admin" ON suppliers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND org_id = suppliers.org_id
        AND role IN ('admin', 'owner')
    )
  );

DROP POLICY IF EXISTS "suppliers_delete_admin" ON suppliers;
CREATE POLICY "suppliers_delete_admin" ON suppliers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND org_id = suppliers.org_id
        AND role IN ('admin', 'owner')
    )
  );

-- 6. RLS: Purchase Orders — Admin + Technician create; Admin-only status change
ALTER TABLE inventory_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventory_orders_select_org" ON inventory_orders;
CREATE POLICY "inventory_orders_select_org" ON inventory_orders
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "inventory_orders_insert_admin_tech" ON inventory_orders;
CREATE POLICY "inventory_orders_insert_admin_tech" ON inventory_orders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND org_id = inventory_orders.org_id
        AND role IN ('admin', 'owner', 'technician')
    )
  );

DROP POLICY IF EXISTS "inventory_orders_update_admin" ON inventory_orders;
CREATE POLICY "inventory_orders_update_admin" ON inventory_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND org_id = inventory_orders.org_id
        AND role IN ('admin', 'owner')
    )
  );
