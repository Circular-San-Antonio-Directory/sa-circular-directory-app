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
      businessName: fields['Business Name'] || '',
      businessDescription: fields['Business Descriptios'] || '', // Note: Typo in Airtable field name
      listingPhoto: fields['Listing Photo'] || [], // Airtable attachment array; use [0].url for display
      address: fields['Address'] || '',
      businessEmail: fields['Business Email'] || '',
      businessPhone: fields['Business Phone'] || '',
      website: fields['Website'] || '',

      // Contact Information
      contactName: fields['Contact Name'] || '',
      contactEmail: fields['Contact Email'] || '',
      contactedBy: fields['Contacted by'] || '',

      // Social Media
      instagramUrl1: fields['SOCIAL - Instagram URL 1'] || '',
      instagramUrl2: fields['SOCIAL- Instagram URL 2'] || '',
      facebookUrl: fields['SOCIAL - Facebook URL'] || '',
      linkedInUrl: fields['SOCIAL - LinkedIn URL'] || '',

      // Business Classification (Airtable record IDs)
      typeOfBusiness: fields['Type of Listing'] || [],
      tags: fields['TAGS'] || [],

      // Business Hours
      googleHoursAccurate: fields['Google listed hours accurate?'] || '',
      businessHours: fields['Business Hours'] || '',

      // Circular Economy Systems (Airtable record IDs)
      coreMaterialSystem: fields['Core Material System'] || [],
      enablingSystem: fields['Enabling System'] || [],

      // Input/Output/Service Actions & Categories (Airtable record IDs)
      inputActions: fields['INPUT Action(s)'] || [],
      inputCategories: fields['INPUT Category(s)'] || [],
      inputCategoryOverride: fields['INPUT Category - Override (Unique items or category)'] || [],
      inputNotes: fields['INPUT - Notes Field'] || '',

      outputActions: fields['OUTPUT Action(s)'] || [],
      outputCategories: fields['OUTPUT Category(s) (Product Sold)'] || [],
      outputCategoryOverride: fields['OUTPUT Category - Override (Unique items or category)'] || [],
      outputNotes: fields['OUTPUT - Notes Field'] || '',

      serviceActions: fields['SERVICE Action(s)'] || [],
      serviceCategories: fields['SERVICE Category(s)'] || [],
      serviceCategoryOverride: fields['SERVICE Category - Override (Unique items or category)'] || [],
      serviceNotes: fields['SERVICE - Notes Field'] || '',

      // Events & Activities (Airtable record IDs)
      notableBusinessEvents: fields['Notable Business Events/Activities'] || [],

      // Services & Features (Booleans)
      hasDelivery: fields['Has Delivery services'] || false,
      hasPickUp: fields['Has Pick Up service'] || false,
      hasOnlineShop: fields['Has Online Shop'] || false,
      onlineShopLink: fields['If online shop, Link'] || '',

      // Volunteer Opportunities
      volunteerOpportunities: fields['VOLUNTEER Opportunities'] || false,
      volunteerNotes: fields['VOLUNTEER - Notes Field'] || '',

      // Classification
      category: fields['Category'] || '',
      tiktokHandle: fields['Tiktok Handle'] || '',
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
        'Business Name': this.fields.businessName,
        'Business Description': this.fields.businessDescription,
        'Listing Photo': this.fields.listingPhoto,
        'Address': this.fields.address,
        'Business Email': this.fields.businessEmail,
        'Business Phone': this.fields.businessPhone,
        'Website': this.fields.website,
        'Contact Name': this.fields.contactName,
        'Contact Email': this.fields.contactEmail,
        'Contacted by': this.fields.contactedBy,
        'SOCIAL - Instagram URL 1': this.fields.instagramUrl1,
        'SOCIAL- Instagram URL 2': this.fields.instagramUrl2,
        'SOCIAL - Facebook URL': this.fields.facebookUrl,
        'SOCIAL - LinkedIn URL': this.fields.linkedInUrl,
        'Type of Listing': this.fields.typeOfBusiness,
        'TAGS': this.fields.tags,
        'Google listed hours accurate?': this.fields.googleHoursAccurate,
        'Business Hours': this.fields.businessHours,
        'Core Material System': this.fields.coreMaterialSystem,
        'Enabling System': this.fields.enablingSystem,
        'INPUT Action(s)': this.fields.inputActions,
        'INPUT Category(s)': this.fields.inputCategories,
        'INPUT Category - Override (Unique items or category)': this.fields.inputCategoryOverride,
        'INPUT - Notes Field': this.fields.inputNotes,
        'OUTPUT Action(s)': this.fields.outputActions,
        'OUTPUT Category(s) (Product Sold)': this.fields.outputCategories,
        'OUTPUT Category - Override (Unique items or category)': this.fields.outputCategoryOverride,
        'OUTPUT - Notes Field': this.fields.outputNotes,
        'SERVICE Action(s)': this.fields.serviceActions,
        'SERVICE Category(s)': this.fields.serviceCategories,
        'SERVICE Category - Override (Unique items or category)': this.fields.serviceCategoryOverride,
        'SERVICE - Notes Field': this.fields.serviceNotes,
        'Notable Business Events/Activities': this.fields.notableBusinessEvents,
        'Has Delivery services': this.fields.hasDelivery,
        'Has Pick Up service': this.fields.hasPickUp,
        'Has Online Shop': this.fields.hasOnlineShop,
        'If online shop, Link': this.fields.onlineShopLink,
        'VOLUNTEER Opportunities': this.fields.volunteerOpportunities,
        'VOLUNTEER - Notes Field': this.fields.volunteerNotes,
        'Category': this.fields.category,
        'Tiktok Handle': this.fields.tiktokHandle,
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
