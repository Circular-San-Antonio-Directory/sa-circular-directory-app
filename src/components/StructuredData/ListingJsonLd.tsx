import type { BusinessHoursJson, DayKey, Listing } from '@/lib/getListings';
import { absoluteUrl } from '@/lib/siteUrl';

const DAY_OF_WEEK: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

interface OpeningHoursEntry {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string;
  opens: string;
  closes: string;
}

function toOpeningHours(hoursJson: BusinessHoursJson | null): OpeningHoursEntry[] | null {
  if (!hoursJson?.hours) return null;
  const entries: OpeningHoursEntry[] = [];
  const days = Object.keys(DAY_OF_WEEK) as DayKey[];
  for (const key of days) {
    const value = hoursJson.hours[key];
    if (!Array.isArray(value)) continue; // skip nulls and { special } entries
    for (const range of value) {
      if (!range.open || !range.close) continue;
      entries.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: DAY_OF_WEEK[key],
        opens: range.open,
        closes: range.close,
      });
    }
  }
  return entries.length > 0 ? entries : null;
}

interface ListingJsonLdProps {
  listing: Listing;
  slug: string;
}

export function ListingJsonLd({ listing, slug }: ListingJsonLdProps) {
  const f = listing.fields;
  const canonicalUrl = absoluteUrl(`/listings/${slug}`);

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': canonicalUrl,
    name: f.businessName,
    url: canonicalUrl,
  };

  if (f.businessDescription) jsonLd.description = f.businessDescription;
  if (f.listingPhoto[0]) jsonLd.image = f.listingPhoto[0];
  if (f.businessPhone) jsonLd.telephone = f.businessPhone;
  if (f.businessEmail) jsonLd.email = f.businessEmail;

  const sameAs = [f.website, f.instagramUrl1, f.facebookUrl, f.linkedInUrl].filter(Boolean);
  if (sameAs.length > 0) jsonLd.sameAs = sameAs;

  if (f.address) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      streetAddress: f.address,
      addressLocality: 'San Antonio',
      addressRegion: 'TX',
      addressCountry: 'US',
    };
  }

  if (f.latitude !== null && f.longitude !== null) {
    jsonLd.geo = {
      '@type': 'GeoCoordinates',
      latitude: f.latitude,
      longitude: f.longitude,
    };
  }

  const openingHours = toOpeningHours(f.hoursJson);
  if (openingHours) jsonLd.openingHoursSpecification = openingHours;

  const amenityFeatures: Record<string, unknown>[] = [];
  if (f.hasPickUp) amenityFeatures.push({ '@type': 'LocationFeatureSpecification', name: 'Accepts Drop-offs', value: true });
  if (f.hasDelivery) amenityFeatures.push({ '@type': 'LocationFeatureSpecification', name: 'Offers Pickup', value: true });
  if (f.hasOnlineShop) amenityFeatures.push({ '@type': 'LocationFeatureSpecification', name: 'Online Shop', value: true });
  if (f.volunteerOpportunities) {
    const volunteerFeature: Record<string, unknown> = { '@type': 'LocationFeatureSpecification', name: 'Volunteer Opportunities', value: true };
    if (f.volunteerNotes) volunteerFeature.description = f.volunteerNotes;
    amenityFeatures.push(volunteerFeature);
  }
  if (amenityFeatures.length > 0) jsonLd.amenityFeature = amenityFeatures;

  const keywordParts = [
    ...f.inputCategories,
    ...f.outputCategories,
    ...f.serviceCategories,
    ...f.allActionNames,
    ...f.tags,
  ];
  const keywords = [...new Set(keywordParts.filter(Boolean))].join(', ');
  if (keywords) jsonLd.keywords = keywords;

  return (
    <script
      type="application/ld+json"
      // JSON.stringify escapes </script> safely; no user input goes here raw.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
