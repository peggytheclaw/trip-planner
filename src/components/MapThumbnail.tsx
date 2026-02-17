import { useEffect, useRef } from 'react';
import { DARK_MAP_TILE, DARK_MAP_ATTRIBUTION } from '../utils/mapUtils';

interface MapThumbnailProps {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  height?: number;
  zoom?: number;
}

export default function MapThumbnail({ lat, lng, label, color = '#10b981', height = 150, zoom = 15 }: MapThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let L: any;
    import('leaflet').then((leafletModule) => {
      L = leafletModule.default;

      // Fix Leaflet default icon issue with bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom,
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

      // Custom colored marker
      const markerHtml = `
        <div style="
          width: 24px; height: 24px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        "></div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      L.marker([lat, lng], { icon }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, color, zoom]);

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ height }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {label && (
        <div className="absolute bottom-2 left-2 right-2 z-[1000]">
          <div className="bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md truncate">
            📍 {label}
          </div>
        </div>
      )}
    </div>
  );
}
