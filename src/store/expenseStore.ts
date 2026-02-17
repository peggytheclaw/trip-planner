import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Expense, Settlement } from '../types';
import { sampleExpenses, SAMPLE_TRIP_ID } from '../data/sampleTrip';

function generateId(): string {
  return 'exp-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface ExpenseStore {
  expenses: Expense[];
  settlements: Record<string, Settlement[]>; // key: tripId

  // Getters
  getExpensesByTrip: (tripId: string) => Expense[];
  getSettlementsByTrip: (tripId: string) => Settlement[];

  // Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Settlements
  setSettlements: (tripId: string, settlements: Settlement[]) => void;
  markSettled: (tripId: string, settlementId: string) => void;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: sampleExpenses,
      settlements: {},

      getExpensesByTrip: (tripId) =>
        get().expenses.filter(e => e.tripId === tripId),

      getSettlementsByTrip: (tripId) =>
        get().settlements[tripId] ?? [],

      addExpense: (data) => {
        const expense: Expense = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set(state => ({ expenses: [...state.expenses, expense] }));
        return expense;
      },

      updateExpense: (id, updates) => {
        set(state => ({
          expenses: state.expenses.map(e => e.id === id ? { ...e, ...updates } : e),
        }));
      },

      deleteExpense: (id) => {
        set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
      },

      setSettlements: (tripId, settlements) => {
        set(state => ({
          settlements: { ...state.settlements, [tripId]: settlements },
        }));
      },

      markSettled: (tripId, settlementId) => {
        set(state => ({
          settlements: {
            ...state.settlements,
            [tripId]: (state.settlements[tripId] ?? []).map(s =>
              s.id === settlementId ? { ...s, settled: true } : s
            ),
          },
        }));
      },
    }),
    {
      name: 'trip-planner-expenses',
    }
  )
);
