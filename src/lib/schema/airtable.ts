import { z } from 'zod';

// ─── Lookup table schemas ─────────────────────────────────────────────────────

export const BusinessTypeAirtableSchema = z.object({
  Name: z.string(),
});

export const CategoryAirtableSchema = z.object({
  Category: z.string(),
  Notes: z.string().optional(),
  Items: z.string().optional(),
  'FA Icon': z.string().optional(),
});

export const TagAirtableSchema = z.object({
  Name: z.string(),
  Description: z.string().optional(),
});

export const BusinessActionAirtableSchema = z.object({
  Action: z.string(),
  'Corresponding Action': z.string().optional(),
  'Order for Display': z.number().optional(),
  'Icon to Use': z.string().optional(),
  Colorway: z.string().optional(),
});

export const CoreMaterialSystemAirtableSchema = z.object({
  Name: z.string(),
  Description: z.string().optional(),
});

export const EnablingSystemAirtableSchema = z.object({
  Name: z.string(),
  Description: z.string().optional(),
});

export const BusinessActivityAirtableSchema = z.object({
  Name: z.string(),
  Description: z.string().optional(),
});

// ─── Main business schema ─────────────────────────────────────────────────────

export const BusinessAirtableSchema = z.object({
  // Basic info
  'Business Name': z.string().optional(),
  'Business Descriptios': z.string().optional(), // Airtable typo — do not fix here
  'Listing Photo': z.string().optional(),
  'Address': z.string().optional(),
  'Business Email': z.string().optional(),
  'Business Phone': z.string().optional(),
  'Website': z.string().optional(),

  // Contact
  'Contact Name': z.string().optional(),
  'Contact Email': z.string().optional(),
  'Contacted by': z.string().optional(),

  // Social media
  'SOCIAL - Instagram URL 1': z.string().optional(),
  'SOCIAL- Instagram URL 2': z.string().optional(), // missing space in Airtable — do not fix
  'SOCIAL - Facebook URL': z.string().optional(),
  'SOCIAL - LinkedIn URL': z.string().optional(),
  'Tiktok Handle': z.string().optional(),

  // Classification (array of Airtable record IDs)
  'Type of Listing': z.array(z.string()).optional(),
  'TAGS': z.array(z.string()).optional(),

  // Business hours
  'Google listed hours accurate?': z.union([z.string(), z.boolean()]).optional(),
  'Business Hours': z.string().optional(),

  // Circular economy systems (Airtable record IDs)
  'Core Material System': z.array(z.string()).optional(),
  'Enabling System': z.array(z.string()).optional(),

  // Actions (Airtable record IDs)
  'INPUT Action(s)': z.array(z.string()).optional(),
  'OUTPUT Action(s)': z.array(z.string()).optional(),
  'SERVICE Action(s)': z.array(z.string()).optional(),

  // Categories (Airtable record IDs)
  'INPUT Category(s)': z.array(z.string()).optional(),
  'OUTPUT Category(s) (Product Sold)': z.array(z.string()).optional(),
  'SERVICE Category(s)': z.array(z.string()).optional(),

  // Category overrides
  'INPUT Category - Override (Unique items or category)': z.string().optional(),
  'OUTPUT Category - Override (Unique items or category)': z.string().optional(),
  'SERVICE Category - Override (Unique items or category)': z.string().optional(),

  // Notes
  'INPUT - Notes Field': z.string().optional(),
  'OUTPUT - Notes Field': z.string().optional(),
  'SERVICE - Notes Field': z.string().optional(),

  // Events (Airtable record IDs)
  'Notable Business Events/Activities': z.array(z.string()).optional(),

  // Services/features
  'Has Delivery services': z.boolean().optional(),
  'Has Pick Up service': z.boolean().optional(),
  'Has Online Shop': z.boolean().optional(),
  'If online shop, Link': z.string().optional(),

  // Volunteer
  'VOLUNTEER Opportunities': z.boolean().optional(),
  'VOLUNTEER - Notes Field': z.string().optional(),
}).passthrough(); // allow unknown Airtable fields without failing

export type BusinessAirtableRecord = z.infer<typeof BusinessAirtableSchema>;
export type BusinessTypeAirtableRecord = z.infer<typeof BusinessTypeAirtableSchema>;
export type CategoryAirtableRecord = z.infer<typeof CategoryAirtableSchema>;
export type TagAirtableRecord = z.infer<typeof TagAirtableSchema>;
export type BusinessActionAirtableRecord = z.infer<typeof BusinessActionAirtableSchema>;
export type CoreMaterialSystemAirtableRecord = z.infer<typeof CoreMaterialSystemAirtableSchema>;
export type EnablingSystemAirtableRecord = z.infer<typeof EnablingSystemAirtableSchema>;
export type BusinessActivityAirtableRecord = z.infer<typeof BusinessActivityAirtableSchema>;
