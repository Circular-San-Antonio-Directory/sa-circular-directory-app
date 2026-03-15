-- Migration 006: Add items and fa_icon columns to categories table
-- items  — comma-separated list of specific items for this category (used for search metadata)
-- fa_icon — Font Awesome Free icon name for UI display

ALTER TABLE categories ADD COLUMN IF NOT EXISTS items TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS fa_icon VARCHAR(100);

-- Recreate businesses_complete view to include per-category icon arrays.
-- NOTE: PostgreSQL views expand `SELECT *` at creation time, so the view must
-- be recreated whenever new columns are added to the underlying tables.

CREATE OR REPLACE VIEW businesses_complete AS
SELECT
  b.*,
  ARRAY(SELECT bt.name FROM business_types bt WHERE bt.id = ANY(b.business_type_ids)) as business_type_names,
  ARRAY(SELECT t.name FROM tags t WHERE t.id = ANY(b.tag_ids)) as tag_names,
  ARRAY(SELECT ba.action FROM business_actions ba WHERE ba.id = ANY(b.input_action_ids) ORDER BY ba.display_order NULLS LAST) as input_action_names,
  ARRAY(SELECT ba.action FROM business_actions ba WHERE ba.id = ANY(b.output_action_ids) ORDER BY ba.display_order NULLS LAST) as output_action_names,
  ARRAY(SELECT ba.action FROM business_actions ba WHERE ba.id = ANY(b.service_action_ids) ORDER BY ba.display_order NULLS LAST) as service_action_names,
  ARRAY(SELECT c.category FROM categories c WHERE c.id = ANY(b.input_category_ids)) as input_category_names,
  ARRAY(SELECT c.category FROM categories c WHERE c.id = ANY(b.output_category_ids)) as output_category_names,
  ARRAY(SELECT c.category FROM categories c WHERE c.id = ANY(b.service_category_ids)) as service_category_names,
  ARRAY(SELECT cm.name FROM core_material_systems cm WHERE cm.id = ANY(b.core_material_ids)) as core_material_names,
  ARRAY(SELECT es.name FROM enabling_systems es WHERE es.id = ANY(b.enabling_system_ids)) as enabling_system_names,
  ARRAY(SELECT ba.name FROM business_activities ba WHERE ba.id = ANY(b.activity_ids)) as activity_names,
  ARRAY(SELECT c.fa_icon FROM categories c WHERE c.id = ANY(b.input_category_ids)) as input_category_icons,
  ARRAY(SELECT c.fa_icon FROM categories c WHERE c.id = ANY(b.output_category_ids)) as output_category_icons,
  ARRAY(SELECT c.fa_icon FROM categories c WHERE c.id = ANY(b.service_category_ids)) as service_category_icons
FROM businesses b;
