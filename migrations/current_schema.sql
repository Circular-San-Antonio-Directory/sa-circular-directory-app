-- SA Circular Directory Database Schema
-- Canonical full schema — keep this up to date; used by db:reset + migrate:sql for fresh installs
-- Description: Uses PostgreSQL arrays instead of junction tables for relationships

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS business_activities CASCADE;
DROP TABLE IF EXISTS enabling_systems CASCADE;
DROP TABLE IF EXISTS core_material_systems CASCADE;
DROP TABLE IF EXISTS business_actions CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS business_types CASCADE;

-- ============================================
-- LOOKUP/REFERENCE TABLES
-- ============================================

-- Business Types (Shop, Service, Organization, etc.)
CREATE TABLE business_types (
  id SERIAL PRIMARY KEY,
  airtable_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_business_types_airtable_id ON business_types(airtable_id);
CREATE INDEX idx_business_types_name ON business_types(name);
COMMENT ON TABLE business_types IS 'Types of businesses (Shop, Service, Organization)';

-- Categories (Art & Craft, Other, etc.)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  airtable_id VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  notes TEXT,
  items TEXT,             -- comma-separated list of specific items (search metadata)
  fa_icon VARCHAR(100),   -- Font Awesome Free icon name for UI display
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_airtable_id ON categories(airtable_id);
CREATE INDEX idx_categories_category ON categories(category);
COMMENT ON TABLE categories IS 'Product/service categories';

-- Tags
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  airtable_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tags_airtable_id ON tags(airtable_id);
CREATE INDEX idx_tags_name ON tags(name);
COMMENT ON TABLE tags IS 'Business tags';

-- Business Actions (Buys, Accepts Dropoff, etc.)
CREATE TABLE business_actions (
  id SERIAL PRIMARY KEY,
  airtable_id VARCHAR(50) UNIQUE NOT NULL,
  action VARCHAR(200) NOT NULL,
  corresponding_action VARCHAR(100),   -- User-facing label (e.g. "Donate", "Buy")
  display_order INTEGER,               -- Order for display in UI (from Airtable "Order for Display")
  icon_file VARCHAR(50),               -- SVG icon key, e.g. "Icon-3" (synced from Airtable "Icon to Use")
  colorway VARCHAR(50),                -- Color family token, e.g. "blue", "fern" (synced from Airtable "Colorway")
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_business_actions_airtable_id ON business_actions(airtable_id);
CREATE INDEX idx_business_actions_action ON business_actions(action);
COMMENT ON TABLE business_actions IS 'Actions businesses can perform (Buys, Accepts Dropoff, etc.)';

-- Core Material Systems
CREATE TABLE core_material_systems (
  id SERIAL PRIMARY KEY,
  airtable_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_core_material_systems_airtable_id ON core_material_systems(airtable_id);
CREATE INDEX idx_core_material_systems_name ON core_material_systems(name);
COMMENT ON TABLE core_material_systems IS 'Circular economy material systems';

-- Enabling Systems
CREATE TABLE enabling_systems (
  id SERIAL PRIMARY KEY,
  airtable_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_enabling_systems_airtable_id ON enabling_systems(airtable_id);
CREATE INDEX idx_enabling_systems_name ON enabling_systems(name);
COMMENT ON TABLE enabling_systems IS 'Supporting/enabling systems';

-- Business Activities (Events, Programs, etc.)
CREATE TABLE business_activities (
  id SERIAL PRIMARY KEY,
  airtable_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_business_activities_airtable_id ON business_activities(airtable_id);
CREATE INDEX idx_business_activities_name ON business_activities(name);
COMMENT ON TABLE business_activities IS 'Events and activities';

-- ============================================
-- MAIN BUSINESSES TABLE (with array columns)
-- ============================================

CREATE TABLE businesses (
  id SERIAL PRIMARY KEY,
  airtable_id VARCHAR(50) UNIQUE NOT NULL,

  -- Basic Information
  business_name VARCHAR(255),
  business_description TEXT,
  address TEXT,
  business_email VARCHAR(255),
  business_phone VARCHAR(50),
  website VARCHAR(500),

  -- Contact Information
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contacted_by VARCHAR(100),

  -- Social Media
  instagram_url_1 VARCHAR(500),
  instagram_url_2 VARCHAR(500),
  facebook_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  tiktok_handle VARCHAR(500),

  -- Business Hours
  google_hours_accurate VARCHAR(50),
  business_hours TEXT,
  hours_json JSONB,

  -- Relationships (using INTEGER[] arrays of foreign keys)
  business_type_ids INTEGER[],      -- References business_types(id)
  tag_ids INTEGER[],                 -- References tags(id)
  input_action_ids INTEGER[],        -- References business_actions(id)
  output_action_ids INTEGER[],       -- References business_actions(id)
  service_action_ids INTEGER[],      -- References business_actions(id)
  input_category_ids INTEGER[],      -- References categories(id)
  output_category_ids INTEGER[],     -- References categories(id)
  service_category_ids INTEGER[],    -- References categories(id)
  core_material_ids INTEGER[],       -- References core_material_systems(id)
  enabling_system_ids INTEGER[],     -- References enabling_systems(id)
  activity_ids INTEGER[],            -- References business_activities(id)

  -- Input/Output/Service Notes & Overrides
  input_notes TEXT,
  input_category_override TEXT,
  output_notes TEXT,
  output_category_override TEXT,
  service_notes TEXT,
  service_category_override TEXT,

  -- Media
  listing_photo_url VARCHAR(500),

  -- Services & Features
  has_delivery BOOLEAN DEFAULT FALSE,
  has_pickup BOOLEAN DEFAULT FALSE,
  has_online_shop BOOLEAN DEFAULT FALSE,
  online_shop_link VARCHAR(500),

  -- Volunteer Opportunities
  volunteer_opportunities BOOLEAN DEFAULT FALSE,
  volunteer_notes TEXT,

  -- Geocoding (populated by sync pipeline via Mapbox Geocoding API)
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geocoded_at TIMESTAMPTZ,

  -- Timestamps
  airtable_created_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Regular B-tree indexes
CREATE INDEX idx_businesses_airtable_id ON businesses(airtable_id);
CREATE INDEX idx_businesses_business_name ON businesses(business_name);
CREATE INDEX idx_businesses_business_email ON businesses(business_email);

-- GIN indexes for fast array searches
CREATE INDEX idx_businesses_business_type_ids ON businesses USING GIN (business_type_ids);
CREATE INDEX idx_businesses_tag_ids ON businesses USING GIN (tag_ids);
CREATE INDEX idx_businesses_input_action_ids ON businesses USING GIN (input_action_ids);
CREATE INDEX idx_businesses_output_action_ids ON businesses USING GIN (output_action_ids);
CREATE INDEX idx_businesses_service_action_ids ON businesses USING GIN (service_action_ids);
CREATE INDEX idx_businesses_input_category_ids ON businesses USING GIN (input_category_ids);
CREATE INDEX idx_businesses_output_category_ids ON businesses USING GIN (output_category_ids);
CREATE INDEX idx_businesses_service_category_ids ON businesses USING GIN (service_category_ids);
CREATE INDEX idx_businesses_core_material_ids ON businesses USING GIN (core_material_ids);
CREATE INDEX idx_businesses_enabling_system_ids ON businesses USING GIN (enabling_system_ids);
CREATE INDEX idx_businesses_activity_ids ON businesses USING GIN (activity_ids);

COMMENT ON TABLE businesses IS 'Main businesses table (from Airtable Production DB) - uses array columns for relationships';
COMMENT ON COLUMN businesses.business_type_ids IS 'Array of business_types.id (foreign keys)';
COMMENT ON COLUMN businesses.tag_ids IS 'Array of tags.id (foreign keys)';
COMMENT ON COLUMN businesses.input_action_ids IS 'Array of business_actions.id for input actions';
COMMENT ON COLUMN businesses.output_action_ids IS 'Array of business_actions.id for output actions';
COMMENT ON COLUMN businesses.service_action_ids IS 'Array of business_actions.id for service actions';

-- ============================================
-- HELPER VIEWS (for easier querying)
-- ============================================

-- View: Businesses with expanded business type names
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

-- View: Businesses with expanded tag names
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

-- View: Businesses with expanded category names
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

-- View: Complete business information with all expanded names
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

-- ============================================
-- EXAMPLE QUERIES (as SQL comments for reference)
-- ============================================

-- Find all businesses with a specific tag_id (e.g., 5)
-- SELECT * FROM businesses WHERE tag_ids @> ARRAY[5];

-- Find businesses with ANY of multiple tags (e.g., 5, 6, 7)
-- SELECT * FROM businesses WHERE tag_ids && ARRAY[5,6,7];

-- Find businesses of a specific type (e.g., "Shop" with id=1)
-- SELECT * FROM businesses WHERE business_type_ids @> ARRAY[1];

-- Find businesses that have a specific input action
-- SELECT * FROM businesses WHERE input_action_ids @> ARRAY[3];

-- Count businesses per tag
-- SELECT t.name, COUNT(*) as business_count
-- FROM tags t
-- CROSS JOIN businesses b
-- WHERE b.tag_ids @> ARRAY[t.id]
-- GROUP BY t.name
-- ORDER BY business_count DESC;

-- Get businesses with expanded names (using views)
-- SELECT * FROM businesses_complete WHERE id = 1;

-- Search businesses by name with their types
-- SELECT * FROM businesses_with_types WHERE business_name ILIKE '%vintage%';
