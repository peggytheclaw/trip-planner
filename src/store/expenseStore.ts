import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { ExpenseRow } from '../lib/supabase';
import { Expense, Settlement, ExpenseSplit } from '../types';

// ─── Conversion ──────────────────────────────────────────────────────────────

function rowToExpense(row: ExpenseRow, tripId: string): Expense {
  // split_between stores: [{ travelerId, amount, settled }]
  type RawSplit = { travelerId?: string; amount?: number; settled?: boolean };
  const rawSplits = (row.split_between ?? []) as unknown as RawSplit[];
  const splits: ExpenseSplit[] = rawSplits.map(s => ({
    travelerId: s.travelerId ?? '',
    amount: s.amount ?? 0,
    settled: s.settled ?? false,
  }));

  return {
    id: row.id,
    tripId,
    description: row.description,
    amount: Number(row.amount),
    currency: row.currency,
    paidBy: row.paid_by_traveler_id ?? '',
    splits,
    category: row.category as Expense['category'],
    date: row.date ?? new Date().toISOString().split('T')[0],
    createdAt: row.created_at,
  };
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface ExpenseStore {
  expenses: Expense[];
  settlements: Record<string, Settlement[]>;

  // Getters
  getExpensesByTrip: (tripId: string) => Expense[];
  getSettlementsByTrip: (tripId: string) => Settlement[];

  // Lifecycle
  loadExpenses: (tripId: string) => Promise<void>;

  // Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<Expense>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Settlements (local only for now, settlements are calculated from expenses)
  setSettlements: (tripId: string, settlements: Settlement[]) => void;
  markSettled: (tripId: string, settlementId: string) => void;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  settlements: {},

  getExpensesByTrip: (tripId) =>
    get().expenses.filter(e => e.tripId === tripId),

  getSettlementsByTrip: (tripId) =>
    get().settlements[tripId] ?? [],

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  loadExpenses: async (tripId: string) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const loaded = (data ?? []).map(row => rowToExpense(row, tripId));
      set(state => ({
        expenses: [
          ...state.expenses.filter(e => e.tripId !== tripId),
          ...loaded,
        ],
      }));
    } catch (err) {
      console.error('loadExpenses error:', err);
    }
  },

  // ── Actions ────────────────────────────────────────────────────────────────

  addExpense: async (expenseData) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        trip_id: expenseData.tripId,
        description: expenseData.description,
        amount: expenseData.amount,
        currency: expenseData.currency ?? 'USD',
        category: expenseData.category ?? 'other',
        date: expenseData.date || null,
        paid_by_traveler_id: expenseData.paidBy || null,
        split_between: expenseData.splits ?? [],
        settled: false,
      })
      .select()
      .single();

    if (error) throw error;

    const expense = rowToExpense(data, expenseData.tripId);
    set(state => ({ expenses: [...state.expenses, expense] }));
    return expense;
  },

  updateExpense: async (id, updates) => {
    set(state => ({
      expenses: state.expenses.map(e => e.id === id ? { ...e, ...updates } : e),
    }));

    const dbUpdates: Record<string, unknown> = {};
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.date !== undefined) dbUpdates.date = updates.date || null;
    if (updates.paidBy !== undefined) dbUpdates.paid_by_traveler_id = updates.paidBy || null;
    if (updates.splits !== undefined) dbUpdates.split_between = updates.splits;

    if (Object.keys(dbUpdates).length) {
      const { error } = await supabase.from('expenses').update(dbUpdates).eq('id', id);
      if (error) console.error('updateExpense error:', error);
    }
  },

  deleteExpense: async (id) => {
    set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));

    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) console.error('deleteExpense error:', error);
  },

  // ── Settlements ────────────────────────────────────────────────────────────

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
}));
