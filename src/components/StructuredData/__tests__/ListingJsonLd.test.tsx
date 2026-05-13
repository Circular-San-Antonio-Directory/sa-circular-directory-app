// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ListingJsonLd } from '../ListingJsonLd';
import type { Listing } from '@/lib/getListings';
import { mockFields, openHoursJson } from '@/app/listings/[slug]/__tests__/fixtures';

vi.mock('@/lib/siteUrl', () => ({
  SITE_URL: 'https://sacirculardirectory.com',
  absoluteUrl: (path: string) => `https://sacirculardirectory.com${path.startsWith('/') ? path : `/${path}`}`,
}));

const SLUG = 'green-cycle-co';
const CANONICAL = `https://sacirculardirectory.com/listings/${SLUG}`;

function makeListing(overrides: Partial<Listing['fields']> = {}): Listing {
  return { id: 'rec123', fields: { ...mockFields, ...overrides } };
}

function getJsonLd(container: HTMLElement): Record<string, unknown> {
  const script = container.querySelector('script[type="application/ld+json"]');
  if (!script) throw new Error('No JSON-LD script tag found');
  return JSON.parse(script.innerHTML);
}

// ── Schema identity ───────────────────────────────────────────────────────────

describe('ListingJsonLd — schema identity', () => {
  it('renders a <script type="application/ld+json"> tag', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    expect(container.querySelector('script[type="application/ld+json"]')).toBeInTheDocument();
  });

  it('@context is https://schema.org', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    expect(getJsonLd(container)['@context']).toBe('https://schema.org');
  });

  it('@type is LocalBusiness', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    expect(getJsonLd(container)['@type']).toBe('LocalBusiness');
  });

  it('@id is the full canonical URL', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    expect(getJsonLd(container)['@id']).toBe(CANONICAL);
  });

  it('url is the full canonical URL', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    expect(getJsonLd(container)['url']).toBe(CANONICAL);
  });

  it('name matches businessName', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    expect(getJsonLd(container)['name']).toBe(mockFields.businessName);
  });
});

// ── Optional contact fields — present ─────────────────────────────────────────

describe('ListingJsonLd — optional fields present', () => {
  it('includes description when businessDescription is set', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    expect(getJsonLd(container)['description']).toBe(mockFields.businessDescription);
  });

  it('includes image as listingPhoto[0]', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    expect(getJsonLd(container)['image']).toBe(mockFields.listingPhoto[0]);
  });

  it('includes telephone when businessPhone is set', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    expect(getJsonLd(container)['telephone']).toBe(mockFields.businessPhone);
  });

  it('includes email when businessEmail is set', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    expect(getJsonLd(container)['email']).toBe(mockFields.businessEmail);
  });
});

// ── Optional contact fields — absent ─────────────────────────────────────────

describe('ListingJsonLd — optional fields absent', () => {
  it('omits description when businessDescription is empty', () => {
    const { container } = render(<ListingJsonLd listing={makeListing({ businessDescription: '' })} slug={SLUG} />);
    expect(getJsonLd(container)).not.toHaveProperty('description');
  });

  it('omits image when listingPhoto is empty', () => {
    const { container } = render(<ListingJsonLd listing={makeListing({ listingPhoto: [] })} slug={SLUG} />);
    expect(getJsonLd(container)).not.toHaveProperty('image');
  });

  it('omits telephone when businessPhone is empty', () => {
    const { container } = render(<ListingJsonLd listing={makeListing({ businessPhone: '' })} slug={SLUG} />);
    expect(getJsonLd(container)).not.toHaveProperty('telephone');
  });

  it('omits email when businessEmail is empty', () => {
    const { container } = render(<ListingJsonLd listing={makeListing({ businessEmail: '' })} slug={SLUG} />);
    expect(getJsonLd(container)).not.toHaveProperty('email');
  });
});

// ── sameAs ────────────────────────────────────────────────────────────────────

