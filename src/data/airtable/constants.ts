import { FieldMappingConfig } from "./types";

const AIRTABLE_FIELD_NAMES = {
  // Basic Business Information
  BUSINESS_NAME: 'Business Name',
  BUSINESS_DESCRIPTION: 'Business Descriptios', // Note: Typo in Airtable field name
  LISTING_PHOTO: 'Listing Photo',
  ADDRESS: 'Address',
  BUSINESS_EMAIL: 'Business Email',
  BUSINESS_PHONE: 'Business Phone',
  WEBSITE: 'Website',

  // Contact Information
  CONTACT_NAME: 'Contact Name',
  CONTACT_EMAIL: 'Contact Email',
  CONTACTED_BY: 'Contacted by',

  // Social Media
  INSTAGRAM_URL_1: 'SOCIAL - Instagram URL 1',
  INSTAGRAM_URL_2: 'SOCIAL- Instagram URL 2', // Note: Missing space in original
  FACEBOOK_URL: 'SOCIAL - Facebook URL',
  LINKEDIN_URL: 'SOCIAL - LinkedIn URL',

  // Business Classification (Airtable record IDs)
  TYPE_OF_LISTING: 'Type of Listing',
  TAGS: 'TAGS',

  // Business Hours
  GOOGLE_HOURS_ACCURATE: 'Google listed hours accurate?',
  BUSINESS_HOURS: 'Business Hours',

  // Circular Economy Systems (Airtable record IDs)
  CORE_MATERIAL_SYSTEM: 'Core Material System',
  ENABLING_SYSTEM: 'Enabling System',

  // Input/Output/Service Actions & Categories (Airtable record IDs)
  INPUT_ACTIONS: 'INPUT Action(s)',
  INPUT_CATEGORIES: 'INPUT Category(s)',
  INPUT_CATEGORY_OVERRIDE: 'INPUT Category - Override (Unique items or category)',
  INPUT_NOTES: 'INPUT - Notes Field',

  OUTPUT_ACTIONS: 'OUTPUT Action(s)',
  OUTPUT_CATEGORIES: 'OUTPUT Category(s) (Product Sold)',
  OUTPUT_CATEGORY_OVERRIDE: 'OUTPUT Category - Override (Unique items or category)',
  OUTPUT_NOTES: 'OUTPUT - Notes Field',

  SERVICE_ACTIONS: 'SERVICE Action(s)',
  SERVICE_CATEGORIES: 'SERVICE Category(s)',
  SERVICE_CATEGORY_OVERRIDE: 'SERVICE Category - Override (Unique items or category)',
  SERVICE_NOTES: 'SERVICE - Notes Field',

  // Events & Activities (Airtable record IDs)
  NOTABLE_BUSINESS_EVENTS: 'Notable Business Events/Activities',

  // Services & Features (Booleans)
  HAS_DELIVERY: 'Has Delivery services',
  HAS_PICKUP: 'Has Pick Up service',
  HAS_ONLINE_SHOP: 'Has Online Shop',
  ONLINE_SHOP_LINK: 'If online shop, Link',

  // Volunteer Opportunities
  VOLUNTEER_OPPORTUNITIES: 'VOLUNTEER Opportunities',
  VOLUNTEER_NOTES: 'VOLUNTEER - Notes Field',

  // Classification
  CATEGORY: 'Category',
  TIKTOK_HANDLE: 'Tiktok Handle'
};

/**
 * Business fields mapping - ALL field mappings using AIRTABLE_FIELD_NAMES constants
 */
