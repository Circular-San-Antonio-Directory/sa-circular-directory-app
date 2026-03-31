'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_ACTIONS, getActionLabel } from '@/components/ActionIcon';
import { getAvailableActions } from '@/lib/getAvailableActions';
import { filterListings } from '@/lib/filterListings';
import type { ActionName } from '@/components/ActionIcon';
import type { Listing } from '@/lib/getListings';
import type { Category } from '@/lib/getCategories';
import styles from './MobileSearchSheet.module.scss';

// ─── Autocomplete types ───────────────────────────────────────────────────────

type BusinessResult = {
  type: 'business';
  id: string;
  name: string;
  address: string;
};

type ItemResult = {
  type: 'item';
  item: string;
  category: string;
  faIcon: string | null;
};

type AutocompleteResult = BusinessResult | ItemResult;

const MAX_EACH = 4;

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Props ────────────────────────────────────────────────────────────────────

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [localSearch, setLocalSearch] = useState(initialSearch);
  const [localActionFilter, setLocalActionFilter] = useState<ActionName | null>(initialActionFilter);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  // Set only when the user explicitly selects an item result from autocomplete
  const [selectedCategory, setSelectedCategory] = useState<{ category: string; faIcon: string | null } | null>(null);

  // Sync local state when the sheet opens and focus the search input
  useEffect(() => {
    if (isOpen) {
      setLocalSearch(initialSearch);
      setLocalActionFilter(initialActionFilter);
      setSelectedCategory(null);
      setIsAutocompleteOpen(false);
      // Delay focus slightly so the sheet slide-in animation has started
      // before the mobile keyboard appears
      const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialSearch, initialActionFilter]);

  // ─── Autocomplete suggestions ─────────────────────────────────────────────

  const suggestions = useMemo((): AutocompleteResult[] => {
    const q = localSearch.trim().toLowerCase();
    if (q.length === 0) return [];

    const businessResults: BusinessResult[] = listings
      .filter((l) => l.fields.businessName.toLowerCase().includes(q))
      .slice(0, MAX_EACH)
      .map((l) => ({
        type: 'business',
        id: l.id,
        name: l.fields.businessName,
        address: l.fields.address,
      }));

    const seenItems = new Set<string>();
    const itemResults: ItemResult[] = [];
    for (const cat of categories) {
      if (itemResults.length >= MAX_EACH) break;
      for (const item of cat.items) {
        if (itemResults.length >= MAX_EACH) break;
        if (item.includes(q) && !seenItems.has(item)) {
          seenItems.add(item);
          itemResults.push({
            type: 'item',
            item: capitalize(item),
            category: cat.category,
            faIcon: cat.faIcon,
          });
        }
      }
    }

    return [...businessResults, ...itemResults].slice(0, 5);
  }, [listings, categories, localSearch]);

  // ─── Live filtered count ──────────────────────────────────────────────────

  const filteredCount = useMemo(
    () => filterListings(listings, categories, localSearch, localActionFilter).length,
    [listings, categories, localSearch, localActionFilter],
  );

  // ─── Available actions (based on search-filtered listings only) ──────────
  // Excludes the action filter so users can still see which actions are possible
  // for the current search query before committing to a filter.

  const availableActions = useMemo(
    () => getAvailableActions(listings, categories, localSearch),
    [listings, categories, localSearch],
  );

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handleLocalSearchChange(value: string) {
    setLocalSearch(value);
    setSelectedCategory(null); // badge only sticks after an explicit selection
    setIsAutocompleteOpen(value.trim().length > 0);
  }

  function handleSelectBusiness(result: BusinessResult) {
    setLocalSearch(result.name);
    setSelectedCategory(null);
    setIsAutocompleteOpen(false);
  }

  function handleSelectItem(result: ItemResult) {
    setLocalSearch(result.item);
    setSelectedCategory({ category: result.category, faIcon: result.faIcon });
    setIsAutocompleteOpen(false);
  }

  function handleClearSearch() {
    setLocalSearch('');
    setSelectedCategory(null);
    setIsAutocompleteOpen(false);
  }

  function handleClearAll() {
    setLocalSearch('');
    setLocalActionFilter(null);
    setSelectedCategory(null);
    setIsAutocompleteOpen(false);
  }

  function handleShowResults() {
    onApply(localSearch, localActionFilter);
    onClose();
  }

  function toggleAction(action: ActionName) {
    setLocalActionFilter((prev) => (prev === action ? null : action));
  }

  const hasFilters = localSearch.trim().length > 0 || localActionFilter !== null;
  const showAutocomplete = isAutocompleteOpen && suggestions.length > 0;

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
                ref={searchInputRef}
                type="text"
                className={styles.searchInput}
                placeholder="Item or category..."
                value={localSearch}
                onChange={(e) => handleLocalSearchChange(e.target.value)}
              />
              {localSearch && (
                <button
                  className={styles.clearInput}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleClearSearch(); }}
                  aria-label="Clear search"
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Autocomplete dropdown — inline, flows in the scroll area */}
            {showAutocomplete && (
              <div className={styles.autocomplete} role="listbox" aria-label="Search suggestions">
                {suggestions.map((result, i) =>
                  result.type === 'business' ? (
                    <button
                      key={`b-${result.id}`}
                      className={styles.autocompleteItem}
                      role="option"
                      aria-selected={false}
                      onMouseDown={(e) => { e.preventDefault(); handleSelectBusiness(result); }}
                    >
                      <span className={styles.autocompleteIcon}>
                        <i className="fa-solid fa-location-dot" aria-hidden="true" />
                      </span>
                      <span className={styles.autocompleteText}>
                        <span className={styles.autocompleteMain}>{result.name}</span>
                        <span className={styles.autocompleteSub}>{result.address}</span>
                      </span>
                    </button>
                  ) : (
                    <button
                      key={`i-${i}-${result.item}`}
                      className={styles.autocompleteItem}
                      role="option"
                      aria-selected={false}
                      onMouseDown={(e) => { e.preventDefault(); handleSelectItem(result); }}
                    >
                      <span className={styles.autocompleteIcon}>
                        {result.faIcon
                          ? <i className={`fa-solid fa-${result.faIcon}`} aria-hidden="true" />
                          : <i className="fa-solid fa-tag" aria-hidden="true" />
                        }
                      </span>
                      <span className={styles.autocompleteText}>
                        <span className={styles.autocompleteMain}>{result.item}</span>
                        <span className={styles.autocompleteSub}>{result.category}</span>
                      </span>
                    </button>
                  ),
                )}
              </div>
            )}

            {/* Category badge — only shown after an item is explicitly selected */}
            {selectedCategory && (
              <div className={styles.categoryBadges}>
                <span className={styles.categoryBadge}>
                  {selectedCategory.faIcon && (
                    <i className={`fa-solid fa-${selectedCategory.faIcon}`} aria-hidden="true" />
                  )}
                  {selectedCategory.category}
                </span>
              </div>
            )}
          </div>

          {/* Action filter section */}
          <div className={styles.section}>
            <span className={`${styles.sectionLabel} label-small`}>I want to</span>
            <div className={styles.actionPills}>
              {ALL_ACTIONS.filter(
                // Always keep the active filter visible; otherwise only show
                // actions present in the current search-filtered listings.
                (action) => action === localActionFilter || availableActions.has(action),
              ).map((action) => (
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
