'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Listing } from '@/lib/getListings';
import type { Category } from '@/lib/getCategories';
import type { ActionName } from '@/components/ActionIcon';
import { getActionLabel, useActionsConfig } from '@/components/ActionIcon';
import { getAvailableActions } from '@/lib/getAvailableActions';
import styles from './MapView.module.scss';

// ─── Autocomplete types ───────────────────────────────────────────────────────

type BusinessResult = {
  type: 'business';
  id: string;
  name: string;
  address: string;
};

type ItemResult = {
  type: 'item';
  item: string;       // display-cased item name
  category: string;
  faIcon: string | null;
};

type OverrideResult = {
  type: 'override';
  item: string;       // display-cased override term
};

type AutocompleteResult = BusinessResult | ItemResult | OverrideResult;

const MAX_EACH = 4;
const MAX_RECENTS = 5;

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function resultKey(result: AutocompleteResult): string {
  if (result.type === 'business') return `b:${result.id}`;
  if (result.type === 'override') return `o:${result.item}`;
  return `i:${result.item}`;
}

// Marker size scales inversely with zoom: more zoomed out → larger, zoomed in → smaller.
// Range: 24px at zoom 8 → 6px at zoom 17+.
function getMarkerSize(zoom: number): number {
  return Math.round(Math.max(23, Math.min(28, 40 - zoom * 2)));
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MapViewProps {
  listings: Listing[];
  filteredListings: Listing[];
  categories: Category[];
  selectedId: string | null;
  onSelectListing: (id: string) => void;
  onMapBackgroundClick?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  actionFilter: ActionName | null;
  onActionFilterChange: (action: ActionName | null) => void;
  onMobileSearchOpen?: () => void;
}

export function MapView({
  listings,
  filteredListings,
  categories,
  selectedId,
  onSelectListing,
  onMapBackgroundClick,
  searchQuery,
  onSearchChange,
  actionFilter,
  onActionFilterChange,
  onMobileSearchOpen,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  // Tracks whether the current map click originated from a marker element so the
  // background-click handler can skip it (marker click events bubble to the canvas
  // container and would otherwise immediately clear the preview state).
  const markerClickedRef = useRef(false);
  const listingsByIdRef = useRef<Map<string, Listing>>(new Map());

  const actionsConfig = useActionsConfig();

  // Action filter dropdown
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const actionDropdownRef = useRef<HTMLDivElement>(null);

  // Autocomplete dropdown
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<AutocompleteResult[]>([]);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // ─── Autocomplete suggestions ───────────────────────────────────────────────

  const suggestions = useMemo((): AutocompleteResult[] => {
    const q = searchQuery.trim().toLowerCase();
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

    const seenOverrides = new Set<string>();
    const overrideResults: OverrideResult[] = [];
    for (const l of listings) {
      if (overrideResults.length >= MAX_EACH) break;
      const fields = [
        l.fields.inputCategoryOverride,
        l.fields.outputCategoryOverride,
        l.fields.serviceCategoryOverride,
      ];
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
          itemResults.push({
            type: 'item',
            item: capitalize(item),
            category: cat.category,
            faIcon: cat.faIcon,
          });
        }
      }
    }

    return [...businessResults, ...overrideResults, ...itemResults];
  }, [listings, categories, searchQuery]);

  // Available actions — restricted to those present in search-filtered listings.
  // The currently active filter is always included so it stays visible in the dropdown.
  const availableActions = useMemo(
    () => getAvailableActions(listings, categories, searchQuery),
    [listings, categories, searchQuery],
  );

  // Default suggestions shown when focused with an empty query and no recents
  const defaultSuggestions = useMemo((): AutocompleteResult[] => {
    const businessDefaults: BusinessResult[] = listings.slice(0, 2).map((l) => ({
      type: 'business',
      id: l.id,
      name: l.fields.businessName,
      address: l.fields.address,
    }));

    const itemDefaults: ItemResult[] = [];
    for (const cat of categories) {
      if (itemDefaults.length >= 2) break;
      if (cat.items.length > 0) {
        itemDefaults.push({
          type: 'item',
          item: capitalize(cat.items[0]),
          category: cat.category,
          faIcon: cat.faIcon,
        });
      }
    }

    return [...businessDefaults, ...itemDefaults];
  }, [listings, categories]);

  // ─── Click-outside: action filter dropdown ──────────────────────────────────

  useEffect(() => {
    if (!isActionDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(e.target as Node)) {
        setIsActionDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActionDropdownOpen]);

  // ─── Click-outside: autocomplete ────────────────────────────────────────────

  useEffect(() => {
    if (!isAutocompleteOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
        setIsAutocompleteOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAutocompleteOpen]);

  // ─── Recent searches ─────────────────────────────────────────────────────────

  function addToRecents(result: AutocompleteResult) {
    setRecentSearches((prev) => {
      const key = resultKey(result);
      const deduped = prev.filter((r) => resultKey(r) !== key);
      return [result, ...deduped].slice(0, MAX_RECENTS);
    });
  }

  // ─── Search input handler ────────────────────────────────────────────────────

  function handleSearchChange(value: string) {
    onSearchChange(value);
    setIsAutocompleteOpen(true);
  }

  // ─── Autocomplete selection handlers ────────────────────────────────────────

  function handleSelectBusiness(result: BusinessResult) {
    addToRecents(result);
    onSearchChange(result.name);
    onSelectListing(result.id);
    setIsAutocompleteOpen(false);
  }

  function handleSelectItem(result: ItemResult | OverrideResult) {
    addToRecents(result);
    onSearchChange(result.item);
    setIsAutocompleteOpen(false);
  }

  // ─── Map init ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error('[MapView] NEXT_PUBLIC_MAPBOX_TOKEN is not set');
      return;
    }
    mapboxgl.accessToken = token;

    const container = containerRef.current;
    let map: mapboxgl.Map;
    let resizeObserver: ResizeObserver;

    // Defer init by one animation frame so CSS has settled and the container
    // has its correct pixel dimensions before Mapbox reads offsetWidth/offsetHeight.
    const rafId = requestAnimationFrame(() => {
      map = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/circular-sa/cmnqjwsot002101s7b867angr',
        center: [-98.4936, 29.4241], // San Antonio
        zoom: 11,
      });

      mapRef.current = map;

      resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(container);

      function applyMarkerSizes(zoom: number) {
        const size = getMarkerSize(zoom);
        markersRef.current.forEach((marker) => {
          const el = marker.getElement();
          const isSelected = el.classList.contains(styles.markerSelected);
          const finalSize = isSelected ? Math.round(size * 1.2) : size;
          el.style.width = `${finalSize}px`;
          el.style.height = `${finalSize}px`;
        });
      }

      map.on('zoom', () => applyMarkerSizes(map.getZoom()));

      map.on('load', () => {
        map.resize();
        listings.forEach((listing) => {
          listingsByIdRef.current.set(listing.id, listing);

          const { latitude, longitude } = listing.fields;
          if (latitude == null || longitude == null) return;

          const el = document.createElement('div');
          el.className = styles.marker;
          el.dataset.id = listing.id;

          const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
            .setLngLat([longitude, latitude])
            .addTo(map);

          el.addEventListener('click', () => {
            markerClickedRef.current = true;
            onSelectListing(listing.id);
          });
          markersRef.current.set(listing.id, marker);
        });

        // Set initial sizes once all markers exist
        applyMarkerSizes(map.getZoom());

        // Collapse preview when user clicks map background (not a marker).
        // Marker clicks bubble up to the canvas container and also trigger this
        // event, so we guard with the ref flag set in the marker click handler.
        map.on('click', () => {
          if (markerClickedRef.current) {
            markerClickedRef.current = false;
            return;
          }
          onMapBackgroundClick?.();
        });
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Show/hide markers based on filtered listings (search + action filter) ───
  // filteredListings is the single source of truth from DirectoryClient — this
  // replaces separate effects for search and actionFilter.

  useEffect(() => {
    const visibleIds = new Set(filteredListings.map((l) => l.id));
    markersRef.current.forEach((marker, id) => {
      marker.getElement().classList.toggle(styles.markerHidden, !visibleIds.has(id));
    });
  }, [filteredListings]);

  // ─── Highlight selected marker and fly to it ─────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      el.classList.toggle(styles.markerSelected, id === selectedId);
    });

    if (selectedId && map) {
      const marker = markersRef.current.get(selectedId);
      if (marker) {
        map.flyTo({ center: marker.getLngLat(), zoom: Math.max(map.getZoom(), 14), speed: 1.1 });
      }
    }
  }, [selectedId]);

  // ─── Intent pill color vars ───────────────────────────────────────────────────
  // Use the selected action's colorway at fixed tones; fall back to mono when
  // nothing is selected. Applied as CSS custom properties on the button element.

  const pillColorway = actionFilter
    ? (actionsConfig.find((a) => a.actionName === actionFilter)?.colorway ?? 'mono')
    : 'mono';

  const pillVars = {
    '--pill-700': `var(--${pillColorway}-700)`, // outer pill background
    '--pill-300': `var(--${pillColorway}-300)`, // inner text-area background
    '--pill-100': `var(--${pillColorway}-100)`, // caret icon
    '--pill-900': `var(--${pillColorway}-900)`, // text on light surface
  } as React.CSSProperties;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className={styles.root}>
      {/* Floating search bar */}
      <div className={styles.searchBar} ref={searchBarRef}>

        {/* "I want to" action filter dropdown */}
        <div className={styles.intentPillWrapper} ref={actionDropdownRef}>
          <button
            className={styles.intentPill}
            style={pillVars}
            type="button"
            aria-label="Select action type"
            aria-expanded={isActionDropdownOpen}
            onClick={() => {
              setIsActionDropdownOpen((v) => !v);
              setIsAutocompleteOpen(false);
            }}
          >
            <span className={styles.intentInner}>
              {actionFilter ? getActionLabel(actionFilter, actionsConfig) : 'I want to'}
            </span>
            <i
              className={`fa-solid ${isActionDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}
              aria-hidden="true"
            />
          </button>

          {isActionDropdownOpen && (
            <div className={styles.dropdown} role="listbox" aria-label="Filter by action">
              {actionFilter && (
                <button
                  className={styles.dropdownClear}
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    onActionFilterChange(null);
                    setIsActionDropdownOpen(false);
                  }}
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                  Clear filter
                </button>
              )}
              {actionsConfig
                .filter(
                  // Always keep the active filter visible; otherwise only show
                  // actions present in the current search-filtered listings.
                  ({ actionName }) => actionName === actionFilter || availableActions.has(actionName),
                )
                .map(({ actionName, label }) => (
                  <button
                    key={actionName}
                    className={`${styles.dropdownItem}${actionFilter === actionName ? ` ${styles.dropdownItemActive}` : ''}`}
                    role="option"
                    aria-selected={actionFilter === actionName}
                    onClick={() => {
                      onActionFilterChange(actionName);
                      setIsActionDropdownOpen(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Search input */}
        <label className={`${styles.searchInput}${actionFilter ? ` ${styles.searchInputWithAction}` : ''}`}>
          {/* Magnifying glass — hidden on mobile when action filter active (Figma: no icon in that state) */}
          <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`} aria-hidden="true" />
          {/* Content column — stacks action label above input on mobile when filter is active */}
          <span className={styles.searchContent}>
            {actionFilter && (
              <span
                className={styles.mobileActionLabel}
                style={{ color: `var(--${pillColorway}-700)` }}
              >
                {getActionLabel(actionFilter, actionsConfig)}
              </span>
            )}
            <input
              type="text"
              placeholder="Item or category..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={(e) => {
                if (onMobileSearchOpen && window.innerWidth < 1024) {
                  e.currentTarget.blur();
                  onMobileSearchOpen();
                } else {
                  setIsAutocompleteOpen(true);
                }
              }}
            />
          </span>
          {/* X button — only visible when there is text in the search input */}
          {searchQuery && (
            <button
              className={styles.clearInput}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSearchChange('');
                setIsAutocompleteOpen(false);
              }}
              aria-label="Clear search"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          )}
        </label>

        {/* Autocomplete dropdown — position: absolute relative to .searchBar */}
        {(() => {
          const isEmpty = searchQuery.trim().length === 0;
          const displayResults = isEmpty
            ? (recentSearches.length > 0 ? recentSearches : defaultSuggestions)
            : suggestions;
          const sectionLabel = isEmpty
            ? (recentSearches.length > 0 ? 'Recent' : 'Suggestions')
            : null;

          if (!isAutocompleteOpen || displayResults.length === 0) return null;

          return (
            <div className={styles.autocomplete} role="listbox" aria-label="Search suggestions">
              {sectionLabel && (
                <div className={styles.autocompleteSectionLabel}>{sectionLabel}</div>
              )}
              {displayResults.map((result, i) =>
                result.type === 'business' ? (
                  <button
                    key={`business-${result.id}`}
                    className={styles.autocompleteItem}
                    role="option"
                    aria-selected={false}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectBusiness(result);
                    }}
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
                    key={`override-${i}-${result.item}`}
                    className={styles.autocompleteItem}
                    role="option"
                    aria-selected={false}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectItem(result);
                    }}
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
                    key={`item-${i}-${result.item}`}
                    className={styles.autocompleteItem}
                    role="option"
                    aria-selected={false}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectItem(result);
                    }}
                  >
                    <span className={styles.autocompleteIcon}>
                      {result.faIcon ? (
                        <i className={`fa-solid fa-${result.faIcon}`} aria-hidden="true" />
                      ) : (
                        <i className="fa-solid fa-tag" aria-hidden="true" />
                      )}
                    </span>
                    <span className={styles.autocompleteText}>
                      <span className={styles.autocompleteMain}>{result.item}</span>
                      <span className={styles.autocompleteSub}>{result.category}</span>
                    </span>
                  </button>
                ),
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
