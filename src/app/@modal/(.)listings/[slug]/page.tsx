export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getListings, slugify } from '@/lib/getListings';
import { ListingModal } from '@/components/ListingModal';
import { ListingContent } from '@/app/listings/[slug]/ListingContent';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ListingModalPage({ params }: Props) {
  const { slug } = await params;
  const listings = await getListings();
  const listing = listings.find(l => slugify(l.fields.businessName) === slug);

  if (!listing) notFound();

  return (
    <ListingModal>
      <ListingContent listing={listing} isModal />
    </ListingModal>
  );
}
