/**
 * Business record data structure
 * Transforms Airtable raw data into a structured business object
 */

// ============================================
// FIELD NAME CONSTANTS (Centralized Definitions)
// ============================================

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
 * Business record data structure
 * Transforms Airtable raw data into a structured business object
 */
class BusinessRecord {
  constructor(airtableRecord) {
    this.id = airtableRecord.id;
    this.createdTime = airtableRecord.createdTime;
    this.fields = this.transformFields(airtableRecord.fields || {});
  }

  transformFields(fields) {
  return {
    // Basic Business Information
    businessName: fields[AIRTABLE_FIELD_NAMES.BUSINESS_NAME] || '',
    businessDescription: fields[AIRTABLE_FIELD_NAMES.BUSINESS_DESCRIPTION] || '', // Note: Typo in Airtable field name
    listingPhoto: fields[AIRTABLE_FIELD_NAMES.LISTING_PHOTO] || [], // Airtable attachment array; use [0].url for display
    address: fields[AIRTABLE_FIELD_NAMES.ADDRESS] || '',
    businessEmail: fields[AIRTABLE_FIELD_NAMES.BUSINESS_EMAIL] || '',
    businessPhone: fields[AIRTABLE_FIELD_NAMES.BUSINESS_PHONE] || '',
    website: fields[AIRTABLE_FIELD_NAMES.WEBSITE] || '',

    // Contact Information
    contactName: fields[AIRTABLE_FIELD_NAMES.CONTACT_NAME] || '',
    contactEmail: fields[AIRTABLE_FIELD_NAMES.CONTACT_EMAIL] || '',
    contactedBy: fields[AIRTABLE_FIELD_NAMES.CONTACTED_BY] || '',

    // Social Media
    instagramUrl1: fields[AIRTABLE_FIELD_NAMES.INSTAGRAM_URL_1] || '',
    instagramUrl2: fields[AIRTABLE_FIELD_NAMES.INSTAGRAM_URL_2] || '', // Note: Missing space in original
    facebookUrl: fields[AIRTABLE_FIELD_NAMES.FACEBOOK_URL] || '',
    linkedInUrl: fields[AIRTABLE_FIELD_NAMES.LINKEDIN_URL] || '',

    // Business Classification (Airtable record IDs)
    typeOfBusiness: fields[AIRTABLE_FIELD_NAMES.TYPE_OF_LISTING] || [],
    tags: fields[AIRTABLE_FIELD_NAMES.TAGS] || [],

    // Business Hours
    googleHoursAccurate: fields[AIRTABLE_FIELD_NAMES.GOOGLE_HOURS_ACCURATE] || '',
    businessHours: fields[AIRTABLE_FIELD_NAMES.BUSINESS_HOURS] || '',

    // Circular Economy Systems (Airtable record IDs)
    coreMaterialSystem: fields[AIRTABLE_FIELD_NAMES.CORE_MATERIAL_SYSTEM] || [],
    enablingSystem: fields[AIRTABLE_FIELD_NAMES.ENABLING_SYSTEM] || [],

    // Input/Output/Service Actions & Categories (Airtable record IDs)
    inputActions: fields[AIRTABLE_FIELD_NAMES.INPUT_ACTIONS] || [],
    inputCategories: fields[AIRTABLE_FIELD_NAMES.INPUT_CATEGORIES] || [],
    inputCategoryOverride: fields[AIRTABLE_FIELD_NAMES.INPUT_CATEGORY_OVERRIDE] || [],
    inputNotes: fields[AIRTABLE_FIELD_NAMES.INPUT_NOTES] || '',

    outputActions: fields[AIRTABLE_FIELD_NAMES.OUTPUT_ACTIONS] || [],
    outputCategories: fields[AIRTABLE_FIELD_NAMES.OUTPUT_CATEGORIES] || [],
    outputCategoryOverride: fields[AIRTABLE_FIELD_NAMES.OUTPUT_CATEGORY_OVERRIDE] || [],
    outputNotes: fields[AIRTABLE_FIELD_NAMES.OUTPUT_NOTES] || '',

    serviceActions: fields[AIRTABLE_FIELD_NAMES.SERVICE_ACTIONS] || [],
    serviceCategories: fields[AIRTABLE_FIELD_NAMES.SERVICE_CATEGORIES] || [],
    serviceCategoryOverride: fields[AIRTABLE_FIELD_NAMES.SERVICE_CATEGORY_OVERRIDE] || [],
    serviceNotes: fields[AIRTABLE_FIELD_NAMES.SERVICE_NOTES] || '',

    // Events & Activities (Airtable record IDs)
    notableBusinessEvents: fields[AIRTABLE_FIELD_NAMES.NOTABLE_BUSINESS_EVENTS] || [],

    // Services & Features (Booleans)
    hasDelivery: fields[AIRTABLE_FIELD_NAMES.HAS_DELIVERY] || false,
    hasPickUp: fields[AIRTABLE_FIELD_NAMES.HAS_PICKUP] || false,
    hasOnlineShop: fields[AIRTABLE_FIELD_NAMES.HAS_ONLINE_SHOP] || false,
    onlineShopLink: fields[AIRTABLE_FIELD_NAMES.ONLINE_SHOP_LINK] || '',

    // Volunteer Opportunities
    volunteerOpportunities: fields[AIRTABLE_FIELD_NAMES.VOLUNTEER_OPPORTUNITIES] || false,
    volunteerNotes: fields[AIRTABLE_FIELD_NAMES.VOLUNTEER_NOTES] || '',

    // Classification
    category: fields[AIRTABLE_FIELD_NAMES.CATEGORY] || '',
    tiktokHandle: fields[AIRTABLE_FIELD_NAMES.TIKTOK_HANDLE] || '',
  };
}

