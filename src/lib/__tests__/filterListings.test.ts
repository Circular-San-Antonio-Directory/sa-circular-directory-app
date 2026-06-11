// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { filterListings } from '../filterListings';
import type { Listing } from '../getListings';
import type { Category } from '../getCategories';
import type { ActionName } from '@/components/ActionIcon/ActionIcon';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeListing(overrides: Partial<Listing['fields']> & { id?: string }): Listing {
  const { id = 'test-id', ...fields } = overrides;
  return {
    id,
    fields: {
      businessName: '',
      businessDescription: '',
      listingPhoto: [],
      address: '',
      latitude: null,
      longitude: null,
      businessEmail: '',
      businessPhone: '',
      website: '',
      contactName: '',
      contactEmail: '',
      instagramUrl1: '',
      facebookUrl: '',
      linkedInUrl: '',
      tiktokHandle: '',
      hasDelivery: false,
      hasPickUp: false,
      hasOnlineShop: false,
      onlineShopLink: '',
      category: '',
      typeOfBusiness: [],
      coreMaterialSystem: [],
      enablingSystem: [],
      tags: [],
      notableBusinessEvents: [],
      googleHoursAccurate: '',
      businessHours: '',
      hoursJson: null,
      inputActions: [],
      inputCategories: [],
      inputCategoryIcons: [],
      inputCategoryOverride: '',
      inputNotes: '',
      outputActions: [],
      outputCategories: [],
      outputCategoryIcons: [],
      outputCategoryOverride: '',
      outputNotes: '',
      serviceActions: [],
      serviceCategories: [],
      serviceCategoryIcons: [],
      serviceCategoryOverride: '',
      serviceNotes: '',
      volunteerOpportunities: false,
      volunteerNotes: '',
      inputActionNames: [],
      outputActionNames: [],
      serviceActionNames: [],
      allActionNames: [],
      ...fields,
    },
  };
}

function makeCategory(category: string, items: string[]): Category {
  return { category, items, faIcon: null };
}

const LISTINGS: Listing[] = [
  makeListing({
    id: 'green-cycle',
    businessName: 'Green Cycle',
    address: '100 Main St',
    inputCategories: ['Bicycles'],
    inputActionNames: ['donate'],
    outputCategories: ['Books'],
    outputActionNames: ['buy'],
    allActionNames: ['donate', 'buy'],
  }),
  makeListing({
    id: 'repair-hub',
    businessName: 'Repair Hub',
    address: '200 Oak Ave',
    serviceCategories: ['Electronics', 'Clothing'],
    serviceActionNames: ['repair'],
    allActionNames: ['repair'],
  }),
  makeListing({
    id: 'compost-co',
    businessName: 'Compost Co',
    address: '300 Elm Rd',
    inputCategories: ['Food Scraps'],
    inputActionNames: ['compost'],
    allActionNames: ['compost'],
  }),
  makeListing({
    id: 'thrift-store',
    businessName: 'Thrift Store',
    address: '400 Pine Blvd',
    inputCategories: ['Clothing', 'Books'],
    inputActionNames: ['donate'],
    outputCategories: ['Clothing', 'Books'],
    outputActionNames: ['buy'],
    allActionNames: ['donate', 'buy'],
  }),
];

