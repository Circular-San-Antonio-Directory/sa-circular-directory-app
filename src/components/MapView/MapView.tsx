'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Listing } from '@/lib/getListings';
import styles from './MapView.module.scss';

interface MapViewProps {
  listings: Listing[];
  selectedId: string | null;
  onSelectListing: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function MapView({ listings, selectedId, onSelectListing, searchQuery, onSearchChange }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

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
        <button className={styles.intentPill} type="button" aria-label="Select action type">
          <span className={styles.intentInner}>I want to</span>
          <i className="fa-solid fa-chevron-down" aria-hidden="true" />
        </button>

        <label className={styles.searchInput}>
          <i className="fa-regular fa-magnifying-glass" aria-hidden="true" />
          <input
            type="text"
            placeholder="Item or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>

        <button className={styles.filtersButton} type="button">
          <i className="fa-regular fa-sliders" aria-hidden="true" />
          <span>Filters</span>
        </button>
      </div>
    </div>
  );
}

