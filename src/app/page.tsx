import { Nav } from '@/components/Nav';
import styles from './page.module.scss';

// ---------------------------------------------------------------------------
// Placeholder listing data — replace when the real ListingCard component
// and data layer are built.
// ---------------------------------------------------------------------------

interface PlaceholderListing {
  id: number;
  name: string;
  address: string;
  categories: string[];
}

const PLACEHOLDER_LISTINGS: PlaceholderListing[] = [
  {
    id: 1,
    name: 'Placeholder Listing Card',
    address: '2021 San Pedro Ave Suite #1, San Antonio, TX 78212',
    categories: ['Donate', 'Thrift'],
  },
  {
    id: 2,
    name: 'Placeholder Listing Card',
    address: '823 Fredericksburg Rd, San Antonio, TX 78201',
    categories: ['Donate', 'Repair'],
  },
  {
    id: 3,
    name: 'Placeholder Listing Card',
    address: '4710 Broadway, San Antonio, TX 78209',
    categories: ['Donate', 'Buy'],
  },
  {
    id: 4,
    name: 'Hyped Goods',
    address: '2021 San Pedro Ave Suite #1, San Antonio, TX 78212',
    categories: ['Donate', 'Buy'],
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  Donate: 'fa-solid fa-recycle',
  Buy: 'fa-solid fa-bag-shopping',
  Thrift: 'fa-solid fa-tags',
  Repair: 'fa-solid fa-screwdriver-wrench',
  Compost: 'fa-solid fa-leaf',
};

// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <div className={styles.page}>

      {/* Desktop: padded content wrapper */}
      <div className={styles.pageInner}>
        <Nav />

        <div className={styles.contentArea}>
          {/* Sidebar — desktop only */}
          <aside className={styles.sidebar}>
            <div className={styles.countPill}>
              <span className={styles.countBold}>43 Listings</span>
              {' '}
              <span className={styles.countLight}>in this area</span>
            </div>

            <p className={styles.sidebarHint}>
              Get started by searching for an item, category, or business.
            </p>

            <div className={styles.listingStack}>
              {PLACEHOLDER_LISTINGS.map((listing) => (
                <div key={listing.id} className={styles.listingCard}>
                  <div className={styles.listingImageWrapper}>
                    <i className="fa-regular fa-image" aria-hidden="true" />
                  </div>
                  <div className={styles.listingBody}>
                    <div className={styles.listingMeta}>
                      <p className={styles.listingTitle}>{listing.name}</p>
                      <p className={styles.listingAddress}>{listing.address}</p>
                    </div>
                    <div className={styles.listingBadges}>
                      {listing.categories.map((cat) => (
                        <div key={cat} className={styles.badge}>
                          <i
                            className={`${CATEGORY_ICONS[cat] ?? 'fa-solid fa-circle'} ${styles.badgeIcon}`}
                            aria-hidden="true"
                          />
                          <span className={styles.badgeLabel}>{cat}</span>
                        </div>
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
          <span className={styles.countBold}>43 Listings</span>
          {' '}
          <span className={styles.countLight}>in this area</span>
        </p>
      </div>

    </div>
  );
}