describe('ListingJsonLd — sameAs', () => {
  it('includes all four social URLs when all are present', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    const sameAs = getJsonLd(container)['sameAs'] as string[];
    expect(sameAs).toContain(mockFields.website);
    expect(sameAs).toContain(mockFields.instagramUrl1);
    expect(sameAs).toContain(mockFields.facebookUrl);
    expect(sameAs).toContain(mockFields.linkedInUrl);
  });

  it('filters out empty string URLs', () => {
    const { container } = render(
      <ListingJsonLd
        listing={makeListing({ instagramUrl1: '', facebookUrl: '' })}
        slug={SLUG}
      />
    );
    const sameAs = getJsonLd(container)['sameAs'] as string[];
    expect(sameAs).toHaveLength(2);
    expect(sameAs).toContain(mockFields.website);
    expect(sameAs).toContain(mockFields.linkedInUrl);
  });

  it('omits sameAs entirely when all social URLs are empty', () => {
    const { container } = render(
      <ListingJsonLd
        listing={makeListing({ website: '', instagramUrl1: '', facebookUrl: '', linkedInUrl: '' })}
        slug={SLUG}
      />
    );
    expect(getJsonLd(container)).not.toHaveProperty('sameAs');
  });
});

// ── address ───────────────────────────────────────────────────────────────────

describe('ListingJsonLd — address', () => {
  it('includes address object with correct fields when address is set', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    expect(getJsonLd(container)['address']).toEqual({
      '@type': 'PostalAddress',
      streetAddress: mockFields.address,
      addressLocality: 'San Antonio',
      addressRegion: 'TX',
      addressCountry: 'US',
    });
  });

  it('omits address when address field is empty', () => {
    const { container } = render(<ListingJsonLd listing={makeListing({ address: '' })} slug={SLUG} />);
    expect(getJsonLd(container)).not.toHaveProperty('address');
  });
});

// ── geo ───────────────────────────────────────────────────────────────────────

describe('ListingJsonLd — geo', () => {
  it('includes geo with correct coordinates when both are non-null', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    expect(getJsonLd(container)['geo']).toEqual({
      '@type': 'GeoCoordinates',
      latitude: mockFields.latitude,
      longitude: mockFields.longitude,
    });
  });

  it('omits geo when latitude is null', () => {
    const { container } = render(<ListingJsonLd listing={makeListing({ latitude: null })} slug={SLUG} />);
    expect(getJsonLd(container)).not.toHaveProperty('geo');
  });

  it('omits geo when longitude is null', () => {
    const { container } = render(<ListingJsonLd listing={makeListing({ longitude: null })} slug={SLUG} />);
    expect(getJsonLd(container)).not.toHaveProperty('geo');
  });
});

// ── openingHoursSpecification ─────────────────────────────────────────────────

describe('ListingJsonLd — openingHoursSpecification', () => {
  it('emits one entry per open day (Mon–Fri = 5 entries) from openHoursJson', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    const hours = getJsonLd(container)['openingHoursSpecification'] as unknown[];
    expect(hours).toHaveLength(5);
  });

  it('uses full day names', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    const hours = getJsonLd(container)['openingHoursSpecification'] as Array<{ dayOfWeek: string }>;
    const days = hours.map(h => h.dayOfWeek);
    expect(days).toContain('Monday');
    expect(days).toContain('Friday');
    expect(days).not.toContain('mon');
  });

  it('sets opens and closes from DayHours', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    const hours = getJsonLd(container)['openingHoursSpecification'] as Array<{
      dayOfWeek: string; opens: string; closes: string;
    }>;
    const monday = hours.find(h => h.dayOfWeek === 'Monday');
    expect(monday?.opens).toBe('09:00');
    expect(monday?.closes).toBe('17:00');
  });

  it('omits closed days (null value)', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    const hours = getJsonLd(container)['openingHoursSpecification'] as Array<{ dayOfWeek: string }>;
    const days = hours.map(h => h.dayOfWeek);
    expect(days).not.toContain('Saturday');
    expect(days).not.toContain('Sunday');
  });

  it('omits special-hours days', () => {
    const hoursWithSpecial = {
      ...openHoursJson,
      hours: { ...openHoursJson.hours, wed: { special: 'By appointment' } },
    };
    const { container } = render(
      <ListingJsonLd listing={makeListing({ hoursJson: hoursWithSpecial })} slug={SLUG} />
    );
    const hours = getJsonLd(container)['openingHoursSpecification'] as Array<{ dayOfWeek: string }>;
    const days = hours.map(h => h.dayOfWeek);
    expect(days).not.toContain('Wednesday');
  });

  it('omits openingHoursSpecification when hoursJson is null', () => {
    const { container } = render(<ListingJsonLd listing={makeListing({ hoursJson: null })} slug={SLUG} />);
    expect(getJsonLd(container)).not.toHaveProperty('openingHoursSpecification');
  });

  it('omits openingHoursSpecification when no days have array values', () => {
    const allClosed = { hours: { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null }, display: [] };
    const { container } = render(<ListingJsonLd listing={makeListing({ hoursJson: allClosed })} slug={SLUG} />);
    expect(getJsonLd(container)).not.toHaveProperty('openingHoursSpecification');
  });
});

