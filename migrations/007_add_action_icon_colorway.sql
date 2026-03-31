-- Migration 007: Add icon_file and colorway to business_actions
-- These fields are now synced from the "Icon to Use" and "Colorway" columns
-- in the Airtable Business Actions table, replacing the hardcoded ICON_MAP
-- in ActionIcon.tsx.

ALTER TABLE business_actions ADD COLUMN IF NOT EXISTS icon_file VARCHAR(50);
ALTER TABLE business_actions ADD COLUMN IF NOT EXISTS colorway VARCHAR(50);

COMMENT ON COLUMN business_actions.icon_file IS 'SVG icon key (e.g. "Icon-3") — synced from Airtable "Icon to Use" field (space converted to hyphen)';
COMMENT ON COLUMN business_actions.colorway IS 'Color family token (e.g. "blue", "fern", "mintChoc") — synced from Airtable "Colorway" single-select field';
