export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getListings, slugify, type Listing } from '@/lib/getListings';
import { getActions } from '@/lib/getActions';
import { ActionsProvider } from '@/components/ActionIcon';
import { ListingJsonLd } from '@/components/StructuredData';
import { Nav } from '@/components/Nav';
import styles from './page.module.scss';
import { ListingContent } from './ListingContent';
import { PageTransition } from './PageTransition';

interface Props {
  params: Promise<{ slug: string }>;
}

const DESCRIPTION_MAX = 155;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const sliced = text.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  const head = lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${head.trimEnd()}…`;
}

function buildDescription(listing: Listing): string {
  const f = listing.fields;
  if (f.businessDescription) return truncate(f.businessDescription, DESCRIPTION_MAX);

  const typeLabel = f.typeOfBusiness[0] ?? 'Circular economy business';
  const actions = f.allActionNames.slice(0, 4).join(', ');
  const base = actions
    ? `${typeLabel} in San Antonio offering ${actions}.`
    : `${typeLabel} in San Antonio — part of the SA Circular Directory.`;
  return truncate(base, DESCRIPTION_MAX);
}

async function findListing(slug: string): Promise<Listing | null> {
  const listings = await getListings();
  return listings.find(l => slugify(l.fields.businessName) === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await findListing(slug);

  if (!listing) {
    return {
      title: 'Listing not found',
      robots: { index: false, follow: false },
    };
  }

  const f = listing.fields;
  const description = buildDescription(listing);
  const canonicalPath = `/listings/${slug}`;
  const image = f.listingPhoto[0] ?? '/og-default.png';

  return {
    title: f.businessName,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'website',
      url: canonicalPath,
      title: f.businessName,
      description,
      images: [{ url: image, alt: f.businessName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: f.businessName,
      description,
      images: [image],
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const [listing, actions] = await Promise.all([findListing(slug), getActions()]);

  if (!listing) notFound();

  return (
    <div className={styles.page}>
      <ListingJsonLd listing={listing} slug={slug} />
      <div className={styles.navWrapper}>
        <Nav />
      </div>
      <ActionsProvider actions={actions}>
        <PageTransition>
          <ListingContent listing={listing} />
        </PageTransition>
      </ActionsProvider>
    </div>
  );
}
