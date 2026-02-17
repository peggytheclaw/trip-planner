import { useEffect, useRef } from 'react';
import { TripEvent } from '../types';
import { DARK_MAP_TILE, DARK_MAP_ATTRIBUTION } from '../utils/mapUtils';
import { EVENT_COLORS } from '../utils/itineraryUtils';

interface DayMapProps {
  events: TripEvent[];
  height?: number;
}

export default function DayMap({ events, height = 200 }: DayMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const eventsWithCoords = events.filter(e => e.lat && e.lng);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || eventsWithCoords.length === 0) return;

    import('leaflet').then((leafletModule) => {
      const L = leafletModule.default;

      delete (L.Icon.Default.prototype as any)._getIconUrl;

      if (!containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
        attributionControl: false,
      });

      L.tileLayer(DARK_MAP_TILE, {
        attribution: DARK_MAP_ATTRIBUTION,
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      const coords: [number, number][] = [];

      eventsWithCoords.forEach((event, idx) => {
        if (!event.lat || !event.lng) return;
        const color = EVENT_COLORS[event.type] ?? '#10b981';
        coords.push([event.lat, event.lng]);

        // Numbered pin
        const markerHtml = `
          <div style="
            width: 28px; height: 28px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 11px; font-weight: 700; color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.6);
          ">${idx + 1}</div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([event.lat, event.lng], { icon })
          .bindTooltip(event.title, { permanent: false, direction: 'top' })
          .addTo(map);
      });

      // Draw route line
      if (coords.length > 1) {
        L.polyline(coords, {
          color: '#10b981',
          weight: 2,
          opacity: 0.7,
          dashArray: '6, 4',
        }).addTo(map);
      }

      // Fit bounds to all markers
      if (coords.length === 1) {
        map.setView(coords[0], 14);
      } else if (coords.length > 1) {
        map.fitBounds(coords, { padding: [20, 20] });
      }

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [eventsWithCoords.length]);

  if (eventsWithCoords.length === 0) return null;

  return (
    <div className="relative overflow-hidden" style={{ height }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 60%, rgba(10,10,10,0.4) 100%)',
        }}
      />
    </div>
  );
}
