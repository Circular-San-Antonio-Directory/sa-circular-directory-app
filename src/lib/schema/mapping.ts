// Maps Airtable field names → Prisma model field names for each entity.
// When adding a new field: update both the Zod schema in airtable.ts and this map.

export const BUSINESS_FIELD_MAP = {
  'Business Name':                                       'business_name',
  'Business Description':                                'business_description',
  'Listing Photo':                                       'listing_photo_url',
  'Address':                                             'address',
  'Business Email':                                      'business_email',
  'Business Phone':                                      'business_phone',
  'Website':                                             'website',
  'Contact Name':                                        'contact_name',
  'Contact Email':                                       'contact_email',
  'Contacted by':                                        'contacted_by',
  'SOCIAL - Instagram URL 1':                            'instagram_url_1',
  'SOCIAL- Instagram URL 2':                             'instagram_url_2',
  'SOCIAL - Facebook URL':                               'facebook_url',
  'SOCIAL - LinkedIn URL':                               'linkedin_url',
  'Tiktok Handle':                                       'tiktok_handle',
  'Google listed hours accurate?':                       'google_hours_accurate',
  'Business Hours':                                      'business_hours',
  'INPUT - Notes Field':                                 'input_notes',
  'INPUT Category - Override (Unique items or category)':'input_category_override',
  'OUTPUT - Notes Field':                                'output_notes',
  'OUTPUT Category - Override (Unique items or category)':'output_category_override',
  'SERVICE - Notes Field':                               'service_notes',
  'SERVICE Category - Override (Unique items or category)':'service_category_override',
  'Has Delivery services':                               'has_delivery',
  'Has Pick Up service':                                 'has_pickup',
  'Has Online Shop':                                     'has_online_shop',
  'If online shop, Link':                                'online_shop_link',
  'VOLUNTEER Opportunities':                             'volunteer_opportunities',
  'VOLUNTEER - Notes Field':                             'volunteer_notes',
} as const satisfies Record<string, string>;

// ─── Transform helper ─────────────────────────────────────────────────────────

const BOOLEAN_DB_COLUMNS = new Set([
  'has_delivery', 'has_pickup', 'has_online_shop', 'volunteer_opportunities',
]);

/**
 * Applies BUSINESS_FIELD_MAP to a raw Airtable fields object, returning the
 * corresponding DB column values. Pure function — no Prisma or DB dependency.
 */
export function applyBusinessFieldMap(fRaw: Record<string, unknown>): Record<string, unknown> {
  const scalarData: Record<string, unknown> = {};
  for (const [airtableField, dbColumn] of Object.entries(BUSINESS_FIELD_MAP)) {
    const raw = fRaw[airtableField];
    if (dbColumn === 'google_hours_accurate') {
      // Airtable sends boolean or string; DB column is VARCHAR
      scalarData[dbColumn] = raw != null ? String(raw) : null;
    } else if (BOOLEAN_DB_COLUMNS.has(dbColumn)) {
      scalarData[dbColumn] = raw ?? false;
    } else {
      scalarData[dbColumn] = raw ?? null;
    }
  }
  return scalarData;
}

// Lookup table field maps: Airtable field name → SQL column name
export const BUSINESS_TYPE_FIELD_MAP = {
  Name: 'name',
} as const satisfies Record<string, string>;

export const CATEGORY_FIELD_MAP = {
  Category: 'category',
  Notes: 'notes',
  Items: 'items',
  'FA Icon': 'fa_icon',
} as const satisfies Record<string, string>;

export const TAG_FIELD_MAP = {
  Name: 'name',
  Description: 'description',
} as const satisfies Record<string, string>;

export const BUSINESS_ACTION_FIELD_MAP = {
  Action: 'action',
  'Corresponding Action': 'corresponding_action',
  'Order for Display': 'display_order',
  'Icon to Use': 'icon_file',
  Colorway: 'colorway',
} as const satisfies Record<string, string>;

export const CORE_MATERIAL_SYSTEM_FIELD_MAP = {
  Name: 'name',
  Description: 'description',
} as const satisfies Record<string, string>;

export const ENABLING_SYSTEM_FIELD_MAP = {
  Name: 'name',
  Description: 'description',
} as const satisfies Record<string, string>;

export const BUSINESS_ACTIVITY_FIELD_MAP = {
  Name: 'name',
  Description: 'description',
} as const satisfies Record<string, string>;
