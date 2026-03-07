'use client';

import { useState } from 'react';
import type { Listing } from '@/lib/getListings';
import type { ActionName } from '@/components/ActionIcon/ActionIcon';
import { ActionIcon } from '@/components/ActionIcon';
import { Pill } from '@/components/Pill';
import { CopyEmailButton } from './CopyEmailButton';
import styles from './ListingTabs.module.scss';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<ActionName, string> = {
  donate:      'Donate',
  buy:         'Buy',
  buyB2B:      'Buy (B2B)',
  sell:        'Sell',
  consign:     'Consign',
  trade:       'Trade',
  repair:      'Repair',
  recycle:     'Recycle',
  compost:     'Compost',
  volunteer:   'Volunteer',
  refill:      'Refill',
  rent:        'Rent',
  process:     'Process',
  dineOrDrink: 'Dine or Drink',
};

const INPUT_ACTIONS  = new Set<ActionName>(['donate', 'sell', 'trade']);
const OUTPUT_ACTIONS = new Set<ActionName>(['buy', 'buyB2B', 'consign']);

function getActionContent(action: ActionName, f: Listing['fields']) {
  if (INPUT_ACTIONS.has(action))
    return { categories: f.inputCategories,  override: f.inputCategoryOverride,  notes: f.inputNotes  };
  if (OUTPUT_ACTIONS.has(action))
    return { categories: f.outputCategories, override: f.outputCategoryOverride, notes: f.outputNotes };
  if (action === 'volunteer')
    return { categories: [],                  override: '',                        notes: f.volunteerNotes };
  return   { categories: f.serviceCategories, override: f.serviceCategoryOverride, notes: f.serviceNotes  };
}

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
          {f.businessHours && (
            <details className={styles.hoursDetails}>
              <summary className={styles.hoursSummary}>
                <div className={styles.hoursText}>
                  <span className={styles.hoursEyebrow}>Hours</span>
                  <span className={styles.hoursValue}>View Hours</span>
                </div>
                <i
                  className={`fa-solid fa-chevron-down ${styles.hoursChevron}`}
                  aria-hidden="true"
                />
              </summary>
              <p className={styles.hoursContent}>{f.businessHours}</p>
            </details>
          )}

          {/* Actions */}
          {f.allActionNames.length > 0 && (
            <div className={styles.actionsBlock}>
              {f.allActionNames.map((action) => {
                const { categories, override, notes } = getActionContent(action, f);
                const hasContent = categories.length > 0 || override || notes;
                return (
                  <details key={action} className={styles.actionRow}>
                    <summary className={styles.actionSummary}>
                      <ActionIcon action={action} variant="badge" />
                      <span className={styles.actionLabel}>{ACTION_LABELS[action]}</span>
                      {hasContent && (
                        <i
                          className={`fa-solid fa-chevron-down ${styles.actionChevron}`}
                          aria-hidden="true"
                        />
                      )}
                    </summary>
                    {hasContent && (
                      <div className={styles.actionContent}>
                        {categories.length > 0 && (
                          <div className={styles.actionCategories}>
                            {categories.map((cat) => (
                              <Pill key={cat} label={cat} color="mono" size="small" />
                            ))}
                          </div>
                        )}
                        {override && (
                          <div className={styles.actionOverrideBlock}>
                            <span className={`caption-bold ${styles.actionOverrideLabel}`}>Additional Items</span>
                            <p className={`body-small-regular ${styles.actionOverride}`}>{override}</p>
                          </div>
                        )}
                        {notes && <p className={styles.actionNote}>{notes}</p>}
                      </div>
                    )}
                  </details>
                );
              })}
            </div>
          )}

          {/* Systems Mapping */}
          {(f.coreMaterialSystem.length > 0 || f.enablingSystem.length > 0) && (
            <div>
              <p className={styles.sectionLabel}>Systems Mapping</p>
              <div className={styles.systemsBlock}>
                {f.coreMaterialSystem.length > 0 && (
                  <details className={styles.systemRow}>
                    <summary className={styles.systemSummary}>
                      <span className={styles.systemSummaryLabel}>Core Material Systems</span>
                      <i className={`fa-solid fa-chevron-down ${styles.systemChevron}`} aria-hidden="true" />
                    </summary>
                    <div className={styles.systemContent}>
                      {f.coreMaterialSystem.map((m) => (
                        <Pill key={m} label={m} color="mono" size="small" />
                      ))}
                    </div>
                  </details>
                )}
                {f.enablingSystem.length > 0 && (
                  <details className={styles.systemRow}>
                    <summary className={styles.systemSummary}>
                      <span className={styles.systemSummaryLabel}>This Business Enables</span>
                      <i className={`fa-solid fa-chevron-down ${styles.systemChevron}`} aria-hidden="true" />
                    </summary>
                    <div className={styles.systemContent}>
                      {f.enablingSystem.map((s) => (
                        <Pill key={s} label={s} color="mono" size="small" />
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          )}

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
                  <Pill key={evt} label={evt} color="mono" size="large" />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
