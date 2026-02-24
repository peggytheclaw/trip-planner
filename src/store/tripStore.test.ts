import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTripStore } from './tripStore';
import type { DecisionPoint, TripEvent } from '../types';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'mock-id', created_at: new Date().toISOString() },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
      }),
    },
  },
}));

describe('Decision Point Store Methods', () => {
  beforeEach(() => {
    // Reset store state
    useTripStore.setState({
      trips: [],
      currentTripId: null,
      loading: false,
    });
  });

  describe('addDecisionPoint', () => {
    it('creates a decision point with generated option IDs', async () => {
      const store = useTripStore.getState();
      
      // Create a trip first
      const trip = {
        id: 'trip-1',
        name: 'Test Trip',
        destination: 'Paris',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        travelers: [],
        events: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      useTripStore.setState({ trips: [trip] });

      await store.addDecisionPoint('trip-1', {
        date: '2026-05-02',
        time: '10:00',
        question: 'What should we do today?',
        mode: 'personal',
        options: [
          {
            title: 'Museum Morning',
            description: 'Visit the Louvre',
            events: [
              {
                type: 'activity',
                date: '2026-05-02',
                time: '10:00',
                title: 'Louvre Museum',
                activityName: 'Louvre Museum',
                createdAt: new Date().toISOString(),
              } as TripEvent,
            ],
          },
          {
            title: 'Shopping Spree',
            description: 'Champs-Élysées',
            events: [
              {
                type: 'activity',
                date: '2026-05-02',
                time: '11:00',
                title: 'Shopping',
                activityName: 'Shopping',
                createdAt: new Date().toISOString(),
              } as TripEvent,
            ],
          },
        ],
      });

      const updatedTrip = useTripStore.getState().trips[0];
      const decision = updatedTrip.events[0] as DecisionPoint;

      expect(decision.type).toBe('decision');
      expect(decision.question).toBe('What should we do today?');
      expect(decision.mode).toBe('personal');
      expect(decision.options).toHaveLength(2);
      expect(decision.options[0].id).toBeDefined();
      expect(decision.options[1].id).toBeDefined();
      expect(decision.resolved).toBe(false);
      expect(decision.votes).toEqual({});
    });

    it('defaults to personal mode if not specified', async () => {
      const store = useTripStore.getState();
      
      const trip = {
        id: 'trip-1',
        name: 'Test Trip',
        destination: 'Paris',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        travelers: [],
        events: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      useTripStore.setState({ trips: [trip] });

      await store.addDecisionPoint('trip-1', {
        date: '2026-05-02',
        question: 'Test question',
        options: [
          { title: 'Option 1', events: [] },
        ],
      });

      const decision = useTripStore.getState().trips[0].events[0] as DecisionPoint;
      expect(decision.mode).toBe('personal');
    });
  });

  describe('voteOnDecision', () => {
    it('records a user vote for an option', async () => {
      const store = useTripStore.getState();
      
      const decision: DecisionPoint = {
        id: 'decision-1',
        type: 'decision',
        date: '2026-05-02',
        title: 'What should we do?',
        question: 'What should we do?',
        mode: 'group',
        options: [
          { id: 'opt-1', title: 'Option 1', events: [] },
          { id: 'opt-2', title: 'Option 2', events: [] },
        ],
        resolved: false,
        votes: {},
        createdAt: new Date().toISOString(),
      };

      const trip = {
        id: 'trip-1',
        name: 'Test Trip',
        destination: 'Paris',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        travelers: [],
        events: [decision],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      useTripStore.setState({ trips: [trip] });

      await store.voteOnDecision('trip-1', 'decision-1', 'opt-1', 'user-1');

      const updatedDecision = useTripStore.getState().trips[0].events[0] as DecisionPoint;
      expect(updatedDecision.votes).toEqual({ 'user-1': 'opt-1' });
    });

    it('updates existing vote if user votes again', async () => {
      const store = useTripStore.getState();
      
      const decision: DecisionPoint = {
        id: 'decision-1',
        type: 'decision',
        date: '2026-05-02',
        title: 'What should we do?',
        question: 'What should we do?',
        mode: 'group',
        options: [
          { id: 'opt-1', title: 'Option 1', events: [] },
          { id: 'opt-2', title: 'Option 2', events: [] },
        ],
        resolved: false,
        votes: { 'user-1': 'opt-1' },
        createdAt: new Date().toISOString(),
      };

      const trip = {
        id: 'trip-1',
        name: 'Test Trip',
        destination: 'Paris',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        travelers: [],
        events: [decision],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      useTripStore.setState({ trips: [trip] });

      await store.voteOnDecision('trip-1', 'decision-1', 'opt-2', 'user-1');

      const updatedDecision = useTripStore.getState().trips[0].events[0] as DecisionPoint;
      expect(updatedDecision.votes).toEqual({ 'user-1': 'opt-2' });
    });

    it('does not vote if option ID is invalid', async () => {
      const store = useTripStore.getState();
      
      const decision: DecisionPoint = {
        id: 'decision-1',
        type: 'decision',
        date: '2026-05-02',
        title: 'What should we do?',
        question: 'What should we do?',
        mode: 'group',
        options: [
          { id: 'opt-1', title: 'Option 1', events: [] },
        ],
        resolved: false,
        votes: {},
        createdAt: new Date().toISOString(),
      };

      const trip = {
        id: 'trip-1',
        name: 'Test Trip',
        destination: 'Paris',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        travelers: [],
        events: [decision],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      useTripStore.setState({ trips: [trip] });

      await store.voteOnDecision('trip-1', 'decision-1', 'invalid-opt', 'user-1');

      const updatedDecision = useTripStore.getState().trips[0].events[0] as DecisionPoint;
      expect(updatedDecision.votes).toEqual({});
    });
  });

  describe('resolveDecision', () => {
    it('marks decision as resolved and inserts selected events', async () => {
      const store = useTripStore.getState();
      
      const decision: DecisionPoint = {
        id: 'decision-1',
        type: 'decision',
        date: '2026-05-02',
        title: 'What should we do?',
        question: 'What should we do?',
        mode: 'group',
        options: [
          {
            id: 'opt-1',
            title: 'Museum Morning',
            events: [
              {
                id: 'temp-1',
                type: 'activity',
                date: '2026-05-02',
                time: '10:00',
                title: 'Louvre Museum',
                activityName: 'Louvre Museum',
                createdAt: new Date().toISOString(),
              } as TripEvent,
            ],
          },
          {
            id: 'opt-2',
            title: 'Shopping',
            events: [],
          },
        ],
        resolved: false,
        votes: { 'user-1': 'opt-1', 'user-2': 'opt-1' },
        createdAt: new Date().toISOString(),
      };

      const trip = {
        id: 'trip-1',
        name: 'Test Trip',
        destination: 'Paris',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        travelers: [],
        events: [decision],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      useTripStore.setState({ trips: [trip] });

      await store.resolveDecision('trip-1', 'decision-1', 'opt-1');

      const updatedTrip = useTripStore.getState().trips[0];
      const updatedDecision = updatedTrip.events[0] as DecisionPoint;
      
      expect(updatedDecision.resolved).toBe(true);
      expect(updatedDecision.selectedOptionId).toBe('opt-1');
      
      // Check that events were added
      expect(updatedTrip.events.length).toBeGreaterThan(1);
      
      // Check that the added event has sourceDecisionId
      const addedEvent = updatedTrip.events.find(e => e.title === 'Louvre Museum');
      expect(addedEvent).toBeDefined();
      expect(addedEvent?.sourceDecisionId).toBe('decision-1');
    });

    it('does not resolve if option ID is invalid', async () => {
      const store = useTripStore.getState();
      
      const decision: DecisionPoint = {
        id: 'decision-1',
        type: 'decision',
        date: '2026-05-02',
        title: 'What should we do?',
        question: 'What should we do?',
        mode: 'group',
        options: [
          { id: 'opt-1', title: 'Option 1', events: [] },
        ],
        resolved: false,
        votes: {},
        createdAt: new Date().toISOString(),
      };

      const trip = {
        id: 'trip-1',
        name: 'Test Trip',
        destination: 'Paris',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        travelers: [],
        events: [decision],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      useTripStore.setState({ trips: [trip] });

      await store.resolveDecision('trip-1', 'decision-1', 'invalid-opt');

      const updatedDecision = useTripStore.getState().trips[0].events[0] as DecisionPoint;
      expect(updatedDecision.resolved).toBe(false);
    });
  });

  describe('setDecisionMode', () => {
    it('toggles decision mode between personal and group', async () => {
      const store = useTripStore.getState();
      
      const decision: DecisionPoint = {
        id: 'decision-1',
        type: 'decision',
        date: '2026-05-02',
        title: 'What should we do?',
        question: 'What should we do?',
        mode: 'personal',
        options: [
          { id: 'opt-1', title: 'Option 1', events: [] },
        ],
        resolved: false,
        votes: {},
        createdAt: new Date().toISOString(),
      };

      const trip = {
        id: 'trip-1',
        name: 'Test Trip',
        destination: 'Paris',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        travelers: [],
        events: [decision],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      useTripStore.setState({ trips: [trip] });

      await store.setDecisionMode('trip-1', 'decision-1', 'group');

      const updatedDecision = useTripStore.getState().trips[0].events[0] as DecisionPoint;
      expect(updatedDecision.mode).toBe('group');
    });
  });

  describe('deleteDecision', () => {
    it('removes the decision from events', async () => {
      const store = useTripStore.getState();
      
      const decision: DecisionPoint = {
        id: 'decision-1',
        type: 'decision',
        date: '2026-05-02',
        title: 'What should we do?',
        question: 'What should we do?',
        mode: 'personal',
        options: [
          { id: 'opt-1', title: 'Option 1', events: [] },
        ],
        resolved: false,
        votes: {},
        createdAt: new Date().toISOString(),
      };

      const trip = {
        id: 'trip-1',
        name: 'Test Trip',
        destination: 'Paris',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        travelers: [],
        events: [decision],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      useTripStore.setState({ trips: [trip] });

      await store.deleteDecision('trip-1', 'decision-1');

      const updatedTrip = useTripStore.getState().trips[0];
      expect(updatedTrip.events).toHaveLength(0);
    });
  });
});