// ── amenityFeature ────────────────────────────────────────────────────────────

describe('ListingJsonLd — amenityFeature', () => {
  it('includes Accepts Drop-offs entry when hasPickUp is true', () => {
    const { container } = render(<ListingJsonLd listing={makeListing({ hasPickUp: true })} slug={SLUG} />);
    const features = getJsonLd(container)['amenityFeature'] as Array<{ name: string }>;
    expect(features.some(f => f.name === 'Accepts Drop-offs')).toBe(true);
  });

  it('includes Offers Pickup entry when hasDelivery is true', () => {
    const { container } = render(<ListingJsonLd listing={makeListing({ hasDelivery: true })} slug={SLUG} />);
    const features = getJsonLd(container)['amenityFeature'] as Array<{ name: string }>;
    expect(features.some(f => f.name === 'Offers Pickup')).toBe(true);
  });

  it('includes Online Shop entry when hasOnlineShop is true', () => {
    const { container } = render(<ListingJsonLd listing={makeListing({ hasOnlineShop: true })} slug={SLUG} />);
    const features = getJsonLd(container)['amenityFeature'] as Array<{ name: string }>;
    expect(features.some(f => f.name === 'Online Shop')).toBe(true);
  });

  it('includes Volunteer Opportunities entry when volunteerOpportunities is true', () => {
    const { container } = render(
      <ListingJsonLd listing={makeListing({ volunteerOpportunities: true })} slug={SLUG} />
    );
    const features = getJsonLd(container)['amenityFeature'] as Array<{ name: string; value: boolean }>;
    expect(features.some(f => f.name === 'Volunteer Opportunities' && f.value === true)).toBe(true);
  });

  it('adds description to volunteer entry when volunteerNotes is set', () => {
    const { container } = render(
      <ListingJsonLd
        listing={makeListing({ volunteerOpportunities: true, volunteerNotes: 'Weekends only' })}
        slug={SLUG}
      />
    );
    const features = getJsonLd(container)['amenityFeature'] as Array<{ name: string; description?: string }>;
    const entry = features.find(f => f.name === 'Volunteer Opportunities');
    expect(entry?.description).toBe('Weekends only');
  });

  it('omits description from volunteer entry when volunteerNotes is empty', () => {
    const { container } = render(
      <ListingJsonLd
        listing={makeListing({ volunteerOpportunities: true, volunteerNotes: '' })}
        slug={SLUG}
      />
    );
    const features = getJsonLd(container)['amenityFeature'] as Array<{ name: string; description?: string }>;
    const entry = features.find(f => f.name === 'Volunteer Opportunities');
    expect(entry).not.toHaveProperty('description');
  });

  it('omits amenityFeature entirely when all flags are false', () => {
    const { container } = render(
      <ListingJsonLd
        listing={makeListing({ hasPickUp: false, hasDelivery: false, hasOnlineShop: false, volunteerOpportunities: false })}
        slug={SLUG}
      />
    );
    expect(getJsonLd(container)).not.toHaveProperty('amenityFeature');
  });
});

// ── keywords ──────────────────────────────────────────────────────────────────

describe('ListingJsonLd — keywords', () => {
  it('includes all unique terms across the five category arrays', () => {
    const { container } = render(<ListingJsonLd listing={makeListing()} slug={SLUG} />);
    const keywords = getJsonLd(container)['keywords'] as string;
    expect(keywords).toContain('Textiles');
    expect(keywords).toContain('donate');
    expect(keywords).toContain('Clothes');
  });

  it('deduplicates terms that appear in multiple arrays', () => {
    const { container } = render(
      <ListingJsonLd
        listing={makeListing({
          inputCategories: ['Textiles'],
          outputCategories: ['Textiles'],
          serviceCategories: [],
          allActionNames: [],
          tags: [],
        })}
        slug={SLUG}
      />
    );
    const keywords = (getJsonLd(container)['keywords'] as string).split(', ');
    expect(keywords.filter(k => k === 'Textiles')).toHaveLength(1);
  });

  it('omits keywords when all five arrays are empty', () => {
    const { container } = render(
      <ListingJsonLd
        listing={makeListing({
          inputCategories: [],
          outputCategories: [],
          serviceCategories: [],
          allActionNames: [],
          tags: [],
        })}
        slug={SLUG}
      />
    );
    expect(getJsonLd(container)).not.toHaveProperty('keywords');
  });
});
