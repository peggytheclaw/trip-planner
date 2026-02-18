import { format, parseISO, differenceInMinutes, parse } from 'date-fns';
import { TripEvent, DayGroup, HotelEvent } from '../types';

// Build sorted day groups from events
export function groupEventsByDay(events: TripEvent[]): DayGroup[] {
  const sorted = [...events].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    if (!a.time) return -1;
    if (!b.time) return 1;
    return a.time.localeCompare(b.time);
  });

  const dayMap = new Map<string, TripEvent[]>();
  for (const evt of sorted) {
    const existing = dayMap.get(evt.date) ?? [];
    existing.push(evt);
    dayMap.set(evt.date, existing);
  }

  const result: DayGroup[] = [];
  let dayNum = 1;
  const dates = Array.from(dayMap.keys()).sort();
  for (const date of dates) {
    const parsed = parseISO(date);
    result.push({
      date,
      label: `DAY ${dayNum} — ${format(parsed, 'EEEE, MMMM d')}`,
      events: dayMap.get(date)!,
    });
    dayNum++;
  }
  return result;
}

// Detect if there's a meal gap (no food event for >4 hours during midday 11am-3pm)
export function detectMealGap(events: TripEvent[], date: string): { hasMealGap: boolean; mealType: string } {
  const foodEvents = events.filter(e => e.type === 'restaurant');
  const morningFood = foodEvents.some(e => {
    if (!e.time) return false;
    const hour = parseInt(e.time.split(':')[0]);
    return hour >= 6 && hour < 11;
  });
  const lunchFood = foodEvents.some(e => {
    if (!e.time) return false;
    const hour = parseInt(e.time.split(':')[0]);
    return hour >= 11 && hour < 15;
  });
  const dinnerFood = foodEvents.some(e => {
    if (!e.time) return false;
    const hour = parseInt(e.time.split(':')[0]);
    return hour >= 17 && hour < 23;
  });

  if (!lunchFood && events.length > 0) {
    return { hasMealGap: true, mealType: 'lunch' };
  }
  if (!dinnerFood && events.length > 2) {
    return { hasMealGap: true, mealType: 'dinner' };
  }
  return { hasMealGap: false, mealType: '' };
}

// Find the active hotel stay for a given date
export function getActiveHotel(allEvents: TripEvent[], date: string): HotelEvent | null {
  const hotels = allEvents.filter(
    (e): e is HotelEvent => e.type === 'hotel' && !e.isCheckout
  );
  for (const hotel of hotels) {
    if (hotel.date <= date && hotel.checkOutDate > date) {
      return hotel;
    }
  }
  return null;
}

// Format time string "HH:mm" to "h:mm am/pm"
export function formatTime(time: string): string {
  try {
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'pm' : 'am';
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour}:${m.toString().padStart(2, '0')}${suffix}`;
  } catch {
    return time;
  }
}

// Format date string "YYYY-MM-DD" to readable
export function formatDate(date: string): string {
  try {
    return format(parseISO(date), 'MMM d, yyyy');
  } catch {
    return date;
  }
}

// Get duration between two times (same day)
export function getTimeDuration(startTime: string, endTime: string): string {
  try {
    const base = new Date(2000, 0, 1);
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const start = new Date(base.getTime() + sh * 60000 * 60 + sm * 60000);
    const end = new Date(base.getTime() + eh * 60000 * 60 + em * 60000);
    const mins = differenceInMinutes(end, start);
    if (mins <= 0) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  } catch {
    return '';
  }
}

export const EVENT_COLORS: Record<string, string> = {
  flight: '#3B82F6',
  hotel: '#8B5CF6',
  restaurant: '#F97316',
  activity: '#10B981',
  transport: '#EAB308',
  train: '#EAB308',
  note: '#6B7280',
};

export const EVENT_BG: Record<string, string> = {
  flight: '#EFF6FF',
  hotel: '#F5F3FF',
  restaurant: '#FFF7ED',
  activity: '#ECFDF5',
  transport: '#FEFCE8',
  train: '#FEFCE8',
  note: '#F9FAFB',
};

export const EVENT_LABELS: Record<string, string> = {
  flight: 'Flight',
  hotel: 'Hotel',
  restaurant: 'Restaurant',
  activity: 'Activity',
  transport: 'Transport',
  train: 'Train',
  note: 'Note',
};

// Legacy string icons (kept for any data references)
export const EVENT_ICONS: Record<string, string> = {
  flight: 'flight',
  hotel: 'hotel',
  restaurant: 'restaurant',
  activity: 'activity',
  transport: 'transport',
  train: 'train',
  note: 'note',
};