export const BUSINESS_FIELDS_MAPPING: FieldMappingConfig = {
  // Basic Business Information
  [AIRTABLE_FIELD_NAMES.BUSINESS_NAME]: { sqlColumn: 'business_name', type: 'string' },
  [AIRTABLE_FIELD_NAMES.BUSINESS_DESCRIPTION]: { sqlColumn: 'business_description', type: 'string' }, // Note: Typo preserved
  [AIRTABLE_FIELD_NAMES.LISTING_PHOTO]: { sqlColumn: 'listing_photo_url', type: 'string' },
  [AIRTABLE_FIELD_NAMES.ADDRESS]: { sqlColumn: 'address', type: 'string' },
  [AIRTABLE_FIELD_NAMES.BUSINESS_EMAIL]: { sqlColumn: 'business_email', type: 'string' },
  [AIRTABLE_FIELD_NAMES.BUSINESS_PHONE]: { sqlColumn: 'business_phone', type: 'string' },
  [AIRTABLE_FIELD_NAMES.WEBSITE]: { sqlColumn: 'website', type: 'string' },

  // Contact Information
  [AIRTABLE_FIELD_NAMES.CONTACT_NAME]: { sqlColumn: 'contact_name', type: 'string' },
  [AIRTABLE_FIELD_NAMES.CONTACT_EMAIL]: { sqlColumn: 'contact_email', type: 'string' },
  [AIRTABLE_FIELD_NAMES.CONTACTED_BY]: { sqlColumn: 'contacted_by', type: 'string' },

  // Social Media
  [AIRTABLE_FIELD_NAMES.INSTAGRAM_URL_1]: { sqlColumn: 'instagram_url_1', type: 'string' },
  [AIRTABLE_FIELD_NAMES.INSTAGRAM_URL_2]: { sqlColumn: 'instagram_url_2', type: 'string' }, // Note: Missing space in original
  [AIRTABLE_FIELD_NAMES.FACEBOOK_URL]: { sqlColumn: 'facebook_url', type: 'string' },
  [AIRTABLE_FIELD_NAMES.LINKEDIN_URL]: { sqlColumn: 'linkedin_url', type: 'string' },

  // Business Classification (Airtable record IDs)
  [AIRTABLE_FIELD_NAMES.TYPE_OF_LISTING]: { sqlColumn: 'business_type_ids', type: 'array' },
  [AIRTABLE_FIELD_NAMES.TAGS]: { sqlColumn: 'tag_ids', type: 'array' },

  // Business Hours
  [AIRTABLE_FIELD_NAMES.GOOGLE_HOURS_ACCURATE]: { sqlColumn: 'google_hours_accurate', type: 'boolean' },
  [AIRTABLE_FIELD_NAMES.BUSINESS_HOURS]: { sqlColumn: 'business_hours', type: 'string' },

  // Circular Economy Systems (Airtable record IDs)
  [AIRTABLE_FIELD_NAMES.CORE_MATERIAL_SYSTEM]: { sqlColumn: 'core_material_ids', type: 'array' },
  [AIRTABLE_FIELD_NAMES.ENABLING_SYSTEM]: { sqlColumn: 'enabling_system_ids', type: 'array' },

  // Input/Output/Service Actions & Categories (Airtable record IDs)
  [AIRTABLE_FIELD_NAMES.INPUT_ACTIONS]: { sqlColumn: 'input_action_ids', type: 'array' },
  [AIRTABLE_FIELD_NAMES.INPUT_CATEGORIES]: { sqlColumn: 'input_category_ids', type: 'array' },
  [AIRTABLE_FIELD_NAMES.INPUT_CATEGORY_OVERRIDE]: { sqlColumn: 'input_category_override', type: 'string' },
  [AIRTABLE_FIELD_NAMES.INPUT_NOTES]: { sqlColumn: 'input_notes', type: 'string' },

  [AIRTABLE_FIELD_NAMES.OUTPUT_ACTIONS]: { sqlColumn: 'output_action_ids', type: 'array' },
  [AIRTABLE_FIELD_NAMES.OUTPUT_CATEGORIES]: { sqlColumn: 'output_category_ids', type: 'array' },
  [AIRTABLE_FIELD_NAMES.OUTPUT_CATEGORY_OVERRIDE]: { sqlColumn: 'output_category_override', type: 'string' },
  [AIRTABLE_FIELD_NAMES.OUTPUT_NOTES]: { sqlColumn: 'output_notes', type: 'string' },

  [AIRTABLE_FIELD_NAMES.SERVICE_ACTIONS]: { sqlColumn: 'service_action_ids', type: 'array' },
  [AIRTABLE_FIELD_NAMES.SERVICE_CATEGORIES]: { sqlColumn: 'service_category_ids', type: 'array' },
  [AIRTABLE_FIELD_NAMES.SERVICE_CATEGORY_OVERRIDE]: { sqlColumn: 'service_category_override', type: 'string' },
  [AIRTABLE_FIELD_NAMES.SERVICE_NOTES]: { sqlColumn: 'service_notes', type: 'string' },

  // Events & Activities (Airtable record IDs)
  [AIRTABLE_FIELD_NAMES.NOTABLE_BUSINESS_EVENTS]: { sqlColumn: 'activity_ids', type: 'array' },

  // Services & Features (Booleans)
  [AIRTABLE_FIELD_NAMES.HAS_DELIVERY]: { sqlColumn: 'has_delivery', type: 'boolean' },
  [AIRTABLE_FIELD_NAMES.HAS_PICKUP]: { sqlColumn: 'has_pickup', type: 'boolean' },
  [AIRTABLE_FIELD_NAMES.HAS_ONLINE_SHOP]: { sqlColumn: 'has_online_shop', type: 'boolean' },
  [AIRTABLE_FIELD_NAMES.ONLINE_SHOP_LINK]: { sqlColumn: 'online_shop_link', type: 'string' },

  // Volunteer Opportunities
  [AIRTABLE_FIELD_NAMES.VOLUNTEER_OPPORTUNITIES]: { sqlColumn: 'volunteer_opportunities', type: 'boolean' },
  [AIRTABLE_FIELD_NAMES.VOLUNTEER_NOTES]: { sqlColumn: 'volunteer_notes', type: 'string' },

  // Additional Fields (from helpers.ts)
  'Airtable Created At': { sqlColumn: 'airtable_created_at', type: 'string' },
};

