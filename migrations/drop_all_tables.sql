-- Drop All Tables Script
-- WARNING: This will permanently delete all tables and data
-- Use with caution!

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS businesses_complete CASCADE;
DROP VIEW IF EXISTS businesses_with_categories CASCADE;
DROP VIEW IF EXISTS businesses_with_tags CASCADE;
DROP VIEW IF EXISTS businesses_with_types CASCADE;

-- Drop main table
DROP TABLE IF EXISTS businesses CASCADE;

-- Drop lookup/reference tables
DROP TABLE IF EXISTS business_activities CASCADE;
DROP TABLE IF EXISTS enabling_systems CASCADE;
DROP TABLE IF EXISTS core_material_systems CASCADE;
DROP TABLE IF EXISTS business_actions CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS business_types CASCADE;

-- Optional: Drop all tables in the current schema (more aggressive)
-- Uncomment below to use this approach instead
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all views
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- Drop all views
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
    END LOOP;
END $$;

-- Confirmation message
SELECT 'All tables and views have been dropped' AS status;
