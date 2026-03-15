'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Listing } from '@/lib/getListings';
import type { ActionName } from '@/components/ActionIcon';
import { getActionLabel, ALL_ACTIONS } from '@/components/ActionIcon';
import styles from './MapView.module.scss';

interface MapViewProps {
  listings: Listing[];
  selectedId: string | null;
  onSelectListing: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  actionFilter: ActionName | null;
  onActionFilterChange: (action: ActionName | null) => void;
}

export function MapView({
  listings,
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Initialize map
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

  // Show/hide markers based on action filter
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const listing = listingsByIdRef.current.get(id);
      const visible =
        !actionFilter || (listing?.fields.allActionNames.includes(actionFilter) ?? false);
      marker.getElement().classList.toggle(styles.markerHidden, !visible);
    });
  }, [actionFilter]);

  // Highlight selected marker and fly to it
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

  return (
    <div ref={containerRef} className={styles.root}>
      {/* Floating search bar */}
      <div className={styles.searchBar}>
        {/* "I want to" action filter dropdown */}
        <div className={styles.intentPillWrapper} ref={dropdownRef}>
          <button
            className={`${styles.intentPill}${actionFilter ? ` ${styles.intentPillActive}` : ''}`}
            type="button"
            aria-label="Select action type"
            aria-expanded={isDropdownOpen}
            onClick={() => setIsDropdownOpen((v) => !v)}
          >
            <span className={styles.intentInner}>
              {actionFilter ? getActionLabel(actionFilter) : 'I want to'}
            </span>
            <i
              className={`fa-solid ${isDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}
              aria-hidden="true"
            />
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdown} role="listbox" aria-label="Filter by action">
              {actionFilter && (
                <button
                  className={styles.dropdownClear}
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    onActionFilterChange(null);
                    setIsDropdownOpen(false);
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
                    setIsDropdownOpen(false);
                  }}
                >
                  {getActionLabel(action)}
                </button>
              ))}
            </div>
          )}
        </div>

        <label className={styles.searchInput}>
          <i className="fa-regular fa-magnifying-glass" aria-hidden="true" />
          <input
            type="text"
            placeholder="Item or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
