-- Migration 004: Add geocoding columns to businesses
-- NOTE: PostgreSQL expands SELECT b.* at view creation time, so the view does NOT
-- automatically pick up new columns. Run migration 005 to recreate the view.

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS latitude    DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude   DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMPTZ;
