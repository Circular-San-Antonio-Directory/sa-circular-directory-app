'use client';

import { useState } from 'react';
import type { Listing } from '@/lib/getListings';
import { Pill } from '@/components/Pill';
import { ActionsBlock } from '@/components/ActionsBlock';
import { SystemsMapping } from '@/components/SystemsMapping';
import { CopyEmailButton } from './CopyEmailButton';
import { BusinessHoursBlock } from './BusinessHoursBlock';
import styles from './ListingTabs.module.scss';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toInstagramUrl(handle: string): string {
  if (!handle) return '';
  if (handle.startsWith('http')) return handle;
  return `https://instagram.com/${handle.replace(/^@/, '')}`;
}

function toTikTokUrl(handle: string): string {
  if (!handle) return '';
  if (handle.startsWith('http')) return handle;
  return `https://tiktok.com/@${handle.replace(/^@/, '')}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ListingTabsProps {
  fields: Listing['fields'];
  mapsUrl: string | null;
}

export function ListingTabs({ fields: f, mapsUrl }: ListingTabsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const hasSocial = !!(f.instagramUrl1 || f.facebookUrl || f.linkedInUrl || f.tiktokHandle);

  return (
    <div className={styles.tabs}>

      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div className={styles.tabBar}>
        <button
          className={[styles.tab, activeTab === 'overview' ? styles.tabActive : ''].join(' ')}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={[styles.tab, activeTab === 'details' ? styles.tabActive : ''].join(' ')}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
      </div>

      {/* ── Overview tab ─────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className={styles.tabContent}>

          {/* Quick actions: Website + Directions */}
          {(f.website || mapsUrl) && (
            <div className={styles.contactGrid}>
              {f.website && (
                <a
                  href={f.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactCard}
                >
                  <i className={`fa-solid fa-globe ${styles.contactCardIcon}`} aria-hidden="true" />
                  <span className={styles.contactCardLabel}>Website</span>
                </a>
              )}
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[styles.contactCard, !f.website ? styles.contactCardFull : ''].join(' ')}
                >
                  <i className={`fa-solid fa-diamond-turn-right ${styles.contactCardIcon}`} aria-hidden="true" />
                  <span className={styles.contactCardLabel}>Directions</span>
                </a>
              )}
            </div>
          )}

          {/* Hours */}
          {f.hoursJson && (
            <BusinessHoursBlock hoursJson={f.hoursJson} />
          )}

          {/* Actions */}
          <ActionsBlock fields={f} />

          {/* Systems Mapping */}
          <SystemsMapping fields={f} />

        </div>
      )}

      {/* ── Details tab ──────────────────────────────────────────────── */}
      {activeTab === 'details' && (
        <div className={styles.tabContent}>

          {/* Description */}
          {f.businessDescription && (
            <div className={styles.section}>
              <p className={`body-default-regular ${styles.description}`}>{f.businessDescription}</p>
            </div>
          )}

          {/* Social links */}
          {hasSocial && (
            <div className={styles.section}>
              <div className={styles.socialRow}>
                <span className={styles.socialLabel}>Keep Up</span>
                <div className={styles.socialLinks}>
                  {f.instagramUrl1 && (
                    <a
                      href={toInstagramUrl(f.instagramUrl1)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.socialLink} ${styles.instagram}`}
                      aria-label="Instagram"
                    >
                      <i className="fa-brands fa-instagram" aria-hidden="true" />
                    </a>
                  )}
                  {f.facebookUrl && (
                    <a
                      href={f.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.socialLink} ${styles.facebook}`}
                      aria-label="Facebook"
                    >
                      <i className="fa-brands fa-facebook" aria-hidden="true" />
                    </a>
                  )}
                  {f.linkedInUrl && (
                    <a
                      href={f.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.socialLink} ${styles.linkedin}`}
                      aria-label="LinkedIn"
                    >
                      <i className="fa-brands fa-linkedin" aria-hidden="true" />
                    </a>
                  )}
                  {f.tiktokHandle && (
                    <a
                      href={toTikTokUrl(f.tiktokHandle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.socialLink} ${styles.tiktok}`}
                      aria-label="TikTok"
                    >
                      <i className="fa-brands fa-tiktok" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contact: Phone + Email */}
          <div className={styles.section}>
            <p className={styles.sectionHeading}>Contact</p>
            <div className={styles.contactRows}>
              <div className={styles.contactRow}>
                <span className={styles.contactKey}>Phone</span>
                {f.businessPhone ? (
                  <a href={`tel:${f.businessPhone}`} className={styles.contactValue}>{f.businessPhone}</a>
                ) : (
                  <span className={styles.contactValueEmpty}>—</span>
                )}
              </div>
              <div className={styles.contactRow}>
                <span className={styles.contactKey}>Email</span>
                {f.businessEmail ? (
                  <CopyEmailButton email={f.businessEmail} />
                ) : (
                  <span className={styles.contactValueEmpty}>—</span>
                )}
              </div>
            </div>
          </div>

          {/* Services */}
          <div className={styles.section}>
            <p className={styles.sectionHeading}>Services</p>
            <div className={styles.serviceRows}>
              <div className={styles.serviceRow}>
                <span className={styles.serviceKey}>Pickup</span>
                <span className={styles.serviceValue}>{f.hasPickUp ? 'Yes' : 'No'}</span>
              </div>
              <div className={styles.serviceRow}>
                <span className={styles.serviceKey}>Delivery</span>
                <span className={styles.serviceValue}>{f.hasDelivery ? 'Yes' : 'No'}</span>
              </div>
              <div className={styles.serviceRow}>
                <span className={styles.serviceKey}>Online Shop</span>
                {f.hasOnlineShop && f.onlineShopLink ? (
                  <a
                    href={f.onlineShopLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.serviceLink}
                  >
                    View Shop
                  </a>
                ) : (
                  <span className={styles.serviceValue}>No</span>
                )}
              </div>
            </div>
          </div>

          {/* Activities & Events */}
          {f.notableBusinessEvents.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Activities &amp; Events</p>
              <div className={styles.pillRow}>
                {f.notableBusinessEvents.map((evt) => (
                  <Pill key={evt} label={evt} color="spruce" size="large" />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
