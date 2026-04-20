// NOTE: No metadata or generateMetadata here. This intercepting route only
// activates on client-side nav from inside the app. Crawlers, social scrapers,
// direct URL loads, refreshes, and shared links always resolve /listings/[slug]
// to the standalone route at src/app/listings/[slug]/page.tsx, which owns all
// SEO metadata + JSON-LD. See STRUCTURED_DATA.md for the schema.

export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getListings, slugify } from '@/lib/getListings';
import { getActions } from '@/lib/getActions';
import { ActionsProvider } from '@/components/ActionIcon';
import { ListingModal } from '@/components/ListingModal';
import { ListingContent } from '@/app/listings/[slug]/ListingContent';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ListingModalPage({ params }: Props) {
  const { slug } = await params;
  const [listings, actions] = await Promise.all([getListings(), getActions()]);
  const listing = listings.find(l => slugify(l.fields.businessName) === slug);

  if (!listing) notFound();

  return (
    <ActionsProvider actions={actions}>
      <ListingModal title={listing.fields.businessName}>
        <ListingContent listing={listing} isModal />
      </ListingModal>
    </ActionsProvider>
  );
}
