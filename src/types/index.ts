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
  description?: string; // prose paragraph for travel guide feel
  createdBy?: string;  // traveler id
  createdAt: string;   // ISO datetime
  lat?: number;        // latitude for map display
  lng?: number;        // longitude for map display
  participants?: string[]; // traveler ids participating in this event (empty/undefined = everyone)
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
  // ── v2 additions ─────────────────────────────────────
  stopover?: string;          // e.g. "via Doha (2h layover at DOH)"
  baggageIncluded?: boolean;  // whether checked bag is included in fare
  baggageFeeUSD?: number;     // cost if not included
}

export interface HotelEvent extends BaseEvent {
  type: 'hotel';
  hotelName: string;
  neighborhood?: string;
  neighborhoodDescription?: string; // e.g. "Vibrant arts district, 5min walk to Shibuya Crossing"
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
  // ── v2 additions ─────────────────────────────────────
  amenities?: string[];   // e.g. ["pool", "spa", "beach access", "rooftop bar", "free breakfast"]
  vibe?: string;          // e.g. "bohemian riad", "mountain refugio", "cliffside boutique hotel"
  hotelUrl?: string;      // booking/hotel website URL
  starRating?: 1 | 2 | 3 | 4 | 5;  // official star rating
}

export interface RestaurantEvent extends BaseEvent {
  type: 'restaurant';
  restaurantName: string;
  cuisine?: string;
  reservationStatus?: 'confirmed' | 'pending' | 'none';
  address?: string;
  duration?: string; // "1h 30m"
  price?: string;    // "$$$"
  whatToTry?: string; // e.g. "Try the omakase — chef's seasonal selection is the move"
  // ── v2 additions ─────────────────────────────────────
  mustOrderDish?: string;  // THE single dish you cannot skip
  dressCode?: 'none' | 'casual' | 'smart-casual' | 'formal';
  michelinStars?: 0 | 1 | 2 | 3;
  reservationRequired?: boolean;
  localFavourite?: boolean;  // off-the-tourist-trail gem
  openTill?: string;         // "23:00" — useful for late-night planning
  vegetarianFriendly?: boolean;
}

export interface ActivityEvent extends BaseEvent {
  type: 'activity';
  activityName: string;
  location?: string;
  duration?: string;
  price?: number;
  bookingInfo?: string;
  category?: string;
  coverPhoto?: string; // URL for hero image at top of card
  // ── v2 additions ─────────────────────────────────────
  physicalRating?: 1 | 2 | 3 | 4 | 5;
  // ^ 1=gentle/seated, 2=easy walk, 3=moderate hike, 4=strenuous, 5=extreme/expedition
  minAge?: number;              // minimum age recommendation (e.g. 8 for certain hikes)
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  mustSee?: boolean;            // marquee experience — the one you can't skip
  tipFromLocals?: string;       // insider knowledge that changes the experience
  vibes?: string[];             // e.g. ['romantic', 'adventurous', 'photography', 'family']
}

export interface TransportEvent extends BaseEvent {
  type: 'transport';
  transportType: 'car' | 'taxi' | 'bus' | 'subway' | 'ferry' | 'other';
  fromLocation: string;
  toLocation: string;
  duration?: string;
  cost?: number;
  provider?: string;
  // ── v2 additions ─────────────────────────────────────
  vehicleType?: string;     // e.g. "4WD SUV", "longtail boat", "classic wooden gozzo"
  bookingRequired?: boolean;
  bookingInfo?: string;     // how/where to book
  licensePlate?: string;    // for rental car records
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
  // ── v2 additions ─────────────────────────────────────
  bookingInfo?: string;    // e.g. "Book at raileurope.com — sells out fast in summer"
  platform?: string;       // departure platform if known
  seatType?: 'window' | 'aisle' | 'open';
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
  // ── v2 additions ─────────────────────────────────────
  budgetLevel?: 'budget' | 'mid-range' | 'luxury';
  // ^ overall cost tier: budget=hostels/street food, mid-range=3★ hotels/casual dining, luxury=5★/fine dining
  difficultyRating?: 'easy' | 'moderate' | 'challenging' | 'extreme';
  // ^ easy=city break/beach, moderate=some hiking, challenging=multi-day trek, extreme=expedition
  highlights?: string[];           // top 4–6 experiences in this trip (for cards/previews)
  bestSeason?: string;             // e.g. "April–June", "Aug–Sep (avoid monsoon)"
  totalBudgetEstimateUSD?: number; // estimated total cost per person in USD
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