  /**
   * Get a clean object without empty fields
   */
  toCleanObject() {
    const clean = {
      id: this.id,
      createdTime: this.createdTime,
      fields: {}
    };

    Object.entries(this.fields).forEach(([key, value]) => {
      // Only include non-empty values
      if (value !== '' && value !== false &&
          !(Array.isArray(value) && value.length === 0)) {
        clean.fields[key] = value;
      }
    });

    return clean;
  }

  /**
   * Get original Airtable format (for comparison)
   */
  toAirtableFormat() {
    return {
      id: this.id,
      fields: {
        [AIRTABLE_FIELD_NAMES.BUSINESS_NAME]: this.fields.businessName,
        [AIRTABLE_FIELD_NAMES.BUSINESS_DESCRIPTION]: this.fields.businessDescription, // Note: Typo in Airtable field name
        [AIRTABLE_FIELD_NAMES.LISTING_PHOTO]: this.fields.listingPhoto,
        [AIRTABLE_FIELD_NAMES.ADDRESS]: this.fields.address,
        [AIRTABLE_FIELD_NAMES.BUSINESS_EMAIL]: this.fields.businessEmail,
        [AIRTABLE_FIELD_NAMES.BUSINESS_PHONE]: this.fields.businessPhone,
        [AIRTABLE_FIELD_NAMES.WEBSITE]: this.fields.website,
        [AIRTABLE_FIELD_NAMES.CONTACT_NAME]: this.fields.contactName,
        [AIRTABLE_FIELD_NAMES.CONTACT_EMAIL]: this.fields.contactEmail,
        [AIRTABLE_FIELD_NAMES.CONTACTED_BY]: this.fields.contactedBy,
        [AIRTABLE_FIELD_NAMES.INSTAGRAM_URL_1]: this.fields.instagramUrl1,
        [AIRTABLE_FIELD_NAMES.INSTAGRAM_URL_2]: this.fields.instagramUrl2, // Note: Missing space in original
        [AIRTABLE_FIELD_NAMES.FACEBOOK_URL]: this.fields.facebookUrl,
        [AIRTABLE_FIELD_NAMES.LINKEDIN_URL]: this.fields.linkedInUrl,
        [AIRTABLE_FIELD_NAMES.TYPE_OF_LISTING]: this.fields.typeOfBusiness,
        [AIRTABLE_FIELD_NAMES.TAGS]: this.fields.tags,
        [AIRTABLE_FIELD_NAMES.GOOGLE_HOURS_ACCURATE]: this.fields.googleHoursAccurate,
        [AIRTABLE_FIELD_NAMES.BUSINESS_HOURS]: this.fields.businessHours,
        [AIRTABLE_FIELD_NAMES.CORE_MATERIAL_SYSTEM]: this.fields.coreMaterialSystem,
        [AIRTABLE_FIELD_NAMES.ENABLING_SYSTEM]: this.fields.enablingSystem,
        [AIRTABLE_FIELD_NAMES.INPUT_ACTIONS]: this.fields.inputActions,
        [AIRTABLE_FIELD_NAMES.INPUT_CATEGORIES]: this.fields.inputCategories,
        [AIRTABLE_FIELD_NAMES.INPUT_CATEGORY_OVERRIDE]: this.fields.inputCategoryOverride,
        [AIRTABLE_FIELD_NAMES.INPUT_NOTES]: this.fields.inputNotes,
        [AIRTABLE_FIELD_NAMES.OUTPUT_ACTIONS]: this.fields.outputActions,
        [AIRTABLE_FIELD_NAMES.OUTPUT_CATEGORIES]: this.fields.outputCategories,
        [AIRTABLE_FIELD_NAMES.OUTPUT_CATEGORY_OVERRIDE]: this.fields.outputCategoryOverride,
        [AIRTABLE_FIELD_NAMES.OUTPUT_NOTES]: this.fields.outputNotes,
        [AIRTABLE_FIELD_NAMES.SERVICE_ACTIONS]: this.fields.serviceActions,
        [AIRTABLE_FIELD_NAMES.SERVICE_CATEGORIES]: this.fields.serviceCategories,
        [AIRTABLE_FIELD_NAMES.SERVICE_CATEGORY_OVERRIDE]: this.fields.serviceCategoryOverride,
        [AIRTABLE_FIELD_NAMES.SERVICE_NOTES]: this.fields.serviceNotes,
        [AIRTABLE_FIELD_NAMES.NOTABLE_BUSINESS_EVENTS]: this.fields.notableBusinessEvents,
        [AIRTABLE_FIELD_NAMES.HAS_DELIVERY]: this.fields.hasDelivery,
        [AIRTABLE_FIELD_NAMES.HAS_PICKUP]: this.fields.hasPickUp,
        [AIRTABLE_FIELD_NAMES.HAS_ONLINE_SHOP]: this.fields.hasOnlineShop,
        [AIRTABLE_FIELD_NAMES.ONLINE_SHOP_LINK]: this.fields.onlineShopLink,
        [AIRTABLE_FIELD_NAMES.VOLUNTEER_OPPORTUNITIES]: this.fields.volunteerOpportunities,
        [AIRTABLE_FIELD_NAMES.VOLUNTEER_NOTES]: this.fields.volunteerNotes,
        [AIRTABLE_FIELD_NAMES.CATEGORY]: this.fields.category,
        [AIRTABLE_FIELD_NAMES.TIKTOK_HANDLE]: this.fields.tiktokHandle,
      },
      createdTime: this.createdTime
    };
  }
}

/**
 * Transform raw Airtable records into BusinessRecord objects
 * @param {Array} records - Array of raw Airtable records
 * @param {boolean} useCleanFormat - If true, returns clean objects without empty fields
 * @returns {Array} - Array of transformed business records
 */
function transformBusinessRecords(records, useCleanFormat = true) {
  return records.map(record => {
    const businessRecord = new BusinessRecord(record);
    return useCleanFormat ? businessRecord.toCleanObject() : businessRecord.fields;
  });
}

module.exports = {
  BusinessRecord,
  transformBusinessRecords
};
