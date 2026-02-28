-- SA Circular Directory Database Schema
-- Migration: 001 - Initial Schema Creation
-- Description: Creates all tables for migrating Airtable data to PostgreSQL

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS business_activity_events CASCADE;
DROP TABLE IF EXISTS business_enabling_systems CASCADE;
DROP TABLE IF EXISTS business_core_materials CASCADE;
DROP TABLE IF EXISTS business_service_categories CASCADE;
DROP TABLE IF EXISTS business_output_categories CASCADE;
DROP TABLE IF EXISTS business_input_categories CASCADE;
DROP TABLE IF EXISTS business_service_actions CASCADE;
DROP TABLE IF EXISTS business_output_actions CASCADE;
DROP TABLE IF EXISTS business_input_actions CASCADE;
DROP TABLE IF EXISTS business_tags CASCADE;
DROP TABLE IF EXISTS business_business_types CASCADE;
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

-- Categories (Art & Craft, Other, etc.)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  airtable_id VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_airtable_id ON categories(airtable_id);
CREATE INDEX idx_categories_category ON categories(category);

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

-- Business Actions (Buys, Accepts Dropoff, etc.)
CREATE TABLE business_actions (
  id SERIAL PRIMARY KEY,
  airtable_id VARCHAR(50) UNIQUE NOT NULL,
  action VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_business_actions_airtable_id ON business_actions(airtable_id);
CREATE INDEX idx_business_actions_action ON business_actions(action);

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

-- ============================================
-- MAIN BUSINESSES TABLE
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

  -- Business Hours
  google_hours_accurate VARCHAR(50),
  business_hours TEXT,

  -- Input Notes
  input_notes TEXT,
  input_category_override TEXT[],

  -- Services & Features
  has_delivery BOOLEAN DEFAULT FALSE,
  has_pickup BOOLEAN DEFAULT FALSE,
  has_online_shop BOOLEAN DEFAULT FALSE,
  online_shop_link VARCHAR(500),

  -- Volunteer Opportunities
  volunteer_opportunities BOOLEAN DEFAULT FALSE,
  volunteer_notes TEXT,

  -- Timestamps
  airtable_created_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_businesses_airtable_id ON businesses(airtable_id);
CREATE INDEX idx_businesses_business_name ON businesses(business_name);
CREATE INDEX idx_businesses_business_email ON businesses(business_email);

-- ============================================
-- JUNCTION TABLES (Many-to-Many Relationships)
-- ============================================

-- Business <-> Business Types
CREATE TABLE business_business_types (
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  business_type_id INTEGER REFERENCES business_types(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (business_id, business_type_id)
);

CREATE INDEX idx_business_business_types_business ON business_business_types(business_id);
CREATE INDEX idx_business_business_types_type ON business_business_types(business_type_id);

-- Business <-> Tags
CREATE TABLE business_tags (
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (business_id, tag_id)
);

CREATE INDEX idx_business_tags_business ON business_tags(business_id);
CREATE INDEX idx_business_tags_tag ON business_tags(tag_id);

-- Business <-> Input Actions
CREATE TABLE business_input_actions (
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  action_id INTEGER REFERENCES business_actions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (business_id, action_id)
);

CREATE INDEX idx_business_input_actions_business ON business_input_actions(business_id);

-- Business <-> Output Actions
CREATE TABLE business_output_actions (
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  action_id INTEGER REFERENCES business_actions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (business_id, action_id)
);

CREATE INDEX idx_business_output_actions_business ON business_output_actions(business_id);

-- Business <-> Service Actions
CREATE TABLE business_service_actions (
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  action_id INTEGER REFERENCES business_actions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (business_id, action_id)
);

CREATE INDEX idx_business_service_actions_business ON business_service_actions(business_id);

-- Business <-> Input Categories
CREATE TABLE business_input_categories (
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (business_id, category_id)
);

CREATE INDEX idx_business_input_categories_business ON business_input_categories(business_id);

-- Business <-> Output Categories
CREATE TABLE business_output_categories (
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (business_id, category_id)
);

CREATE INDEX idx_business_output_categories_business ON business_output_categories(business_id);

-- Business <-> Service Categories
CREATE TABLE business_service_categories (
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (business_id, category_id)
);

CREATE INDEX idx_business_service_categories_business ON business_service_categories(business_id);

-- Business <-> Core Material Systems
CREATE TABLE business_core_materials (
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES core_material_systems(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (business_id, material_id)
);

CREATE INDEX idx_business_core_materials_business ON business_core_materials(business_id);

-- Business <-> Enabling Systems
CREATE TABLE business_enabling_systems (
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  system_id INTEGER REFERENCES enabling_systems(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (business_id, system_id)
);

CREATE INDEX idx_business_enabling_systems_business ON business_enabling_systems(business_id);

-- Business <-> Business Activities (Events)
CREATE TABLE business_activity_events (
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  activity_id INTEGER REFERENCES business_activities(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (business_id, activity_id)
);

CREATE INDEX idx_business_activity_events_business ON business_activity_events(business_id);

-- ============================================
-- VIEWS (Optional - for easier querying)
-- ============================================

-- View: Businesses with their types
CREATE OR REPLACE VIEW businesses_with_types AS
SELECT
  b.id,
  b.airtable_id,
  b.business_name,
  b.business_email,
  b.website,
  b.address,
  STRING_AGG(DISTINCT bt.name, ', ') as business_types
FROM businesses b
LEFT JOIN business_business_types bbt ON b.id = bbt.business_id
LEFT JOIN business_types bt ON bbt.business_type_id = bt.id
GROUP BY b.id, b.airtable_id, b.business_name, b.business_email, b.website, b.address;

-- View: Businesses with their tags
CREATE OR REPLACE VIEW businesses_with_tags AS
SELECT
  b.id,
  b.business_name,
  STRING_AGG(DISTINCT t.name, ', ') as tags
FROM businesses b
LEFT JOIN business_tags btags ON b.id = btags.business_id
LEFT JOIN tags t ON btags.tag_id = t.id
GROUP BY b.id, b.business_name;

COMMENT ON TABLE businesses IS 'Main businesses table (from Airtable Production DB)';
COMMENT ON TABLE business_types IS 'Types of businesses (Shop, Service, Organization)';
COMMENT ON TABLE categories IS 'Product/service categories';
COMMENT ON TABLE tags IS 'Business tags';
COMMENT ON TABLE business_actions IS 'Actions businesses can perform (Buys, Accepts Dropoff, etc.)';
COMMENT ON TABLE core_material_systems IS 'Circular economy material systems';
COMMENT ON TABLE enabling_systems IS 'Supporting/enabling systems';
COMMENT ON TABLE business_activities IS 'Events and activities';
