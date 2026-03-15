'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Listing } from '@/lib/getListings';
import type { Category } from '@/lib/getCategories';
import type { ActionName } from '@/components/ActionIcon';
import { getActionLabel, ALL_ACTIONS } from '@/components/ActionIcon';
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

type AutocompleteResult = BusinessResult | ItemResult;

const MAX_EACH = 4;

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MapViewProps {
  listings: Listing[];
  categories: Category[];
  selectedId: string | null;
  onSelectListing: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  actionFilter: ActionName | null;
  onActionFilterChange: (action: ActionName | null) => void;
}

export function MapView({
  listings,
  categories,
  selectedId,
  onSelectListing,
  searchQuery,
  onSearchChange,
  actionFilter,
  onActionFilterChange,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const listingsByIdRef = useRef<Map<string, Listing>>(new Map());

  // Action filter dropdown
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const actionDropdownRef = useRef<HTMLDivElement>(null);

  // Autocomplete dropdown
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
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

    return [...businessResults, ...itemResults];
  }, [listings, categories, searchQuery]);

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

  // ─── Search input handler ────────────────────────────────────────────────────

  function handleSearchChange(value: string) {
    onSearchChange(value);
    setIsAutocompleteOpen(value.trim().length > 0);
  }

  // ─── Autocomplete selection handlers ────────────────────────────────────────

  function handleSelectBusiness(result: BusinessResult) {
    onSearchChange(result.name);
    onSelectListing(result.id);
    setIsAutocompleteOpen(false);
  }

  function handleSelectItem(result: ItemResult) {
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
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-98.4936, 29.4241], // San Antonio
        zoom: 11,
      });

      mapRef.current = map;

      resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(container);

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

          el.addEventListener('click', () => onSelectListing(listing.id));
          markersRef.current.set(listing.id, marker);
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

  // ─── Show/hide markers based on action filter ────────────────────────────────

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const listing = listingsByIdRef.current.get(id);
      const visible =
        !actionFilter || (listing?.fields.allActionNames.includes(actionFilter) ?? false);
      marker.getElement().classList.toggle(styles.markerHidden, !visible);
    });
  }, [actionFilter]);

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
        map.flyTo({ center: marker.getLngLat(), zoom: Math.max(map.getZoom(), 13), speed: 1.2 });
      }
    }
  }, [selectedId]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className={styles.root}>
      {/* Floating search bar */}
      <div className={styles.searchBar} ref={searchBarRef}>

        {/* "I want to" action filter dropdown */}
        <div className={styles.intentPillWrapper} ref={actionDropdownRef}>
          <button
            className={`${styles.intentPill}${actionFilter ? ` ${styles.intentPillActive}` : ''}`}
            type="button"
            aria-label="Select action type"
            aria-expanded={isActionDropdownOpen}
            onClick={() => setIsActionDropdownOpen((v) => !v)}
          >
            <span className={styles.intentInner}>
              {actionFilter ? getActionLabel(actionFilter) : 'I want to'}
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
              {ALL_ACTIONS.map((action) => (
                <button
                  key={action}
                  className={`${styles.dropdownItem}${actionFilter === action ? ` ${styles.dropdownItemActive}` : ''}`}
                  role="option"
                  aria-selected={actionFilter === action}
                  onClick={() => {
                    onActionFilterChange(action);
                    setIsActionDropdownOpen(false);
                  }}
                >
                  {getActionLabel(action)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search input */}
        <label className={styles.searchInput}>
          <i className="fa-regular fa-magnifying-glass" aria-hidden="true" />
          <input
            type="text"
            placeholder="Item or category..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim().length > 0 && suggestions.length > 0) {
                setIsAutocompleteOpen(true);
              }
            }}
          />
        </label>

        {/* Autocomplete dropdown — position: absolute relative to .searchBar */}
        {isAutocompleteOpen && suggestions.length > 0 && (
          <div className={styles.autocomplete} role="listbox" aria-label="Search suggestions">
            {suggestions.map((result, i) =>
              result.type === 'business' ? (
                <button
                  key={`business-${result.id}`}
                  className={styles.autocompleteItem}
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    // mousedown fires before blur; prevent input from losing focus oddly
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
        )}
      </div>
    </div>
  );
}
