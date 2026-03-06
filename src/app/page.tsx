import Link from 'next/link';
import { ActionIcon } from '@/components/ActionIcon';
import { Nav } from '@/components/Nav';
import { getListings, slugify } from '@/lib/getListings';
import { MobileBottomSheet } from './MobileBottomSheet';
import styles from './page.module.scss';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const listings = await getListings();

  return (
    <div className={styles.page}>

      {/* Desktop: padded content wrapper */}
      <div className={styles.pageInner}>
        <Nav />

        <div className={styles.contentArea}>
          {/* Sidebar — desktop only */}
          <aside className={styles.sidebar}>
            <div className={styles.countPill}>
              <span className={styles.countBold}>{listings.length} Listings</span>
              {' '}
              <span className={styles.countLight}>in this area</span>
            </div>

            <p className={styles.sidebarHint}>
              Get started by searching for an item, category, or business.
            </p>

            <div className={styles.listingStack}>
              {listings.map((listing) => (
                <Link key={listing.id} href={`/listings/${slugify(listing.fields.businessName)}`} className={styles.listingCard}>
                  <div className={styles.listingImageWrapper}>
                    {listing.fields.listingPhoto[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.fields.listingPhoto[0]} alt={listing.fields.businessName} />
                    ) : (
                      <i className="fa-regular fa-image" aria-hidden="true" />
                    )}
                  </div>
                  <div className={styles.listingBody}>
                    <div className={styles.listingMeta}>
                      <p className={styles.listingTitle}>{listing.fields.businessName}</p>
                      <p className={styles.listingAddress}>{listing.fields.address}</p>
                    </div>
                    <div className={styles.listingBadges}>
                      {listing.fields.allActionNames.map((action) => (
                        <ActionIcon key={action} action={action} variant="icon-with-label" />
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>

          {/* Map placeholder */}
          <div className={styles.mapArea}>
            <p className={styles.mapPlaceholderText}>
              Map will go here, for placeholder only
            </p>
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet — interactive, shown only on mobile */}
      <MobileBottomSheet listings={listings} />

    </div>
  );
}
