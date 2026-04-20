import type { MetadataRoute } from 'next';
import { getListings, slugify } from '@/lib/getListings';
import { absoluteUrl } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await getListings();
  const now = new Date();

  const home: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl('/'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 1.0,
  };

  const listingEntries: MetadataRoute.Sitemap = listings.map(l => ({
    url: absoluteUrl(`/listings/${slugify(l.fields.businessName)}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [home, ...listingEntries];
}
