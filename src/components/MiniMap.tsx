import { useEffect, useRef } from 'react';

interface MiniMapProps {
  lat: number;
  lng: number;
  label?: string;
  zoom?: number;
  height?: number;
  className?: string;
}

const DARK_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION = '©<a href="https://www.openstreetmap.org/copyright">OSM</a> ©<a href="https://carto.com/">CARTO</a>';

export default function MiniMap({ lat, lng, label, zoom = 14, height = 120, className = '' }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let L: any;
    import('leaflet').then(leaflet => {
      L = leaflet.default;
      // Fix default icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!, {
        center: [lat, lng],
        zoom,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        attributionControl: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      });

      L.tileLayer(DARK_TILE, {
        attribution: ATTRIBUTION,
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Custom dark marker
      const markerIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:28px;height:28px;border-radius:50% 50% 50% 0;
          background:linear-gradient(135deg,#10b981,#059669);
          border:2px solid rgba(255,255,255,0.3);
          transform:rotate(-45deg);
          box-shadow:0 2px 8px rgba(16,185,129,0.5);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      L.marker([lat, lng], { icon: markerIcon }).addTo(map);

      if (label) {
        L.tooltip({ permanent: true, direction: 'top', className: 'dark-tooltip' })
          .setContent(label)
          .setLatLng([lat, lng])
          .addTo(map);
      }

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, zoom]);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ height, width: '100%' }}
    />
  );
}

// ─── Day Overview Map (multiple pins) ─────────────────────────────────────────

interface DayMapProps {
  stops: Array<{ lat: number; lng: number; label: string; index: number }>;
  height?: number;
  className?: string;
}

export function DayMap({ stops, height = 200, className = '' }: DayMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || stops.length === 0) return;

    import('leaflet').then(L => {
      const Leaflet = L.default;
      delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;

      const map = Leaflet.map(containerRef.current!, {
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        attributionControl: false,
        doubleClickZoom: false,
      });

      Leaflet.tileLayer(DARK_TILE, { subdomains: 'abcd', maxZoom: 19 }).addTo(map);

      // Numbered markers
      stops.forEach(stop => {
        const icon = Leaflet.divIcon({
          className: '',
          html: `<div style="
            width:26px;height:26px;border-radius:50%;
            background:linear-gradient(135deg,#10b981,#059669);
            border:2px solid rgba(255,255,255,0.25);
            display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:800;color:white;
            box-shadow:0 2px 10px rgba(16,185,129,0.6);
            font-family:system-ui;
          ">${stop.index}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        Leaflet.marker([stop.lat, stop.lng], { icon }).addTo(map);
      });

      // Draw route line
      if (stops.length > 1) {
        Leaflet.polyline(
          stops.map(s => [s.lat, s.lng]),
          { color: '#10b981', weight: 2, opacity: 0.6, dashArray: '6,8' }
        ).addTo(map);
      }

      // Fit all stops
      const group = Leaflet.featureGroup(
        stops.map(s => Leaflet.marker([s.lat, s.lng]))
      );
      map.fitBounds(group.getBounds().pad(0.25));

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [stops.length]);

  if (stops.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ height, width: '100%' }}
    />
  );
}

// ─── Full-screen background map (for landing/hero) ────────────────────────────

interface BackgroundMapProps {
  center: [number, number];
  zoom?: number;
  className?: string;
}

export function BackgroundMap({ center, zoom = 11, className = '' }: BackgroundMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import('leaflet').then(L => {
      const Leaflet = L.default;
      const map = Leaflet.map(containerRef.current!, {
        center,
        zoom,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        attributionControl: false,
        doubleClickZoom: false,
        keyboard: false,
      });

      Leaflet.tileLayer(DARK_TILE, { subdomains: 'abcd', maxZoom: 19 }).addTo(map);
      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
    />
  );
}
