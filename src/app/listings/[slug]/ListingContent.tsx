import type { Listing } from '@/lib/getListings';
import { Pill } from '@/components/Pill';
import { ActionsBlock } from '@/components/ActionsBlock';
import { SystemsMapping } from '@/components/SystemsMapping';
import styles from './page.module.scss';
import { CopyEmailButton } from './CopyEmailButton';
import { ListingTabs } from './ListingTabs';
import { MobileBackButton } from './MobileBackButton';
import { BusinessHoursBlock } from './BusinessHoursBlock';

// ─── Tag color picker (deterministic, no mono/offWhite) ───────────────────────

const TAG_COLORS = ['blue', 'orange', 'merlot', 'fern', 'violet', 'spruce', 'mintChoc', 'redAdobe'] as const;

function tagColor(tag: string): typeof TAG_COLORS[number] {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[hash % TAG_COLORS.length];
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

// ─── Component ────────────────────────────────────────────────────────────────

interface ListingContentProps {
  listing: Listing;
  isModal?: boolean;
}

export function ListingContent({ listing, isModal }: ListingContentProps) {
  const f = listing.fields;
  const photo = f.listingPhoto[0] ?? null;

  const hasSocial = !!(f.instagramUrl1 || f.facebookUrl || f.linkedInUrl || f.tiktokHandle);
  const mapsUrl = f.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.address)}`
    : null;

  return (
    <>
      {/* ── Mobile / tablet layout (≤900px) ─────────────────────────── */}
      <div className={styles.mobileLayout}>
        {/* Scroll-aware sticky back bar — overlaps hero photo via negative margin */}
        {isModal && <MobileBackButton name={f.businessName} />}

        {/* Photo (full-bleed) */}
        <div className={styles.mobilePhotoWrapper}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={f.businessName}
              className={styles.mobilePhoto}
            />
          ) : (
            <div className={styles.mobilePhotoPlaceholder}>
              <i className="fa-regular fa-image" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Card: header + tabs */}
        <div className={styles.mobileCard}>
          <div className={styles.mobileCardHeader}>
            <div className={styles.nameAddress}>
              <h3 className={`hero-3 ${styles.businessName}`}>{f.businessName}</h3>
              {f.address && (
                <p className={`body-default-regular ${styles.address}`}>{f.address}</p>
              )}
            </div>
            {f.tags.length > 0 && (
              <div className={styles.pillRowHeader}>
                {f.tags.map((tag) => (
                  <Pill key={tag} label={tag} color={tagColor(tag)} size="small" />
                ))}
              </div>
            )}   
          </div>

          {/* Tab layout */}
          <ListingTabs fields={f} mapsUrl={mapsUrl} />
        </div>
      </div>

      {/* ── Desktop layout (>900px) ──────────────────────────────────── */}
      <div className={styles.desktopLayout}>
        <div className={styles.body}>
          {/* ── Main content ─────────────────────────────────────────── */}
          <main className={styles.main}>
            <div className={styles.mainInner}>

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

              {/* Header */}
              <div className={styles.header}>
                <div className={styles.nameAddress}>
                  <h1 className={`hero-3-strong ${styles.businessName}`}>{f.businessName}</h1>
                  {f.address && (
                    <p className={`body-default-regular ${styles.address}`}>{f.address}</p>
                  )}
                </div>
                {f.tags.length > 0 && (
                  <div className={styles.pillRowHeader}>
                    {f.tags.map((tag) => (
                      <Pill key={tag} label={tag} color={tagColor(tag)} size="small" />
                    ))}
                  </div>
                )}
                {f.businessDescription && (
                  <p className={`body-default-regular ${styles.description}`}>{f.businessDescription}</p>
                )}
              </div>

              {/* Actions */}
              <ActionsBlock fields={f} />

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

              {/* Systems Mapping */}
              <SystemsMapping fields={f} />

            </div>
          </main>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className={styles.sidebar}>

            {/* Quick links: Website + Directions */}
            <div className={styles.contactGrid}>
              {f.website && (
                <a href={f.website} target="_blank" rel="noopener noreferrer" className={styles.contactCard}>
                  <i className={`fa-solid fa-globe ${styles.contactCardIcon}`} aria-hidden="true" />
                  <span className={styles.contactCardLabel}>Website</span>
                </a>
              )}
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.contactCard} ${!f.website ? styles.contactCardFull : ''}`}
                >
                  <i className={`fa-solid fa-diamond-turn-right ${styles.contactCardIcon}`} aria-hidden="true" />
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

            {/* Contact: Phone + Email */}
            <div className={styles.contactSection}>
              <p className={styles.contactHeading}>Contact</p>
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

            <hr className={styles.sidebarDivider} />

            {/* Services */}
            <div className={styles.serviceOptions}>
              <p className={styles.serviceHeading}>Services</p>
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
            {f.hoursJson && (
              <>
                <hr className={styles.sidebarDivider} />
                <BusinessHoursBlock hoursJson={f.hoursJson} />
              </>
            )}

          </aside>
        </div>
      </div>
    </>
  );
}
