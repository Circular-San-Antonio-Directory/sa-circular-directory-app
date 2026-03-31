'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ActionIcon, useActionsConfig, getActionLabel } from '@/components/ActionIcon';
import type { ActionName } from '@/components/ActionIcon';
import type { Listing } from '@/lib/getListings';
import type { Category } from '@/lib/getCategories';
import { slugify } from '@/lib/slugify';
import { filterListings } from '@/lib/filterListings';
import { MobileBottomSheet } from './MobileBottomSheet';
import { MobileSearchSheet } from './MobileSearchSheet';
import styles from './page.module.scss';

const MapView = dynamic(
  () => import('@/components/MapView').then((m) => m.MapView),
  { ssr: false },
);

interface DirectoryClientProps {
  listings: Listing[];
  categories: Category[];
}

export function DirectoryClient({ listings, categories }: DirectoryClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionName | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const cardRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const actionsConfig = useActionsConfig();
  const pillColorway = actionFilter
    ? (actionsConfig.find((a) => a.actionName === actionFilter)?.colorway ?? 'mono')
    : 'mono';

  const filteredListings = useMemo(
    () => filterListings(listings, categories, searchQuery, actionFilter),
    [listings, categories, searchQuery, actionFilter],
  );

  const handleSelectListing = useCallback((id: string) => {
    setSelectedId(id);
    const card = cardRefs.current.get(id);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  return (
    <>
      {/* Mobile search bar — sits below nav, above map; desktop hidden */}
      <div className={styles.mobileSearchBar}>
        <div
          className={styles.mobileSearchField}
          role="button"
          tabIndex={0}
          onClick={() => setIsMobileSearchOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && setIsMobileSearchOpen(true)}
        >
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <span className={styles.mobileSearchContent}>
            {actionFilter && (
              <span
                className={styles.mobileSearchAction}
                style={{ color: `var(--${pillColorway}-700)` }}
              >
                {getActionLabel(actionFilter, actionsConfig)}
              </span>
            )}
            {searchQuery ? (
              <span className={styles.mobileSearchText}>{searchQuery}</span>
            ) : (
              <span className={`${styles.mobileSearchText} ${styles.mobileSearchPlaceholder}`}>
                {actionFilter ? 'Any item or category...' : 'Search items, categories...'}
              </span>
            )}
          </span>
          {(searchQuery || actionFilter) && (
            <button
              type="button"
              className={styles.mobileClearBtn}
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
                setActionFilter(null);
              }}
              aria-label="Clear search"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Sidebar — desktop only */}
      <aside className={styles.sidebar}>
        <div className={styles.countPill}>
          <span className={styles.countBold}>{filteredListings.length} Listings</span>
          {' '}
          <span className={styles.countLight}>in this area</span>
        </div>

        <p className={styles.sidebarHint}>
          Get started by searching for an item, category, or business.
        </p>

        <div className={styles.listingStack}>
          {filteredListings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${slugify(listing.fields.businessName)}`}
              className={`${styles.listingCard}${selectedId === listing.id ? ` ${styles.listingCardSelected}` : ''}`}
              ref={(el) => {
                if (el) cardRefs.current.set(listing.id, el);
                else cardRefs.current.delete(listing.id);
              }}
              onClick={() => setSelectedId(listing.id)}
            >
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

      {/* Map */}
      <div className={styles.mapArea}>
        <MapView
          listings={listings}
          filteredListings={filteredListings}
          categories={categories}
          selectedId={selectedId}
          onSelectListing={handleSelectListing}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actionFilter={actionFilter}
          onActionFilterChange={setActionFilter}
          onMobileSearchOpen={() => setIsMobileSearchOpen(true)}
        />
      </div>

      {/* Mobile bottom sheet — receives filtered listings so filters apply on mobile too */}
      <MobileBottomSheet listings={filteredListings} />

      {/* Mobile search + filter sheet */}
      <MobileSearchSheet
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        onApply={(q, af) => { setSearchQuery(q); setActionFilter(af); }}
        initialSearch={searchQuery}
        initialActionFilter={actionFilter}
        listings={listings}
        categories={categories}
      />
    </>
  );
}