/**
 * Lookup table field mappings - ALL lookup tables in ONE place
 */
export const LOOKUP_FIELDS_MAPPING: Record<string, FieldMappingConfig> = {
  
  // Business Types
  'businessTypes': {
    [AIRTABLE_FIELD_NAMES.TYPE_OF_LISTING]: { sqlColumn: 'business_type_ids', type: 'array' }
  },
  
  // Tags
  'tags': {
    [AIRTABLE_FIELD_NAMES.TAGS]: { sqlColumn: 'tag_ids', type: 'array' }
  },
  
  // Actions (Input, Output, Service)
  'actions': {
    [AIRTABLE_FIELD_NAMES.INPUT_ACTIONS]: { sqlColumn: 'input_action_ids', type: 'array' },
    [AIRTABLE_FIELD_NAMES.OUTPUT_ACTIONS]: { sqlColumn: 'output_action_ids', type: 'array' },
    [AIRTABLE_FIELD_NAMES.SERVICE_ACTIONS]: { sqlColumn: 'service_action_ids', type: 'array' }
  },
  
  // Categories (Input, Output, Service)
  'categories': {
    [AIRTABLE_FIELD_NAMES.INPUT_CATEGORIES]: { sqlColumn: 'input_category_ids', type: 'array' },
    [AIRTABLE_FIELD_NAMES.OUTPUT_CATEGORIES]: { sqlColumn: 'output_category_ids', type: 'array' },
    [AIRTABLE_FIELD_NAMES.SERVICE_CATEGORIES]: { sqlColumn: 'service_category_ids', type: 'array' }
  },
  
  // Core Materials & Systems
  'coreMaterials': {
    [AIRTABLE_FIELD_NAMES.CORE_MATERIAL_SYSTEM]: { sqlColumn: 'core_material_ids', type: 'array' }
  },
  
  'enablingSystems': {
    [AIRTABLE_FIELD_NAMES.ENABLING_SYSTEM]: { sqlColumn: 'enabling_system_ids', type: 'array' }
  },
  
  // Activities/Events
  'activities': {
    [AIRTABLE_FIELD_NAMES.NOTABLE_BUSINESS_EVENTS]: { sqlColumn: 'activity_ids', type: 'array' }
  }
};