const CATEGORIES: Category[] = [
  makeCategory('Bicycles', ['bicycle', 'bike', 'cycle']),
  makeCategory('Electronics', ['phone', 'laptop', 'tablet']),
  makeCategory('Clothing', ['shirt', 'jacket', 'pants']),
  makeCategory('Books', ['book', 'novel', 'textbook']),
  makeCategory('Food Scraps', ['food', 'scraps', 'produce']),
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('filterListings — no filters', () => {
  it('returns all listings when query and action are both empty', () => {
    const result = filterListings(LISTINGS, CATEGORIES, '', null);
    expect(result).toHaveLength(LISTINGS.length);
  });

  it('returns all listings when query is whitespace only', () => {
    const result = filterListings(LISTINGS, CATEGORIES, '   ', null);
    expect(result).toHaveLength(LISTINGS.length);
  });
});

describe('filterListings — action filter only', () => {
  it('returns listings with the matching action', () => {
    const result = filterListings(LISTINGS, CATEGORIES, '', 'repair');
    expect(result.map(l => l.id)).toEqual(['repair-hub']);
  });

  it('returns multiple listings sharing the same action', () => {
    const result = filterListings(LISTINGS, CATEGORIES, '', 'donate');
    expect(result.map(l => l.id)).toContain('green-cycle');
    expect(result.map(l => l.id)).toContain('thrift-store');
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no listing has the action', () => {
    const result = filterListings(LISTINGS, CATEGORIES, '', 'sell' as ActionName);
    expect(result).toHaveLength(0);
  });
});

describe('filterListings — search query only', () => {
  it('matches by business name (case-insensitive)', () => {
    const result = filterListings(LISTINGS, CATEGORIES, 'green', null);
    expect(result.map(l => l.id)).toEqual(['green-cycle']);
  });

  it('matches by address', () => {
    const result = filterListings(LISTINGS, CATEGORIES, 'oak ave', null);
    expect(result.map(l => l.id)).toEqual(['repair-hub']);
  });

  it('matches by category item keyword', () => {
    // "bike" is an item in the Bicycles category, which green-cycle has
    const result = filterListings(LISTINGS, CATEGORIES, 'bike', null);
    expect(result.map(l => l.id)).toContain('green-cycle');
  });

  it('matches across multiple listings by category', () => {
    // "shirt" is in Clothing, held by repair-hub (service) and thrift-store (input + output)
    const result = filterListings(LISTINGS, CATEGORIES, 'shirt', null);
    const ids = result.map(l => l.id);
    expect(ids).toContain('repair-hub');
    expect(ids).toContain('thrift-store');
  });

  it('returns empty array when nothing matches', () => {
    const result = filterListings(LISTINGS, CATEGORIES, 'zzznomatch', null);
    expect(result).toHaveLength(0);
  });

  it('matches by category override field', () => {
    const withOverride = makeListing({
      id: 'override-biz',
      businessName: 'Override Biz',
      inputCategoryOverride: 'Vintage Maps',
    });
    const result = filterListings([...LISTINGS, withOverride], CATEGORIES, 'vintage maps', null);
    expect(result.map(l => l.id)).toContain('override-biz');
  });
});

describe('filterListings — search + action filter combined', () => {
  it('returns listing when name matches and action matches', () => {
    // Green Cycle has "donate" and name contains "green"
    const result = filterListings(LISTINGS, CATEGORIES, 'green', 'donate');
    expect(result.map(l => l.id)).toContain('green-cycle');
  });

  it('excludes listing when name matches but action does not', () => {
    // Green Cycle matches "green" but does not have "compost"
    const result = filterListings(LISTINGS, CATEGORIES, 'green', 'compost');
    expect(result.map(l => l.id)).not.toContain('green-cycle');
  });

  it('returns listing when category is in the same group as the action', () => {
    // "bike" → Bicycles category → input group → Green Cycle has donate in input group
    const result = filterListings(LISTINGS, CATEGORIES, 'bike', 'donate');
    expect(result.map(l => l.id)).toContain('green-cycle');
  });

  it('excludes listing when category matches but action is in a different group', () => {
    // "bike" → Bicycles in green-cycle's INPUT group, but buy is in OUTPUT group — no cross-group match
    const result = filterListings(LISTINGS, CATEGORIES, 'bike', 'buy');
    expect(result.map(l => l.id)).not.toContain('green-cycle');
  });

  it('matches via service group category + action', () => {
    // "shirt" → Clothing in repair-hub's service group, repair is also in service group
    const result = filterListings(LISTINGS, CATEGORIES, 'shirt', 'repair');
    expect(result.map(l => l.id)).toContain('repair-hub');
  });

  it('returns empty array when neither condition is satisfied', () => {
    const result = filterListings(LISTINGS, CATEGORIES, 'zzznomatch', 'donate');
    expect(result).toHaveLength(0);
  });

  it('matches by address with action filter', () => {
    // "oak ave" matches repair-hub's address, and repair-hub has "repair"
    const result = filterListings(LISTINGS, CATEGORIES, 'oak ave', 'repair');
    expect(result.map(l => l.id)).toContain('repair-hub');
  });
});
