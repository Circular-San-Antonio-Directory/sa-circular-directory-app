export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getListings, slugify } from '@/lib/getListings';
import type { Listing } from '@/lib/getListings';
import type { ActionName } from '@/components/ActionIcon/ActionIcon';
import { Nav } from '@/components/Nav';
import { ActionIcon } from '@/components/ActionIcon';
import { Pill } from '@/components/Pill';
import styles from './page.module.scss';

// ─── Action helpers ───────────────────────────────────────────────────────────

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
  // service actions: repair, recycle, compost, refill, dineOrDrink
  return   { categories: f.serviceCategories, override: f.serviceCategoryOverride, notes: f.serviceNotes  };
}

// ─── Social URL helpers ───────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const listings = await getListings();
  const listing = listings.find(l => slugify(l.fields.businessName) === slug);

  if (!listing) notFound();

  const f = listing.fields;
  const photo = f.listingPhoto[0] ?? null;

  const hasSocial = !!(f.instagramUrl1 || f.facebookUrl || f.linkedInUrl || f.tiktokHandle);
  const mapsUrl = f.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.address)}`
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.navWrapper}>
        <Nav />
      </div>

      <div className={styles.body}>
        {/* ── Main content ─────────────────────────────────────────── */}
        <main className={styles.main}>
          <div className={styles.mainInner}>

            {/* Header */}
            <div className={styles.header}>
              <div className={styles.nameAddress}>
                <h1 className={`hero-2-strong ${styles.businessName}`}>{f.businessName}</h1>
                {f.address && (
                  <p className={`body-default-regular ${styles.address}`}>{f.address}</p>
                )}
              </div>
              {f.businessDescription && (
                <p className={`body-large-small ${styles.description}`}>{f.businessDescription}</p>
              )}
            </div>

            {/* Photo */}
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt={f.businessName}
                className={styles.photo}
              />
            ) : (
              <div className={styles.photoPlaceholder}>
                <i className="fa-regular fa-image" aria-hidden="true" />
              </div>
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
                        <span className={styles.actionLabel}>
                          {ACTION_LABELS[action]}
                        </span>
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
                          {notes && (
                            <p className={styles.actionNote}>{notes}</p>
                          )}
                        </div>
                      )}
                    </details>
                  );
                })}
              </div>
            )}

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

            {/* Tags — What you'll find */}
            {f.tags.length > 0 && (
              <div className={styles.section}>
                <p className={styles.sectionLabel}>What you&apos;ll find</p>
                <div className={styles.pillRow}>
                  {f.tags.map((tag) => (
                    <Pill key={tag} label={tag} color="mono" size="small" />
                  ))}
                </div>
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
        </main>

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className={styles.sidebar}>

          {/* Quick contact grid */}
          <div className={styles.contactGrid}>
            {f.businessPhone && (
              <a href={`tel:${f.businessPhone}`} className={styles.contactCard}>
                <i className={`fa-solid fa-phone ${styles.contactCardIcon}`} aria-hidden="true" />
                <span className={styles.contactCardLabel}>Call</span>
              </a>
            )}
            {f.businessEmail && (
              <a href={`mailto:${f.businessEmail}`} className={styles.contactCard}>
                <i className={`fa-solid fa-envelope ${styles.contactCardIcon}`} aria-hidden="true" />
                <span className={styles.contactCardLabel}>Email</span>
              </a>
            )}
            {f.website && (
              <a href={f.website} target="_blank" rel="noopener noreferrer" className={styles.contactCard}>
                <i className={`fa-solid fa-globe ${styles.contactCardIcon}`} aria-hidden="true" />
                <span className={styles.contactCardLabel}>Website</span>
              </a>
            )}
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={styles.contactCard}>
                <i className={`fa-solid fa-location-dot ${styles.contactCardIcon}`} aria-hidden="true" />
                <span className={styles.contactCardLabel}>Directions</span>
              </a>
            )}
          </div>

          <hr className={styles.sidebarDivider} />

          {/* Social links */}
          {hasSocial && (
            <>
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
              <hr className={styles.sidebarDivider} />
            </>
          )}

          {/* Service Options */}
          <div className={styles.serviceOptions}>
            <p className={styles.serviceHeading}>Service Options</p>
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

          {/* Hours */}
          {f.businessHours && (
            <>
              <hr className={styles.sidebarDivider} />
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
            </>
          )}

        </aside>
      </div>
    </div>
  );
}
