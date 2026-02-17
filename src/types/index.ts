// ─── Event Types ────────────────────────────────────────────────────────────

export type EventType =
  | 'flight'
  | 'hotel'
  | 'restaurant'
  | 'activity'
  | 'transport'
  | 'train'
  | 'note';

// Base fields shared by all events
export interface BaseEvent {
  id: string;
  type: EventType;
  date: string;        // ISO date string "YYYY-MM-DD"
  time?: string;       // "HH:mm"
  endTime?: string;    // "HH:mm"
  endDate?: string;    // ISO date string (if spans multiple days)
  title: string;
  notes?: string;
  createdBy?: string;  // traveler id
  createdAt: string;   // ISO datetime
}

export interface FlightEvent extends BaseEvent {
  type: 'flight';
  airline: string;
  flightNumber: string;
  fromAirport: string;   // IATA code e.g. "SFO"
  fromCity: string;
  toAirport: string;
  toCity: string;
  departureTime: string;  // "HH:mm"
  arrivalTime: string;
  arrivalDate: string;    // ISO date
  duration: string;       // "10h 45m"
  confirmationNumber?: string;
  seatInfo?: string;
  cabin?: string;
}

export interface HotelEvent extends BaseEvent {
  type: 'hotel';
  hotelName: string;
  neighborhood?: string;
  address?: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  roomType?: string;
  confirmationNumber?: string;
  pricePerNight?: number;
  totalPrice?: number;
  numRooms?: number;
  isCheckout?: boolean;  // true for the checkout card
  linkedEventId?: string; // links checkin/checkout pair
}

export interface RestaurantEvent extends BaseEvent {
  type: 'restaurant';
  restaurantName: string;
  cuisine?: string;
  reservationStatus?: 'confirmed' | 'pending' | 'none';
  address?: string;
  duration?: string; // "1h 30m"
  price?: string;    // "$$$"
}

export interface ActivityEvent extends BaseEvent {
  type: 'activity';
  activityName: string;
  location?: string;
  duration?: string;
  price?: number;
  bookingInfo?: string;
  category?: string;
}

export interface TransportEvent extends BaseEvent {
  type: 'transport';
  transportType: 'car' | 'taxi' | 'bus' | 'subway' | 'ferry' | 'other';
  fromLocation: string;
  toLocation: string;
  duration?: string;
  cost?: number;
  provider?: string;
}

export interface TrainEvent extends BaseEvent {
  type: 'train';
  trainName?: string;
  trainNumber?: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
  ticketClass?: string;
  confirmationNumber?: string;
}

export interface NoteEvent extends BaseEvent {
  type: 'note';
  content: string;
}

export type TripEvent =
  | FlightEvent
  | HotelEvent
  | RestaurantEvent
  | ActivityEvent
  | TransportEvent
  | TrainEvent
  | NoteEvent;

// ─── Trip ───────────────────────────────────────────────────────────────────

export interface Traveler {
  id: string;
  name: string;
  emoji?: string;
  color: string;  // hex color
}

export interface Trip {
  id: string;           // also serves as the Yjs room ID
  name: string;
  destination: string;
  emoji?: string;
  startDate: string;    // ISO date "YYYY-MM-DD"
  endDate: string;
  coverGradient?: string; // CSS gradient for card
  travelers: Traveler[];
  events: TripEvent[];
  createdAt: string;
  updatedAt: string;
}

// ─── Expenses ───────────────────────────────────────────────────────────────

export type ExpenseCategory = 'food' | 'transport' | 'hotel' | 'activities' | 'other';

export interface ExpenseSplit {
  travelerId: string;
  amount: number;       // what they owe
  settled: boolean;
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency?: string;
  paidBy: string;       // traveler id
  splits: ExpenseSplit[];
  category: ExpenseCategory;
  date: string;         // ISO date
  createdAt: string;
  receiptUrl?: string;
}

export interface Settlement {
  from: string;   // traveler id who owes
  to: string;     // traveler id who is owed
  amount: number;
  settled: boolean;
  id: string;
}

// ─── Collaboration ──────────────────────────────────────────────────────────

export interface ConnectedPeer {
  id: string;
  name: string;
  color: string;
  joinedAt: string;
  lastSeen: string;
}

export interface CollabState {
  roomId: string | null;
  connected: boolean;
  peers: ConnectedPeer[];
  syncing: boolean;
  error: string | null;
}

// ─── UI ─────────────────────────────────────────────────────────────────────

export interface DayGroup {
  date: string;         // ISO date "YYYY-MM-DD"
  label: string;        // "DAY 1 - Friday, March 15"
  events: TripEvent[];
}

export type ModalState =
  | { type: 'none' }
  | { type: 'addEvent'; insertDate?: string; insertAfterEventId?: string }
  | { type: 'editEvent'; eventId: string }
  | { type: 'addExpense' }
  | { type: 'editExpense'; expenseId: string };
