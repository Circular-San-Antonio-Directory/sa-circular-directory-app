export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getListings, slugify } from '@/lib/getListings';
import { getActions } from '@/lib/getActions';
import { ActionsProvider } from '@/components/ActionIcon';
import { Nav } from '@/components/Nav';
import styles from './page.module.scss';
import { ListingContent } from './ListingContent';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const [listings, actions] = await Promise.all([getListings(), getActions()]);
  const listing = listings.find(l => slugify(l.fields.businessName) === slug);

  if (!listing) notFound();

  return (
    <div className={styles.page}>
      <div className={styles.navWrapper}>
        <Nav />
      </div>
      <ActionsProvider actions={actions}>
        <ListingContent listing={listing} />
      </ActionsProvider>
    </div>
  );
}
