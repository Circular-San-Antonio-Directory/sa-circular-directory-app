-- Migration 004: Add geocoding columns to businesses
-- The businesses_complete view uses SELECT b.* so it picks up these columns automatically.
-- No view recreation needed.

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS latitude    DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude   DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMPTZ;
