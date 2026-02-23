import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { TripRow, TravelerRow, EventRow } from '../lib/supabase';
import { Trip, TripEvent, Traveler } from '../types';

// ─── Conversion helpers ─────────────────────────────────────────────────────

/** Flatten a DB event row into a TripEvent (spread `data` JSONB on top) */
function rowToEvent(row: EventRow): TripEvent {
  return {
    id: row.id,
    type: row.type as TripEvent['type'],
    date: row.date,
    time: row.time ?? undefined,
    title: row.title,
    createdAt: row.created_at,
    ...row.data,
  } as TripEvent;
}

/** Convert a TripEvent to DB row fields */
function eventToRow(event: Omit<TripEvent, 'id' | 'createdAt'>, tripId: string, position = 0) {
  const { type, date, time, title, ...rest } = event as Record<string, unknown>;
  return {
    trip_id: tripId,
    type: type as string,
    date: date as string,
    time: (time as string | undefined) ?? null,
    title: title as string,
    data: rest,
    position,
  };
}

function rowToTraveler(row: TravelerRow): Traveler {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    emoji: row.emoji,
  };
}

function rowToTrip(row: TripRow, travelers: TravelerRow[], events: EventRow[]): Trip {
  return {
    id: row.id,
    name: row.name,
    destination: row.destination,
    emoji: row.emoji,
    startDate: row.start_date ?? '',
    endDate: row.end_date ?? '',
    coverGradient: row.cover_gradient ?? undefined,
    travelers: travelers.map(rowToTraveler),
    events: events.map(rowToEvent),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface TripStore {
  trips: Trip[];
  currentTripId: string | null;
  loading: boolean;

  // Getters
  getCurrentTrip: () => Trip | null;
  getTripById: (id: string) => Trip | null;

  // Lifecycle
  loadTrips: (userId: string) => Promise<void>;
  loadTripById: (tripId: string) => Promise<Trip | null>;

  // Trip actions
  createTrip: (partial: Omit<Trip, 'id' | 'events' | 'createdAt' | 'updatedAt'> & { events?: Trip['events'] }) => Promise<Trip>;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  setCurrentTrip: (id: string | null) => void;

  // Event actions
  addEvent: (tripId: string, event: Omit<TripEvent, 'id' | 'createdAt'>) => Promise<TripEvent>;
  updateEvent: (tripId: string, eventId: string, updates: Partial<TripEvent>) => Promise<void>;
  deleteEvent: (tripId: string, eventId: string) => Promise<void>;

  // Idea Bank actions
  addIdeaToBank: (tripId: string, idea: Omit<TripEvent, 'id' | 'createdAt'>) => Promise<TripEvent>;
  promoteIdeaToItinerary: (tripId: string, ideaId: string, date: string) => Promise<void>;
  updateIdea: (tripId: string, ideaId: string, updates: Partial<TripEvent>) => Promise<void>;
  deleteIdea: (tripId: string, ideaId: string) => Promise<void>;

  // Traveler actions
  addTraveler: (tripId: string, traveler: Omit<Traveler, 'id'>) => Promise<void>;
  updateTraveler: (tripId: string, travelerId: string, updates: Partial<Traveler>) => Promise<void>;
  removeTraveler: (tripId: string, travelerId: string) => Promise<void>;
}

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  currentTripId: null,
  loading: false,

  getCurrentTrip: () => {
    const { trips, currentTripId } = get();
    return trips.find(t => t.id === currentTripId) ?? null;
  },

  getTripById: (id) => {
    return get().trips.find(t => t.id === id) ?? null;
  },

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  loadTrips: async (userId: string) => {
    set({ loading: true });
    try {
      const { data: tripRows, error } = await supabase
        .from('trips')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!tripRows?.length) { set({ trips: [], loading: false }); return; }

      const tripIds = tripRows.map(t => t.id);

      const [{ data: travelerRows }, { data: eventRows }] = await Promise.all([
        supabase.from('travelers').select('*').in('trip_id', tripIds),
        supabase.from('events').select('*').in('trip_id', tripIds).order('position'),
      ]);

      const trips = tripRows.map(row =>
        rowToTrip(
          row,
          (travelerRows ?? []).filter(t => t.trip_id === row.id),
          (eventRows ?? []).filter(e => e.trip_id === row.id),
        )
      );

      set({ trips, loading: false });
      if (trips.length > 0 && !get().currentTripId) {
        set({ currentTripId: trips[0].id });
      }
    } catch (err) {
      console.error('loadTrips error:', err);
      set({ loading: false });
    }
  },

  loadTripById: async (tripId: string) => {
    // Check if already loaded
    const existing = get().trips.find(t => t.id === tripId);
    if (existing) return existing;

    try {
      const [{ data: tripRow }, { data: travelerRows }, { data: eventRows }] = await Promise.all([
        supabase.from('trips').select('*').eq('id', tripId).single(),
        supabase.from('travelers').select('*').eq('trip_id', tripId),
        supabase.from('events').select('*').eq('trip_id', tripId).order('position'),
      ]);

      if (!tripRow) return null;
      const trip = rowToTrip(tripRow, travelerRows ?? [], eventRows ?? []);
      set(state => ({ trips: [...state.trips.filter(t => t.id !== tripId), trip] }));
      return trip;
    } catch (err) {
      console.error('loadTripById error:', err);
      return null;
    }
  },

  // ── Trips ──────────────────────────────────────────────────────────────────

  createTrip: async (partial) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('trips')
      .insert({
        owner_id: user.id,
        name: partial.name,
        destination: partial.destination,
        emoji: partial.emoji ?? '✈️',
        start_date: partial.startDate || null,
        end_date: partial.endDate || null,
        cover_gradient: partial.coverGradient ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    const trip = rowToTrip(data, [], []);

    // Insert initial travelers if provided
    if (partial.travelers?.length) {
      const travelerInserts = partial.travelers.map(t => ({
        trip_id: trip.id,
        name: t.name,
        color: t.color,
        emoji: t.emoji ?? '👤',
      }));
      await supabase.from('travelers').insert(travelerInserts);
    }

    // Insert initial events if provided
    if (partial.events?.length) {
      const eventInserts = partial.events.map((e, i) => ({
        ...eventToRow(e as Omit<TripEvent, 'id' | 'createdAt'>, trip.id, i),
        id: e.id, // preserve IDs from sample trips
      }));
      await supabase.from('events').insert(eventInserts);
    }

    // Reload the trip with travelers/events
    const fullTrip = await get().loadTripById(trip.id) ?? trip;
    set(state => ({ trips: [...state.trips, fullTrip], currentTripId: fullTrip.id }));
    return fullTrip;
  },

  updateTrip: async (id, updates) => {
    // Optimistic update
    set(state => ({
      trips: state.trips.map(t =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    }));

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.destination !== undefined) dbUpdates.destination = updates.destination;
    if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate || null;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate || null;
    if (updates.coverGradient !== undefined) dbUpdates.cover_gradient = updates.coverGradient ?? null;

    if (Object.keys(dbUpdates).length) {
      const { error } = await supabase.from('trips').update(dbUpdates).eq('id', id);
      if (error) console.error('updateTrip error:', error);
    }
  },

  deleteTrip: async (id) => {
    // Optimistic
    set(state => ({
      trips: state.trips.filter(t => t.id !== id),
      currentTripId: state.currentTripId === id ? null : state.currentTripId,
    }));

    const { error } = await supabase.from('trips').delete().eq('id', id);
    if (error) console.error('deleteTrip error:', error);
  },

  setCurrentTrip: (id) => set({ currentTripId: id }),

  // ── Events ─────────────────────────────────────────────────────────────────

  addEvent: async (tripId, eventData) => {
    const trip = get().trips.find(t => t.id === tripId);
    const position = trip?.events.length ?? 0;

    const row = eventToRow(eventData, tripId, position);
    const { data, error } = await supabase.from('events').insert(row).select().single();
    if (error) throw error;

    const event = rowToEvent(data);
    set(state => ({
      trips: state.trips.map(t =>
        t.id === tripId
          ? { ...t, events: [...t.events, event], updatedAt: new Date().toISOString() }
          : t
      ),
    }));
    return event;
  },

  updateEvent: async (tripId, eventId, updates) => {
    // Optimistic
    set(state => ({
      trips: state.trips.map(t =>
        t.id === tripId
          ? {
              ...t,
              events: t.events.map(e =>
                e.id === eventId ? { ...e, ...updates } as TripEvent : e
              ),
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    }));

    // Build DB update from the current merged state
    const trip = get().trips.find(t => t.id === tripId);
    const event = trip?.events.find(e => e.id === eventId);
    if (!event) return;

    const eventAsRecord = event as unknown as Record<string, unknown>;
    const { id: _id, createdAt: _ca, type, date, time, title, ...rest } = eventAsRecord;
    const { error } = await supabase
      .from('events')
      .update({ type, date, time: time ?? null, title, data: rest })
      .eq('id', eventId);

    if (error) console.error('updateEvent error:', error);
  },

  deleteEvent: async (tripId, eventId) => {
    set(state => ({
      trips: state.trips.map(t =>
        t.id === tripId
          ? { ...t, events: t.events.filter(e => e.id !== eventId), updatedAt: new Date().toISOString() }
          : t
      ),
    }));

    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) console.error('deleteEvent error:', error);
  },

  // ── Idea Bank ──────────────────────────────────────────────────────────────

  addIdeaToBank: async (tripId, ideaData) => {
    // Create idea with a placeholder date (won't be shown in timeline)
    const idea = {
      ...ideaData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    } as TripEvent;

    // Update local state immediately
    set(state => ({
      trips: state.trips.map(t =>
        t.id === tripId
          ? { ...t, ideaBank: [...(t.ideaBank || []), idea], updatedAt: new Date().toISOString() }
          : t
      ),
    }));

    // For now, ideas are stored in local state only (not in Supabase)
    // TODO: Add ideaBank support to Supabase schema if needed for persistence
    return idea;
  },

  promoteIdeaToItinerary: async (tripId, ideaId, date) => {
    const trip = get().trips.find(t => t.id === tripId);
    if (!trip) return;

    const idea = trip.ideaBank?.find(i => i.id === ideaId);
    if (!idea) return;

    // Remove from idea bank
    set(state => ({
      trips: state.trips.map(t =>
        t.id === tripId
          ? { ...t, ideaBank: (t.ideaBank || []).filter(i => i.id !== ideaId) }
          : t
      ),
    }));

    // Add to itinerary with the specified date (remove old id and createdAt)
    const { id, createdAt, ...eventData } = idea;
    await get().addEvent(tripId, { ...eventData, date });
  },

  updateIdea: async (tripId, ideaId, updates) => {
    set(state => ({
      trips: state.trips.map(t =>
        t.id === tripId
          ? {
              ...t,
              ideaBank: (t.ideaBank || []).map(i =>
                i.id === ideaId ? ({ ...i, ...updates } as TripEvent) : i
              ),
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    }));
  },

  deleteIdea: async (tripId, ideaId) => {
    set(state => ({
      trips: state.trips.map(t =>
        t.id === tripId
          ? {
              ...t,
              ideaBank: (t.ideaBank || []).filter(i => i.id !== ideaId),
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    }));
  },

  // ── Travelers ──────────────────────────────────────────────────────────────

  addTraveler: async (tripId, travelerData) => {
    const { data, error } = await supabase
      .from('travelers')
      .insert({
        trip_id: tripId,
        name: travelerData.name,
        color: travelerData.color,
        emoji: travelerData.emoji ?? '👤',
      })
      .select()
      .single();

    if (error) throw error;
    const traveler = rowToTraveler(data);

    set(state => ({
      trips: state.trips.map(t =>
        t.id === tripId ? { ...t, travelers: [...t.travelers, traveler] } : t
      ),
    }));
  },

  updateTraveler: async (tripId, travelerId, updates) => {
    set(state => ({
      trips: state.trips.map(t =>
        t.id === tripId
          ? {
              ...t,
              travelers: t.travelers.map(tr =>
                tr.id === travelerId ? { ...tr, ...updates } : tr
              ),
            }
          : t
      ),
    }));

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji;

    if (Object.keys(dbUpdates).length) {
      const { error } = await supabase.from('travelers').update(dbUpdates).eq('id', travelerId);
      if (error) console.error('updateTraveler error:', error);
    }
  },

  removeTraveler: async (tripId, travelerId) => {
    set(state => ({
      trips: state.trips.map(t =>
        t.id === tripId
          ? { ...t, travelers: t.travelers.filter(tr => tr.id !== travelerId) }
          : t
      ),
    }));

    const { error } = await supabase.from('travelers').delete().eq('id', travelerId);
    if (error) console.error('removeTraveler error:', error);
  },
}));
