/**
 * Listing Types for SA Circular Directory
 * Represents data from the businesses table and businesses_complete view
 */

/**
 * Complete listing object with all relationships expanded
 * Maps to the businesses_complete view in the database
 */
export interface Listing {
  // Primary identifiers
  id: number;
  airtable_id: string;

  // Basic Information
  business_name: string | null;
  business_description: string | null;
  address: string | null;
  business_email: string | null;
  business_phone: string | null;
  website: string | null;

  // Contact Information
  contact_name: string | null;
  contact_email: string | null;
  contacted_by: string | null;

  // Social Media
  instagram_url_1: string | null;
  instagram_url_2: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;

  // Business Hours
  google_hours_accurate: string | null;
  business_hours: string | null;

  // Relationships - IDs (arrays of foreign keys)
  business_type_ids: number[];
  tag_ids: number[];
  input_action_ids: number[];
  output_action_ids: number[];
  service_action_ids: number[];
  input_category_ids: number[];
  output_category_ids: number[];
  service_category_ids: number[];
  core_material_ids: number[];
  enabling_system_ids: number[];
  activity_ids: number[];

  // Relationships - Expanded Names (from businesses_complete view)
  business_type_names: string[];
  tag_names: string[];
  input_action_names: string[];
  output_action_names: string[];
  service_action_names: string[];
  input_category_names: string[];
  output_category_names: string[];
  service_category_names: string[];
  core_material_names: string[];
  enabling_system_names: string[];
  activity_names: string[];

  // Input Notes
  input_notes: string | null;
  input_category_override: string[] | null;

  // Services & Features
  has_delivery: boolean;
  has_pickup: boolean;
  has_online_shop: boolean;
  online_shop_link: string | null;

  // Volunteer Opportunities
  volunteer_opportunities: boolean;
  volunteer_notes: string | null;

  // Timestamps
  airtable_created_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

