// ─── Haversine distance (km) ──────────────────────────────────────────────────
export function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Speed table (km/h) ───────────────────────────────────────────────────────
const SPEEDS = {
  walk: 5,
  transit: 25,
  drive_city: 30,
  drive_highway: 80,
  flight: 850,
};

export type TravelMode = 'walk' | 'transit' | 'drive' | 'flight' | 'unknown';

export interface TravelEstimate {
  mode: TravelMode;
  minutes: number;
  distanceKm: number;
  label: string;
  emoji: string;
  isGap: boolean;       // true when gap >2h with no transport
  isOvernight: boolean; // true when gap spans midnight
}

// Infer transport mode from distance and event types
function inferMode(distanceKm: number, nextEventType?: string): TravelMode {
  if (nextEventType === 'flight' || distanceKm > 200) return 'flight';
  if (nextEventType === 'train') return 'transit';
  if (nextEventType === 'transport') return 'drive';
  if (distanceKm < 1.5) return 'walk';
  if (distanceKm < 8) return 'transit';
  if (distanceKm < 60) return 'drive';
  return 'flight';
}

function modeEmoji(mode: TravelMode): string {
  return { walk: '🚶', transit: '🚇', drive: '🚗', flight: '✈️', unknown: '📍' }[mode];
}

function modeLabel(mode: TravelMode): string {
  return { walk: 'walk', transit: 'transit', drive: 'drive', flight: 'flight', unknown: '' }[mode];
}

function minutesToLabel(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─── Time gap between two events (minutes) ───────────────────────────────────
export function timeDiffMinutes(
  date1: string, time1: string | undefined,
  date2: string, time2: string | undefined
): number {
  if (!time1 || !time2) return 0;
  const d1 = new Date(`${date1}T${time1}:00`);
  const d2 = new Date(`${date2}T${time2}:00`);
  return Math.round((d2.getTime() - d1.getTime()) / 60000);
}

// ─── Main calculation ─────────────────────────────────────────────────────────
export function estimateTravelTime(
  fromCoords: [number, number] | null,
  toCoords: [number, number] | null,
  fromDate: string,
  fromTime: string | undefined,
  toDate: string,
  toTime: string | undefined,
  nextEventType?: string,
  precomputedMinutes?: number, // e.g. from actual flight duration
): TravelEstimate | null {
  // Skip if no time info
  if (!fromTime || !toTime) return null;

  const gapMinutes = timeDiffMinutes(fromDate, fromTime, toDate, toTime);
  if (gapMinutes <= 0) return null;

  // Check for overnight
  const isOvernight = toDate !== fromDate && gapMinutes > 360;

  // If we have actual flight duration, use it
  if (precomputedMinutes && precomputedMinutes > 0) {
    return {
      mode: 'flight',
      minutes: precomputedMinutes,
      distanceKm: 0,
      label: `${minutesToLabel(precomputedMinutes)} flight`,
      emoji: '✈️',
      isGap: false,
      isOvernight,
    };
  }

  // If no coordinates, just show a time gap
  if (!fromCoords || !toCoords) {
    // Gap >2h midday with no transport → warn
    if (gapMinutes > 120) {
      return {
        mode: 'unknown',
        minutes: gapMinutes,
        distanceKm: 0,
        label: minutesToLabel(gapMinutes) + ' gap',
        emoji: '⏱️',
        isGap: gapMinutes > 120,
        isOvernight,
      };
    }
    return null;
  }

  const distanceKm = haversineKm(fromCoords[0], fromCoords[1], toCoords[0], toCoords[1]);
  if (distanceKm < 0.1) return null; // Same location

  const mode = inferMode(distanceKm, nextEventType);
  let speed: number;
  switch (mode) {
    case 'walk':    speed = SPEEDS.walk; break;
    case 'transit': speed = SPEEDS.transit; break;
    case 'drive':   speed = distanceKm > 30 ? SPEEDS.drive_highway : SPEEDS.drive_city; break;
    case 'flight':  speed = SPEEDS.flight; break;
    default:        speed = SPEEDS.transit;
  }

  const travelMins = Math.round((distanceKm / speed) * 60);
  const isGap = gapMinutes > 120 && mode === 'unknown';

  return {
    mode,
    minutes: travelMins,
    distanceKm: Math.round(distanceKm * 10) / 10,
    label: `${minutesToLabel(travelMins)} ${modeLabel(mode)}`,
    emoji: modeEmoji(mode),
    isGap,
    isOvernight,
  };
}

// ─── Pre-computed Tokyo travel times (key: eventId→eventId) ──────────────────
export const PRECOMPUTED_TRAVEL: Record<string, { label: string; emoji: string; minutes: number }> = {
  'evt-flight-out→evt-narita-express': { label: 'Landing + immigration ~1h', emoji: '🛂', minutes: 60 },
  'evt-narita-express→evt-hotel-checkin': { label: '5 min walk from Shinjuku Stn', emoji: '🚶', minutes: 5 },
  'evt-hotel-checkin→evt-ichiran': { label: '3 min walk', emoji: '🚶', minutes: 3 },
  'evt-ichiran→evt-tsukiji': { label: '25 min subway', emoji: '🚇', minutes: 25 },
  'evt-tsukiji→evt-sensoji': { label: '12 min subway', emoji: '🚇', minutes: 12 },
  'evt-sensoji→evt-subway-asakusa': { label: 'Right outside the temple', emoji: '🚇', minutes: 2 },
  'evt-subway-asakusa→evt-shibuya': { label: '30 min subway', emoji: '🚇', minutes: 30 },
  'evt-shibuya→evt-teamlab': { label: '25 min subway to Toyosu', emoji: '🚇', minutes: 25 },
  'evt-teamlab→evt-sushi-dinner': { label: '20 min subway to Ginza', emoji: '🚇', minutes: 20 },
  'evt-sushi-dinner→evt-harajuku': { label: 'Next morning — 3 min walk from hotel', emoji: '🚶', minutes: 15 },
  'evt-skytree→evt-farewell-dinner': { label: '40 min subway to Nishi-Azabu', emoji: '🚇', minutes: 40 },
};
