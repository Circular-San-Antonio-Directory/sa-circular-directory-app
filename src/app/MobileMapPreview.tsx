'use client';

import Link from 'next/link';
import { ActionIcon } from '@/components/ActionIcon';
import type { ActionName } from '@/components/ActionIcon';
import { Pill } from '@/components/Pill';
import type { PillColor } from '@/components/Pill';
import type { Listing } from '@/lib/getListings';
import { slugify } from '@/lib/slugify';
import styles from './MobileMapPreview.module.scss';

// ─── Preview action helpers (mirrored from DirectoryClient.tsx) ───────────────

const INPUT_ACTIONS  = new Set<ActionName>(['donate', 'sell', 'trade']);
const OUTPUT_ACTIONS = new Set<ActionName>(['buy', 'buyB2B', 'consign']);

function getPreviewActionContent(action: ActionName, f: Listing['fields']) {
  if (INPUT_ACTIONS.has(action))
    return { categories: f.inputCategories,  override: f.inputCategoryOverride  };
  if (OUTPUT_ACTIONS.has(action))
    return { categories: f.outputCategories, override: f.outputCategoryOverride };
  if (action === 'volunteer')
    return { categories: [],                  override: ''                        };
  return   { categories: f.serviceCategories, override: f.serviceCategoryOverride };
}

const TAG_COLORS: PillColor[] = ['blue', 'orange', 'merlot', 'fern', 'violet', 'spruce', 'mintChoc', 'redAdobe'];

function tagColor(tag: string): PillColor {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MobileMapPreviewProps {
  listing: Listing | null;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MobileMapPreview({ listing, onClose }: MobileMapPreviewProps) {
  const hasTags = listing ? listing.fields.tags.length > 0 : false;
  const href = listing ? `/listings/${slugify(listing.fields.businessName)}` : '#';

  return (
    <Link
      href={href}
      className={`${styles.card}${listing ? ` ${styles.visible}` : ''}`}
      aria-hidden={!listing}
      onClick={onClose}
    >

      {/* Header: business name + close button */}
      <div className={styles.header}>
        <p className={styles.title}>{listing?.fields.businessName ?? ''}</p>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
          aria-label="Close preview"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </div>

      {/* Tags — only rendered when listing has tags */}
      {hasTags && (
        <div className={styles.tags}>
          {listing!.fields.tags.map((tag) => (
            <Pill key={tag} label={tag} color={tagColor(tag)} size="small" />
          ))}
        </div>
      )}

      {/* Divider between tags/header and actions */}
      <hr className={styles.divider} />

      {/* Action rows */}
      {listing && (
        <div className={styles.actions}>
          {listing.fields.allActionNames.map((action, i) => {
            const { categories: cats, override } = getPreviewActionContent(action, listing.fields);
            const categoryText = override || cats.join(', ');
            return (
              <div key={action}>
                {i > 0 && <hr className={styles.actionDivider} />}
                <div className={styles.actionRow}>
                  <div className={styles.actionLeft}>
                    <ActionIcon action={action} variant="icon-with-label" />
                  </div>
                  {categoryText && (
                    <p className={styles.actionCategories}>{categoryText}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA — visual affordance only; the outer Link handles navigation */}
      {listing && (
        <div className={styles.cta}>
          <span className={styles.ctaLabel}>View Full Details</span>
          <i className="fa-solid fa-arrow-right-long" aria-hidden="true" />
        </div>
      )}

    </Link>
  );
}
