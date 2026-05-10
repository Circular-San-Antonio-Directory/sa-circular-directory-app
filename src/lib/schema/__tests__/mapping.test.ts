import { describe, it, expect } from 'vitest';
import {
  BUSINESS_FIELD_MAP,
  CATEGORY_FIELD_MAP,
  TAG_FIELD_MAP,
  BUSINESS_ACTION_FIELD_MAP,
  CORE_MATERIAL_SYSTEM_FIELD_MAP,
  ENABLING_SYSTEM_FIELD_MAP,
  BUSINESS_ACTIVITY_FIELD_MAP,
  applyBusinessFieldMap,
} from '../mapping';
import { BusinessAirtableSchema } from '../airtable';
import { BusinessesScalarFieldEnum } from '@/generated/prisma/internal/prismaNamespaceBrowser';

// ─── Suite 1: Structural consistency ─────────────────────────────────────────
//
// Every key in BUSINESS_FIELD_MAP must exist in the Zod schema (catches Airtable
// field name typos/renames). Every value must exist in the Prisma enum (catches
// DB column renames that weren't reflected in the map).

describe('BUSINESS_FIELD_MAP structural consistency', () => {
  const airtableFields = new Set(Object.keys(BusinessAirtableSchema.shape));
  const dbColumns = new Set(Object.values(BusinessesScalarFieldEnum));

  for (const [airtableField, dbColumn] of Object.entries(BUSINESS_FIELD_MAP)) {
    it(`Airtable key "${airtableField}" exists in BusinessAirtableSchema`, () => {
      expect(airtableFields.has(airtableField)).toBe(true);
    });

    it(`DB column "${dbColumn}" exists in Prisma businesses model`, () => {
      expect(dbColumns.has(dbColumn as never)).toBe(true);
    });
  }
});

// ─── Suite 2: Lookup table map consistency ────────────────────────────────────
//
// For the simpler lookup-table maps we just check the structure is non-empty
// and all values are non-empty strings (no accidental blank mappings).

describe('Lookup table field maps are well-formed', () => {
  const lookupMaps: Record<string, Record<string, string>> = {
    CATEGORY_FIELD_MAP,
    TAG_FIELD_MAP,
    BUSINESS_ACTION_FIELD_MAP,
    CORE_MATERIAL_SYSTEM_FIELD_MAP,
    ENABLING_SYSTEM_FIELD_MAP,
    BUSINESS_ACTIVITY_FIELD_MAP,
  };

  for (const [mapName, map] of Object.entries(lookupMaps)) {
    it(`${mapName} has at least one entry`, () => {
      expect(Object.keys(map).length).toBeGreaterThan(0);
    });

    for (const [airtableField, dbColumn] of Object.entries(map)) {
      it(`${mapName}: "${airtableField}" maps to a non-empty column name`, () => {
        expect(typeof dbColumn).toBe('string');
        expect(dbColumn.length).toBeGreaterThan(0);
      });
    }
  }
});

// ─── Suite 3: applyBusinessFieldMap transform logic ───────────────────────────

describe('applyBusinessFieldMap', () => {
  it('maps a string field correctly', () => {
    const result = applyBusinessFieldMap({ 'Business Name': 'Acme Co' });
    expect(result.business_name).toBe('Acme Co');
  });

  it('returns null for absent string fields', () => {
    const result = applyBusinessFieldMap({});
    expect(result.business_name).toBeNull();
    expect(result.business_description).toBeNull();
    expect(result.address).toBeNull();
  });

  it('defaults boolean fields to false when absent', () => {
    const result = applyBusinessFieldMap({});
    expect(result.has_delivery).toBe(false);
    expect(result.has_pickup).toBe(false);
    expect(result.has_online_shop).toBe(false);
    expect(result.volunteer_opportunities).toBe(false);
  });

  it('preserves boolean true values', () => {
    const result = applyBusinessFieldMap({
      'Has Delivery services': true,
      'Has Pick Up service': true,
      'Has Online Shop': true,
      'VOLUNTEER Opportunities': true,
    });
    expect(result.has_delivery).toBe(true);
    expect(result.has_pickup).toBe(true);
    expect(result.has_online_shop).toBe(true);
    expect(result.volunteer_opportunities).toBe(true);
  });

  it('coerces google_hours_accurate boolean → string', () => {
    const result = applyBusinessFieldMap({ 'Google listed hours accurate?': true });
    expect(result.google_hours_accurate).toBe('true');
  });

  it('coerces google_hours_accurate string → string', () => {
    const result = applyBusinessFieldMap({ 'Google listed hours accurate?': 'Yes' });
    expect(result.google_hours_accurate).toBe('Yes');
  });

  it('returns null for absent google_hours_accurate', () => {
    const result = applyBusinessFieldMap({});
    expect(result.google_hours_accurate).toBeNull();
  });

  it('maps all fields from a fully-populated record', () => {
    const input: Record<string, unknown> = {
      'Business Name': 'Green Cycle',
      'Business Description': 'Eco-friendly shop',
      'Address': '123 Main St',
      'Business Email': 'hello@green.com',
      'Business Phone': '555-1234',
      'Website': 'https://green.com',
      'Contact Name': 'Jane',
      'Contact Email': 'jane@green.com',
      'Contacted by': 'Staff',
      'SOCIAL - Instagram URL 1': 'https://instagram.com/green',
      'SOCIAL- Instagram URL 2': null,
      'SOCIAL - Facebook URL': null,
      'SOCIAL - LinkedIn URL': null,
      'Tiktok Handle': '@green',
      'Google listed hours accurate?': false,
      'Business Hours': 'Mon-Fri 9-5',
      'Has Delivery services': true,
      'Has Pick Up service': false,
      'Has Online Shop': true,
      'If online shop, Link': 'https://green.com/shop',
      'VOLUNTEER Opportunities': false,
      'VOLUNTEER - Notes Field': null,
      'Listing Photo': 'https://img.com/photo.jpg',
      'INPUT - Notes Field': null,
      'INPUT Category - Override (Unique items or category)': null,
      'OUTPUT - Notes Field': null,
      'OUTPUT Category - Override (Unique items or category)': null,
      'SERVICE - Notes Field': null,
      'SERVICE Category - Override (Unique items or category)': null,
    };

    const result = applyBusinessFieldMap(input);

    expect(result.business_name).toBe('Green Cycle');
    expect(result.business_description).toBe('Eco-friendly shop');
    expect(result.tiktok_handle).toBe('@green');
    expect(result.google_hours_accurate).toBe('false');
    expect(result.has_delivery).toBe(true);
    expect(result.has_pickup).toBe(false);
    expect(result.has_online_shop).toBe(true);
    expect(result.online_shop_link).toBe('https://green.com/shop');
    expect(result.listing_photo_url).toBe('https://img.com/photo.jpg');

    // Ensure every key in the map produced an entry in the output
    for (const dbColumn of Object.values(BUSINESS_FIELD_MAP)) {
      expect(dbColumn in result).toBe(true);
    }
  });
});
