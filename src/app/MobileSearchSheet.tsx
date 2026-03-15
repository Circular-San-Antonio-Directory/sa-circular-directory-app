'use client';

import { useEffect, useMemo, useState } from 'react';
import { ALL_ACTIONS, getActionLabel } from '@/components/ActionIcon';
import type { ActionName } from '@/components/ActionIcon';
import type { Listing } from '@/lib/getListings';
import type { Category } from '@/lib/getCategories';
import styles from './MobileSearchSheet.module.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (searchQuery: string, actionFilter: ActionName | null) => void;
  initialSearch: string;
  initialActionFilter: ActionName | null;
  listings: Listing[];
  categories: Category[];
}

export function MobileSearchSheet({
  isOpen,
  onClose,
  onApply,
  initialSearch,
  initialActionFilter,
  listings,
  categories,
}: Props) {
  const [localSearch, setLocalSearch] = useState(initialSearch);
  const [localActionFilter, setLocalActionFilter] = useState<ActionName | null>(initialActionFilter);

  // Sync local state when the sheet opens
  useEffect(() => {
    if (isOpen) {
      setLocalSearch(initialSearch);
      setLocalActionFilter(initialActionFilter);
    }
  }, [isOpen, initialSearch, initialActionFilter]);

  // Categories whose items match the current search query
  const matchedCategories = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    if (!q) return [];
    return categories.filter((cat) => cat.items.some((item) => item.includes(q)));
  }, [localSearch, categories]);

  // Live filtered count for the "Show Results" button
  const filteredCount = useMemo(() => {
    let result = listings;

    if (localSearch.trim()) {
      const q = localSearch.toLowerCase().trim();
      const matchedCategoryNames = new Set(
        categories
          .filter((cat) => cat.items.some((item) => item.includes(q)))
          .map((cat) => cat.category),
      );
      result = result.filter((l) => {
        const nameOrAddress =
          l.fields.businessName.toLowerCase().includes(q) ||
          l.fields.address.toLowerCase().includes(q);
        const categoryMatch = [
          ...l.fields.inputCategories,
          ...l.fields.outputCategories,
          ...l.fields.serviceCategories,
        ].some((cat) => matchedCategoryNames.has(cat));
        return nameOrAddress || categoryMatch;
      });
    }

    if (localActionFilter) {
      result = result.filter((l) => l.fields.allActionNames.includes(localActionFilter));
    }

    return result.length;
  }, [listings, categories, localSearch, localActionFilter]);

  function handleClearAll() {
    setLocalSearch('');
    setLocalActionFilter(null);
  }

  function handleShowResults() {
    onApply(localSearch, localActionFilter);
    onClose();
  }

  function toggleAction(action: ActionName) {
    setLocalActionFilter((prev) => (prev === action ? null : action));
  }

  const hasFilters = localSearch.trim().length > 0 || localActionFilter !== null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={`${styles.sheet} ${isOpen ? styles.sheetOpen : ''}`}
        role="dialog"
        aria-modal={isOpen}
        aria-label="Search and filter"
      >
        {/* Header */}
        <div className={styles.header}>
          <span className={`${styles.title} label-default-strong`}>Explore By</span>
          <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className={styles.content}>

          {/* Search section */}
          <div className={styles.section}>
            <span className={`${styles.sectionLabel} label-small`}>Item or category</span>
            <div className={styles.searchInputWrapper}>
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Item or category..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                autoFocus={isOpen}
              />
              {localSearch && (
                <button
                  className={styles.clearInput}
                  type="button"
                  onClick={() => setLocalSearch('')}
                  aria-label="Clear search"
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Matched category badges */}
            {matchedCategories.length > 0 && (
              <div className={styles.categoryBadges}>
                {matchedCategories.slice(0, 3).map((cat) => (
                  <span key={cat.category} className={styles.categoryBadge}>
                    {cat.faIcon && (
                      <i className={`fa-solid fa-${cat.faIcon}`} aria-hidden="true" />
                    )}
                    {cat.category}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action filter section */}
          <div className={styles.section}>
            <span className={`${styles.sectionLabel} label-small`}>I want to</span>
            <div className={styles.actionPills}>
              {ALL_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  className={`${styles.actionPill} ${localActionFilter === action ? styles.actionPillActive : ''}`}
                  onClick={() => toggleAction(action)}
                >
                  {getActionLabel(action)}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Sticky footer */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.clearAllBtn}
            onClick={handleClearAll}
            disabled={!hasFilters}
          >
            Clear All
          </button>
          <button
            type="button"
            className={styles.showResultsBtn}
            onClick={handleShowResults}
          >
            Show Results ({filteredCount})
          </button>
        </div>
      </div>
    </>
  );
}
