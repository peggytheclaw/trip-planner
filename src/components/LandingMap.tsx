import { useEffect, useRef } from 'react';
import { DARK_MAP_TILE, DARK_MAP_ATTRIBUTION } from '../utils/mapUtils';

// Pre-set waypoints for an evocative global route
const WORLD_WAYPOINTS: [number, number][] = [
  [37.6213, -122.3790], // SFO
  [35.6895, 139.6917],  // Tokyo
  [48.8566, 2.3522],    // Paris
  [-33.8688, 151.2093], // Sydney
  [40.7128, -74.0060],  // NYC
  [37.6213, -122.3790], // back to SFO
];

export default function LandingMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import('leaflet').then((leafletModule) => {
      const L = leafletModule.default;
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      if (!containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
        attributionControl: false,
        minZoom: 2,
        maxZoom: 2,
      });

      L.tileLayer(DARK_MAP_TILE, {
        attribution: DARK_MAP_ATTRIBUTION,
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      // Draw glowing world route
      L.polyline(WORLD_WAYPOINTS, {
        color: '#10b981',
        weight: 8,
        opacity: 0.1,
      }).addTo(map);

      L.polyline(WORLD_WAYPOINTS, {
        color: '#10b981',
        weight: 2,
        opacity: 0.6,
        dashArray: '10, 6',
      }).addTo(map);

      // City markers
      const cities = [
        { coords: [37.6213, -122.3790] as [number, number], label: 'San Francisco' },
        { coords: [35.6895, 139.6917] as [number, number], label: 'Tokyo' },
        { coords: [48.8566, 2.3522] as [number, number], label: 'Paris' },
        { coords: [-33.8688, 151.2093] as [number, number], label: 'Sydney' },
        { coords: [40.7128, -74.0060] as [number, number], label: 'New York' },
      ];

      cities.forEach(({ coords }) => {
        const markerHtml = `
          <div style="
            width: 10px; height: 10px;
            background: #10b981;
            border: 2px solid rgba(255,255,255,0.7);
            border-radius: 50%;
            box-shadow: 0 0 12px #10b98166;
          "></div>
        `;
        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        L.marker(coords, { icon }).addTo(map);
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
