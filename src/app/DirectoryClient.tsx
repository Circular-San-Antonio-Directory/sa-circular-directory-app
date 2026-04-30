'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ActionIcon, useActionsConfig, getActionLabel } from '@/components/ActionIcon';
import type { ActionName } from '@/components/ActionIcon';
import type { Listing } from '@/lib/getListings';
import type { Category } from '@/lib/getCategories';
import { Pill } from '@/components/Pill';
import type { PillColor } from '@/components/Pill';
import { slugify } from '@/lib/slugify';
import { filterListings } from '@/lib/filterListings';
import { MobileBottomSheet } from './MobileBottomSheet';
import { MobileMapPreview } from './MobileMapPreview';
import { MobileSearchSheet } from './MobileSearchSheet';
import styles from './page.module.scss';

const MapView = dynamic(
  () => import('@/components/MapView').then((m) => m.MapView),
  { ssr: false },
);

// ─── Preview action helpers ───────────────────────────────────────────────────

function getPreviewActionContent(action: ActionName, f: Listing['fields']) {
  if (f.inputActionNames.includes(action))
    return { categories: f.inputCategories,  override: f.inputCategoryOverride  };
  if (f.outputActionNames.includes(action))
    return { categories: f.outputCategories, override: f.outputCategoryOverride };
  if (action === 'volunteer')
    return { categories: [],                  override: ''                        };
  return   { categories: f.serviceCategories, override: f.serviceCategoryOverride };
}

// Deterministic tag color — same algorithm as ListingContent.tsx
const TAG_COLORS: PillColor[] = ['blue', 'orange', 'merlot', 'fern', 'violet', 'spruce', 'mintChoc', 'redAdobe'];

function tagColor(tag: string): PillColor {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DirectoryClientProps {
  listings: Listing[];
  categories: Category[];
}

export function DirectoryClient({ listings, categories }: DirectoryClientProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionName | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const cardRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const sidebarRef = useRef<HTMLElement>(null);

  const actionsConfig = useActionsConfig();
  const pillColorway = actionFilter
    ? (actionsConfig.find((a) => a.actionName === actionFilter)?.colorway ?? 'mono')
    : 'mono';

  const filteredListings = useMemo(
    () => filterListings(listings, categories, searchQuery, actionFilter),
    [listings, categories, searchQuery, actionFilter],
  );

  // Look up the full listing object for the mobile map preview card.
  // Uses all listings (not filtered) so the card doesn't disappear when filters change.
  const previewListing = previewId ? (listings.find((l) => l.id === previewId) ?? null) : null;

  const handleSelectListing = useCallback((id: string) => {
    setPreviewId(id);
    const card = cardRefs.current.get(id);
    const sidebar = sidebarRef.current;
    if (card && sidebar) {
      const cardRect = card.getBoundingClientRect();
      const sidebarRect = sidebar.getBoundingClientRect();
      sidebar.scrollTo({
        top: sidebar.scrollTop + cardRect.top - sidebarRect.top - 8,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleMapBackgroundClick = useCallback(() => {
    // On mobile, users may pan/zoom the map while still viewing the preview card.
    // Only dismiss on desktop where the sidebar card is the preview surface.
    if (window.innerWidth >= 820) setPreviewId(null);
  }, []);

  const handleMobilePreviewClose = useCallback(() => {
    setPreviewId(null);
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
      <aside className={styles.sidebar} ref={sidebarRef}>
        <div className={styles.countPill}>
          <span className={styles.countBold}>{filteredListings.length} Listings</span>
          {' '}
          {/* <span className={styles.countLight}>in this area</span> */}
        </div>

        <p className={styles.sidebarHint}>
          Get started by searching for an item, category, or business.
        </p>

        <div className={styles.listingStack}>
          {filteredListings.map((listing) => {
            const isPreview = previewId === listing.id;
            return (
              <Link
                key={listing.id}
                href={`/listings/${slugify(listing.fields.businessName)}`}
                className={`${styles.listingCard}${isPreview ? ` ${styles.listingCardPreview}` : ''}`}
                ref={(el) => {
                  if (el) cardRefs.current.set(listing.id, el);
                  else cardRefs.current.delete(listing.id);
                }}
              >
                {/* Image */}
                <div className={styles.listingImageWrapper}>
                  {listing.fields.listingPhoto[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.fields.listingPhoto[0]} alt={listing.fields.businessName} />
                  ) : (
                    <i className="fa-regular fa-image" aria-hidden="true" />
                  )}
                </div>

                {/* Default body — always visible */}
                <div className={styles.listingBody}>
                  <div className={styles.listingMeta}>
                    <p className={styles.listingTitle}>{listing.fields.businessName}</p>
                    <p className={styles.listingAddress}>{listing.fields.address}</p>
                  </div>
                  {!isPreview && (
                    <div className={styles.listingBadges}>
                      {listing.fields.allActionNames.map((action) => (
                        <ActionIcon key={action} action={action} variant="icon-with-label" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Preview expansion — always in DOM for smooth animation */}
                <div className={`${styles.previewExpanded}${isPreview ? ` ${styles.previewExpandedOpen}` : ''}`}>
                  <div className={styles.previewInner}>

                    <hr className={styles.previewDivider} />

                    {/* Tags */}
                    {listing.fields.tags.length > 0 && (
                      <div className={styles.previewTags}>
                        {listing.fields.tags.map((tag) => (
                          <Pill key={tag} label={tag} color={tagColor(tag)} size="small" />
                        ))}
                      </div>
                    )}

                    <hr className={styles.previewDivider} />

                    {/* Action rows */}
                    <div className={styles.previewActions}>
                      {listing.fields.allActionNames.map((action, i) => {
                        const { categories: cats, override } = getPreviewActionContent(action, listing.fields);
                        const categoryText = override || cats.join(', ');
                        return (
                          <div key={action}>
                            {i > 0 && <hr className={styles.previewActionDivider} />}
                            <div className={styles.previewActionRow}>
                              <div className={styles.previewActionLeft}>
                                <ActionIcon action={action} variant="icon-with-label" />
                              </div>
                              {categoryText && (
                                <p className={styles.previewActionCategories}>{categoryText}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* CTA Footer */}
                    <div className={styles.previewCTA}>
                      <span className={styles.previewCTALabel}>View Full Details</span>
                      <i className="fa-solid fa-arrow-right-long" aria-hidden="true" />
                    </div>

                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Map */}
      <div className={styles.mapArea}>
        <MapView
          listings={listings}
          filteredListings={filteredListings}
          categories={categories}
          selectedId={previewId}
          onSelectListing={handleSelectListing}
          onMapBackgroundClick={handleMapBackgroundClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actionFilter={actionFilter}
          onActionFilterChange={setActionFilter}
          onMobileSearchOpen={() => setIsMobileSearchOpen(true)}
        />
      </div>

      {/* Mobile map preview card — floats over the map when a marker is tapped */}
      <MobileMapPreview listing={previewListing} onClose={handleMobilePreviewClose} />

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
