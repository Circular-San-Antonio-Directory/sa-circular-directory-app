-- Migration 005: Recreate businesses_complete view to include latitude/longitude/geocoded_at
-- Migration 004 added these columns to businesses but noted the view would pick them up
-- automatically via SELECT b.* — that is incorrect in PostgreSQL. SELECT * in a view is
-- expanded at view creation time, so the view must be recreated after new columns are added.

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
  ARRAY(SELECT ba.name FROM business_activities ba WHERE ba.id = ANY(b.activity_ids)) as activity_names
FROM businesses b;
