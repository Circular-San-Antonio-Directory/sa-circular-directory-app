'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { getAvailableActions } from '@/lib/getAvailableActions';
import { useActionsConfig } from '@/components/ActionIcon';
import type { ActionName } from '@/components/ActionIcon';
import type { Listing } from '@/lib/getListings';
import type { Category } from '@/lib/getCategories';
import styles from './DirectorySearch.module.scss';

// ─── Autocomplete types ───────────────────────────────────────────────────────

type BusinessResult = { type: 'business'; id: string; name: string; address: string };
type ItemResult     = { type: 'item';     item: string; category: string; faIcon: string | null };
type OverrideResult = { type: 'override'; item: string };
type AutocompleteResult = BusinessResult | ItemResult | OverrideResult;

const MAX_EACH = 4;

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DirectorySearchProps {
  listings: Listing[];
  categories: Category[];
}

export function DirectorySearch({ listings, categories }: DirectorySearchProps) {
  const router = useRouter();
  const actionsConfig = useActionsConfig();

  const [searchQuery, setSearchQuery]       = useState('');
  const [actionFilter, setActionFilter]     = useState<ActionName | null>(null);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // ─── Autocomplete suggestions ───────────────────────────────────────────────

  const suggestions = useMemo((): AutocompleteResult[] => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length === 0) return [];

    const businessResults: BusinessResult[] = listings
      .filter((l) => l.fields.businessName.toLowerCase().includes(q))
      .slice(0, MAX_EACH)
      .map((l) => ({ type: 'business', id: l.id, name: l.fields.businessName, address: l.fields.address }));

    const seenOverrides = new Set<string>();
    const overrideResults: OverrideResult[] = [];
    for (const l of listings) {
      if (overrideResults.length >= MAX_EACH) break;
      const fields = [l.fields.inputCategoryOverride, l.fields.outputCategoryOverride, l.fields.serviceCategoryOverride];
      for (const field of fields) {
        if (!field) continue;
        for (const term of field.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)) {
          if (term.includes(q) && !seenOverrides.has(term)) {
            seenOverrides.add(term);
            overrideResults.push({ type: 'override', item: capitalize(term) });
            if (overrideResults.length >= MAX_EACH) break;
          }
        }
        if (overrideResults.length >= MAX_EACH) break;
      }
    }

    const seenItems = new Set<string>();
    const itemResults: ItemResult[] = [];
    for (const cat of categories) {
      if (itemResults.length >= MAX_EACH) break;
      for (const item of cat.items) {
        if (itemResults.length >= MAX_EACH) break;
        if (item.includes(q) && !seenItems.has(item)) {
          seenItems.add(item);
          itemResults.push({ type: 'item', item: capitalize(item), category: cat.category, faIcon: cat.faIcon });
        }
      }
    }

    return [...businessResults, ...overrideResults, ...itemResults].slice(0, 5);
  }, [listings, categories, searchQuery]);

  // ─── Available actions ───────────────────────────────────────────────────────

  const availableActions = useMemo(
    () => getAvailableActions(listings, categories, searchQuery),
    [listings, categories, searchQuery],
  );

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setIsAutocompleteOpen(value.trim().length > 0);
  }

  function handleClearSearch() {
    setSearchQuery('');
    setIsAutocompleteOpen(false);
  }

  function handleSelectSuggestion(item: string) {
    setSearchQuery(item);
    setIsAutocompleteOpen(false);
  }

  function toggleAction(action: ActionName) {
    setActionFilter((prev) => (prev === action ? null : action));
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (actionFilter) params.set('action', actionFilter);
    router.push(params.toString() ? `/?${params.toString()}` : '/');
  }

  const showAutocomplete = isAutocompleteOpen && suggestions.length > 0;

  return (
    <div className={styles.widget}>
      {/* "I want to" action selector */}
      <div className={styles.field}>
        <span className={`${styles.fieldLabel} label-small`}>I want to</span>
        <div className={styles.actionPills}>
          {actionsConfig
            .filter(({ actionName }) => actionName === actionFilter || availableActions.has(actionName))
            .map(({ actionName, label }) => (
              <button
                key={actionName}
                type="button"
                className={`${styles.actionPill}${actionFilter === actionName ? ` ${styles.actionPillActive}` : ''}`}
                onClick={() => toggleAction(actionName)}
              >
                {label}
              </button>
            ))}
        </div>
      </div>

      {/* Search input */}
      <div className={styles.field}>
        <span className={`${styles.fieldLabel} label-small`}>Item or category</span>
        <div className={styles.searchInputWrapper} ref={searchWrapperRef}>
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Item or category..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchQuery.trim().length > 0 && setIsAutocompleteOpen(true)}
            onBlur={() => setTimeout(() => setIsAutocompleteOpen(false), 150)}
          />
          {searchQuery && (
            <button
              className={styles.clearInput}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleClearSearch(); }}
              aria-label="Clear search"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          )}

          {showAutocomplete && (
            <div className={styles.autocomplete} role="listbox" aria-label="Search suggestions">
              {suggestions.map((result, i) =>
                result.type === 'business' ? (
                  <button
                    key={`b-${result.id}`}
                    className={styles.autocompleteItem}
                    role="option"
                    aria-selected={false}
                    onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(result.name); }}
                  >
                    <span className={styles.autocompleteIcon}>
                      <i className="fa-solid fa-location-dot" aria-hidden="true" />
                    </span>
                    <span className={styles.autocompleteText}>
                      <span className={styles.autocompleteMain}>{result.name}</span>
                      <span className={styles.autocompleteSub}>{result.address}</span>
                    </span>
                  </button>
                ) : result.type === 'override' ? (
                  <button
                    key={`o-${i}-${result.item}`}
                    className={styles.autocompleteItem}
                    role="option"
                    aria-selected={false}
                    onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(result.item); }}
                  >
                    <span className={styles.autocompleteIcon}>
                      <i className="fa-solid fa-grip-vertical" aria-hidden="true" />
                    </span>
                    <span className={styles.autocompleteText}>
                      <span className={styles.autocompleteMain}>{result.item}</span>
                      <span className={styles.autocompleteSub}>Item</span>
                    </span>
                  </button>
                ) : (
                  <button
                    key={`i-${i}-${result.item}`}
                    className={styles.autocompleteItem}
                    role="option"
                    aria-selected={false}
                    onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(result.item); }}
                  >
                    <span className={styles.autocompleteIcon}>
                      {result.faIcon
                        ? <i className={`fa-solid fa-${result.faIcon}`} aria-hidden="true" />
                        : <i className="fa-solid fa-tag" aria-hidden="true" />}
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
        </div>
      </div>

      {/* Search button */}
      <Button variant="primary" onClick={handleSearch} className={styles.searchBtn}>
        Explore the Map
      </Button>
    </div>
  );
}
