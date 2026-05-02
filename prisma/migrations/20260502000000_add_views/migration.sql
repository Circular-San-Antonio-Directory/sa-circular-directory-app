CREATE OR REPLACE VIEW businesses_with_types AS
SELECT
  b.id,
  b.airtable_id,
  b.business_name,
  b.business_email,
  b.website,
  b.address,
  b.business_type_ids,
  ARRAY(
    SELECT bt.name
    FROM business_types bt
    WHERE bt.id = ANY(b.business_type_ids)
  ) as business_type_names
FROM businesses b;

CREATE OR REPLACE VIEW businesses_with_tags AS
SELECT
  b.id,
  b.business_name,
  b.tag_ids,
  ARRAY(
    SELECT t.name
    FROM tags t
    WHERE t.id = ANY(b.tag_ids)
  ) as tag_names
FROM businesses b;

CREATE OR REPLACE VIEW businesses_with_categories AS
SELECT
  b.id,
  b.business_name,
  b.input_category_ids,
  b.output_category_ids,
  b.service_category_ids,
  ARRAY(
    SELECT c.category
    FROM categories c
    WHERE c.id = ANY(b.input_category_ids)
  ) as input_category_names,
  ARRAY(
    SELECT c.category
    FROM categories c
    WHERE c.id = ANY(b.output_category_ids)
  ) as output_category_names,
  ARRAY(
    SELECT c.category
    FROM categories c
    WHERE c.id = ANY(b.service_category_ids)
  ) as service_category_names
FROM businesses b;

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
