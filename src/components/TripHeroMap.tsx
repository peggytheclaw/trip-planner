import { useEffect, useRef } from 'react';
import { TripEvent } from '../types';
import { DARK_MAP_TILE, DARK_MAP_ATTRIBUTION } from '../utils/mapUtils';
import { EVENT_COLORS } from '../utils/itineraryUtils';

interface TripHeroMapProps {
  events: TripEvent[];
  height?: number;
}

export default function TripHeroMap({ events, height = 300 }: TripHeroMapProps) {
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
      const seenCoords = new Set<string>();

      eventsWithCoords.forEach((event) => {
        if (!event.lat || !event.lng) return;
        const key = `${event.lat.toFixed(3)},${event.lng.toFixed(3)}`;
        if (seenCoords.has(key)) return;
        seenCoords.add(key);

        coords.push([event.lat, event.lng]);
        const color = EVENT_COLORS[event.type] ?? '#10b981';

        const markerHtml = `
          <div style="
            width: 14px; height: 14px;
            background: ${color};
            border: 2px solid rgba(255,255,255,0.8);
            border-radius: 50%;
            box-shadow: 0 0 8px ${color}80;
          "></div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        L.marker([event.lat, event.lng], { icon })
          .bindTooltip(event.title, { permanent: false, direction: 'top' })
          .addTo(map);
      });

      // Draw glowing route line
      if (coords.length > 1) {
        // Shadow line (glow effect)
        L.polyline(coords, {
          color: '#10b981',
          weight: 6,
          opacity: 0.15,
        }).addTo(map);
        // Main line
        L.polyline(coords, {
          color: '#10b981',
          weight: 2,
          opacity: 0.8,
          dashArray: '8, 5',
        }).addTo(map);
      }

      if (coords.length === 1) {
        map.setView(coords[0], 12);
      } else if (coords.length > 1) {
        map.fitBounds(coords, { padding: [30, 30] });
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
      {/* Gradient fade at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '50%',
          background: 'linear-gradient(to bottom, transparent, #0a0a0a)',
        }}
      />
      {/* Side fades */}
      <div
        className="absolute inset-y-0 left-0 pointer-events-none w-8"
        style={{ background: 'linear-gradient(to right, #0a0a0a20, transparent)' }}
      />
      <div
        className="absolute inset-y-0 right-0 pointer-events-none w-8"
        style={{ background: 'linear-gradient(to left, #0a0a0a20, transparent)' }}
      />
    </div>
  );
}
