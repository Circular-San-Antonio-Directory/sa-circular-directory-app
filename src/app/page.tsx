import { ActionIcon } from '@/components/ActionIcon';
import { Nav } from '@/components/Nav';
import { getListings } from '@/lib/getListings';
import styles from './page.module.scss';

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
                <div key={listing.id} className={styles.listingCard}>
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
                </div>
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

      {/* Mobile bottom sheet — fixed, shown only on mobile */}
      <div className={styles.mobileSheet}>
        <div className={styles.sheetHandle} />
        <p className={styles.sheetCount}>
          <span className={styles.countBold}>{listings.length} Listings</span>
          {' '}
          <span className={styles.countLight}>in this area</span>
        </p>
      </div>

    </div>
  );
}
