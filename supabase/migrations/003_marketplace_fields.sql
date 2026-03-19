-- 003_marketplace_fields.sql
-- Adds marketplace-specific columns to videos, products, users tables
-- and auto-store creation trigger

-- ────────────────────────────────────────────────────────────────────
-- videos: listing metadata
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS listing_type TEXT
    CHECK (listing_type IN ('product', 'service')) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS price        INT     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS currency     TEXT    DEFAULT 'JOD',
  ADD COLUMN IF NOT EXISTS condition    TEXT
    CHECK (condition IN ('new', 'used', 'refurbished')) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS location     TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS title        TEXT    DEFAULT NULL;

-- ────────────────────────────────────────────────────────────────────
-- products: listing metadata
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS listing_type TEXT
    CHECK (listing_type IN ('product', 'service')) DEFAULT 'product',
  ADD COLUMN IF NOT EXISTS condition    TEXT
    CHECK (condition IN ('new', 'used', 'refurbished')) DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS currency     TEXT    DEFAULT 'JOD',
  ADD COLUMN IF NOT EXISTS location     TEXT    DEFAULT NULL;

-- ────────────────────────────────────────────────────────────────────
-- users: business / seller type
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_business  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS seller_type  TEXT
    CHECK (seller_type IN ('individual', 'business')) DEFAULT 'individual';

-- ────────────────────────────────────────────────────────────────────
-- Auto-create store for new users on first upload (trigger)
-- ────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION auto_create_store()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO stores (user_id, name)
  VALUES (NEW.id, NEW.display_name || '''s Shop')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only attach trigger if it doesn't exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_auto_create_store'
  ) THEN
    CREATE TRIGGER trg_auto_create_store
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION auto_create_store();
  END IF;
END;
$$;

-- ────────────────────────────────────────────────────────────────────
-- Indexes for feed filtering
-- ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_videos_listing_type ON videos(listing_type);
CREATE INDEX IF NOT EXISTS idx_videos_price        ON videos(price);
