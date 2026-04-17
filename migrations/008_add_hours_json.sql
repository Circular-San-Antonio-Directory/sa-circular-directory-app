-- Migration 008: Add structured hours JSON column
-- Parsed from the Business Hours text field during sync.
-- Drives the dynamic open/closed status display on listing pages.
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS hours_json JSONB;
