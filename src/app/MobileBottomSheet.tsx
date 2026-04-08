'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ActionIcon } from '@/components/ActionIcon';
import { ModalActionButton } from '@/components/ModalActionButton';
import { AboutCircularSA } from '@/components/AboutCircularSA';
import type { Listing } from '@/lib/getListings';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
import styles from './MobileBottomSheet.module.scss';

interface Props {
  listings: Listing[];
}

export function MobileBottomSheet({ listings }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const deltaT = Date.now() - touchStartTime.current;
    // Swipe down: >40px fast, or >80px any speed
    if (deltaY > 40 && (deltaT < 400 || deltaY > 80)) {
      close();
    }
    touchStartY.current = null;
  };

  return (
    <>
      {/* Backdrop — tapping outside closes sheet */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        className={`${styles.sheet} ${isOpen ? styles.sheetOpen : ''}`}
        role="dialog"
        aria-label="Listings"
        aria-modal={isOpen}
      >
        {/* Header */}
        <div
          className={styles.header}
          onClick={!isOpen ? open : undefined}
          onTouchStart={isOpen ? handleTouchStart : undefined}
          onTouchEnd={isOpen ? handleTouchEnd : undefined}
        >
          {!isOpen && <div className={styles.handle} aria-hidden="true" />}

          <p className={styles.count}>
            <span className={styles.countBold}>{listings.length} Listings</span>
            {' '}
            <span className={styles.countLight}>in this area</span>
          </p>

          {isOpen && (
            <ModalActionButton
              icon="fa-solid fa-arrow-left"
              surface="transparent"
              onClick={(e) => { e.stopPropagation(); close(); }}
              aria-label="Close listings"
            />
          )}
        </div>

        {/* Scrollable listing content */}
        <div className={styles.listingScroll}>
          <div className={styles.listingStack}>
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${slugify(listing.fields.businessName)}`}
                className={styles.listingCard}
              >
                <div className={styles.listingImageWrapper}>
                  {listing.fields.listingPhoto[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.fields.listingPhoto[0]}
                      alt={listing.fields.businessName}
                    />
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

          <hr className={styles.aboutDivider} />
          <AboutCircularSA mobile />
        </div>
      </div>
    </>
  );
}
