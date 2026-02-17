import { TripEvent } from '../types';

// Haversine distance in km between two lat/lng points
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type TravelMode = 'walk' | 'drive' | 'transit' | 'flight';

export function getTravelTime(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number,
  mode: TravelMode
): string {
  const distKm = haversineDistance(fromLat, fromLng, toLat, toLng);
  const speeds: Record<TravelMode, number> = { walk: 5, drive: 30, transit: 20, flight: 800 };
  const hours = distKm / speeds[mode];
  const mins = Math.round(hours * 60);
  if (mins < 1) return '< 1 min';
  return mins < 60 ? `${mins} min` : `${Math.floor(hours)}h ${mins % 60}m`;
}

export function inferTravelMode(from: TripEvent, to: TripEvent): TravelMode {
  // If either is a flight, it's a flight
  if (from.type === 'flight' || to.type === 'flight') return 'flight';
  // If either is a train/transport, use transit
  if (from.type === 'train' || to.type === 'train') return 'transit';
  if (from.type === 'transport' || to.type === 'transport') return 'transit';

  // If both have coords, estimate by distance
  if (from.lat && from.lng && to.lat && to.lng) {
    const dist = haversineDistance(from.lat, from.lng, to.lat, to.lng);
    if (dist > 50) return 'flight';
    if (dist > 5) return 'transit';
    if (dist > 1) return 'drive';
    return 'walk';
  }

  return 'walk';
}

export const TRAVEL_MODE_EMOJI: Record<TravelMode, string> = {
  walk: '🚶',
  drive: '🚗',
  transit: '🚇',
  flight: '✈️',
};

// Check if there's a large time gap between two events (>2hr)
export function hasLargeTimeGap(from: TripEvent, to: TripEvent): boolean {
  if (!from.time || !to.time) return false;
  const [fh, fm] = from.endTime ? from.endTime.split(':').map(Number) : from.time.split(':').map(Number);
  const [th, tm] = to.time.split(':').map(Number);
  const fromMins = fh * 60 + fm;
  const toMins = th * 60 + tm;
  return toMins - fromMins > 120;
}

// CartoDB Dark Matter tile URL
export const DARK_MAP_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
export const DARK_MAP_ATTRIBUTION = '©<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ©<a href="https://carto.com/attributions">CartoDB</a>';
