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
