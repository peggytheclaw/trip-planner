import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Trip, TripEvent, Traveler } from '../types';
import { sampleTrip } from '../data/sampleTrip';

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface TripStore {
  trips: Trip[];
  currentTripId: string | null;

  // Getters
  getCurrentTrip: () => Trip | null;
  getTripById: (id: string) => Trip | null;

  // Trip actions
  createTrip: (partial: Omit<Trip, 'id' | 'events' | 'createdAt' | 'updatedAt'>) => Trip;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  setCurrentTrip: (id: string | null) => void;

  // Event actions
  addEvent: (tripId: string, event: Omit<TripEvent, 'id' | 'createdAt'>) => TripEvent;
  updateEvent: (tripId: string, eventId: string, updates: Partial<TripEvent>) => void;
  deleteEvent: (tripId: string, eventId: string) => void;

  // Traveler actions
  addTraveler: (tripId: string, traveler: Omit<Traveler, 'id'>) => void;
  updateTraveler: (tripId: string, travelerId: string, updates: Partial<Traveler>) => void;
  removeTraveler: (tripId: string, travelerId: string) => void;
}

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      trips: [sampleTrip],
      currentTripId: sampleTrip.id,

      getCurrentTrip: () => {
        const { trips, currentTripId } = get();
        return trips.find(t => t.id === currentTripId) ?? null;
      },

      getTripById: (id) => {
        return get().trips.find(t => t.id === id) ?? null;
      },

      createTrip: (partial) => {
        const trip: Trip = {
          ...partial,
          id: generateId(),
          events: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set(state => ({ trips: [...state.trips, trip] }));
        return trip;
      },

      updateTrip: (id, updates) => {
        set(state => ({
          trips: state.trips.map(t =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      deleteTrip: (id) => {
        set(state => ({
          trips: state.trips.filter(t => t.id !== id),
          currentTripId: state.currentTripId === id ? null : state.currentTripId,
        }));
      },

      setCurrentTrip: (id) => {
        set({ currentTripId: id });
      },

      addEvent: (tripId, eventData) => {
        const event: TripEvent = {
          ...eventData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        } as TripEvent;
        set(state => ({
          trips: state.trips.map(t =>
            t.id === tripId
              ? { ...t, events: [...t.events, event], updatedAt: new Date().toISOString() }
              : t
          ),
        }));
        return event;
      },

      updateEvent: (tripId, eventId, updates) => {
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
      },

      deleteEvent: (tripId, eventId) => {
        set(state => ({
          trips: state.trips.map(t =>
            t.id === tripId
              ? {
                  ...t,
                  events: t.events.filter(e => e.id !== eventId),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      addTraveler: (tripId, travelerData) => {
        const traveler: Traveler = { ...travelerData, id: generateId() };
        set(state => ({
          trips: state.trips.map(t =>
            t.id === tripId
              ? { ...t, travelers: [...t.travelers, traveler] }
              : t
          ),
        }));
      },

      updateTraveler: (tripId, travelerId, updates) => {
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
      },

      removeTraveler: (tripId, travelerId) => {
        set(state => ({
          trips: state.trips.map(t =>
            t.id === tripId
              ? { ...t, travelers: t.travelers.filter(tr => tr.id !== travelerId) }
              : t
          ),
        }));
      },
    }),
    {
      name: 'trip-planner-trips',
      partialize: (state) => ({ trips: state.trips, currentTripId: state.currentTripId }),
    }
  )
);
