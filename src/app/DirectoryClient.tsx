'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ActionIcon } from '@/components/ActionIcon';
import type { ActionName } from '@/components/ActionIcon';
import type { Listing } from '@/lib/getListings';
import { slugify } from '@/lib/slugify';
import styles from './page.module.scss';

const MapView = dynamic(
  () => import('@/components/MapView').then((m) => m.MapView),
  { ssr: false },
);

interface DirectoryClientProps {
  listings: Listing[];
}

export function DirectoryClient({ listings }: DirectoryClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionName | null>(null);
  const cardRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const filteredListings = useMemo(() => {
    let result = listings;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.fields.businessName.toLowerCase().includes(q) ||
          l.fields.address.toLowerCase().includes(q),
      );
    }

    if (actionFilter) {
      result = result.filter((l) => l.fields.allActionNames.includes(actionFilter));
    }

    return result;
  }, [listings, searchQuery, actionFilter]);

  const handleSelectListing = useCallback((id: string) => {
    setSelectedId(id);
    const card = cardRefs.current.get(id);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  return (
    <>
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
          selectedId={selectedId}
          onSelectListing={handleSelectListing}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actionFilter={actionFilter}
          onActionFilterChange={setActionFilter}
        />
      </div>
    </>
  );
}
