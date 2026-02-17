import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, X, Check, DollarSign, TrendingUp, PieChart, Users
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useExpenseStore } from '../store/expenseStore';
import { calculateSettlements, getTotalByTraveler, getTotalByCategory } from '../utils/expenseCalculator';
import { formatDate } from '../utils/itineraryUtils';
import ExpenseItem from '../components/ExpenseItem';
import { Expense, Traveler } from '../types';

const CATEGORY_OPTIONS = [
  { value: 'food', label: '🍽️ Food & Dining' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'hotel', label: '🏨 Accommodation' },
  { value: 'activities', label: '🎯 Activities' },
  { value: 'other', label: '📦 Other' },
];

const CATEGORY_COLORS: Record<string, string> = {
  food: '#F97316',
  transport: '#EAB308',
  hotel: '#8B5CF6',
  activities: '#10B981',
  other: '#6B7280',
};

type TabType = 'expenses' | 'settle' | 'summary';

export default function Expenses() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const trip = useTripStore(s => s.getTripById(tripId!));
  const {
    getExpensesByTrip, addExpense, deleteExpense,
    getSettlementsByTrip, setSettlements, markSettled,
  } = useExpenseStore();

  const [tab, setTab] = useState<TabType>('expenses');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    paidBy: trip?.travelers[0]?.id ?? '',
    splits: trip?.travelers.map(t => t.id) ?? [],
    category: 'food',
    date: new Date().toISOString().split('T')[0],
  });

  const expenses = getExpensesByTrip(tripId!);
  const travelers = trip?.travelers ?? [];

  // Calculate settlements whenever expenses change
  const settlements = useMemo(() => {
    const stored = getSettlementsByTrip(tripId!);
    if (stored.length === 0 && expenses.length > 0) {
      const calc = calculateSettlements(expenses, travelers);
      setSettlements(tripId!, calc);
      return calc;
    }
    return stored.length > 0 ? stored : calculateSettlements(expenses, travelers);
  }, [expenses, travelers]);

  const totals = useMemo(() =>
    travelers.map(t => ({ traveler: t, ...getTotalByTraveler(expenses, t.id) })),
    [expenses, travelers]
  );

  const categoryTotals = useMemo(() => getTotalByCategory(expenses), [expenses]);
  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0);

  const updateForm = (key: string, value: any) => setForm(p => ({ ...p, [key]: value }));

  const toggleSplit = (travelerId: string) => {
    setForm(p => ({
      ...p,
      splits: p.splits.includes(travelerId)
        ? p.splits.filter(id => id !== travelerId)
        : [...p.splits, travelerId],
    }));
  };

  const handleAddExpense = () => {
    if (!form.description || !form.amount || form.splits.length === 0) return;
    const amount = parseFloat(form.amount);
    const perPerson = Math.round((amount / form.splits.length) * 100) / 100;
    addExpense({
      tripId: tripId!,
      description: form.description,
      amount,
      paidBy: form.paidBy,
      splits: form.splits.map(id => ({ travelerId: id, amount: perPerson, settled: false })),
      category: form.category as any,
      date: form.date,
    });
    // Recalculate
    const newExpenses = [...expenses, {
      id: 'temp', tripId: tripId!, description: form.description, amount,
      paidBy: form.paidBy,
      splits: form.splits.map(id => ({ travelerId: id, amount: perPerson, settled: false })),
      category: form.category as any, date: form.date, createdAt: '',
    }];
    setSettlements(tripId!, calculateSettlements(newExpenses, travelers));
    setShowAdd(false);
    setForm({ description: '', amount: '', paidBy: travelers[0]?.id ?? '', splits: travelers.map(t => t.id), category: 'food', date: new Date().toISOString().split('T')[0] });
  };

  if (!trip) return <div className="p-8 text-center text-gray-500">Trip not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/trip/${tripId}`)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="font-bold text-gray-900">Expenses</h1>
              <p className="text-xs text-gray-400">{trip.name}</p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="ml-auto flex items-center gap-1.5 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-xl"
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 bg-gray-100 p-1 rounded-xl">
            {([
              { id: 'expenses', label: '🧾 Expenses' },
              { id: 'settle', label: '⚖️ Settle Up' },
              { id: 'summary', label: '📊 Summary' },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 pb-24">
        {/* Summary card */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-4 mb-5 text-white">
          <div className="text-xs opacity-70 mb-1">Total Trip Cost</div>
          <div className="text-3xl font-bold">${grandTotal.toFixed(2)}</div>
          <div className="text-sm opacity-70 mt-1">
            ${travelers.length > 0 ? (grandTotal / travelers.length).toFixed(2) : '0'} per person · {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* EXPENSES TAB */}
        {tab === 'expenses' && (
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">💸</div>
                <h3 className="font-semibold text-gray-700">No expenses yet</h3>
                <p className="text-sm text-gray-400 mt-1">Add your first expense</p>
              </div>
            ) : (
              expenses.map(expense => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  travelers={travelers}
                  onDelete={id => { deleteExpense(id); setSettlements(tripId!, calculateSettlements(expenses.filter(e => e.id !== id), travelers)); }}
                />
              ))
            )}
          </div>
        )}

        {/* SETTLE UP TAB */}
        {tab === 'settle' && (
          <div className="space-y-4">
            {/* Per-person balances */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Balances</h3>
              {totals.map(({ traveler, paid, owes, net }) => (
                <div key={traveler.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: traveler.color }}
                  >
                    {traveler.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 text-sm">{traveler.name}</div>
                    <div className="text-xs text-gray-400">
                      Paid ${paid.toFixed(2)} · Owes ${owes.toFixed(2)}
                    </div>
                  </div>
                  <div className={`font-bold text-sm ${net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {net >= 0 ? '+' : ''}{net.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Settlement transactions */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Transactions to settle ({settlements.filter(s => !s.settled).length} remaining)
              </h3>
              {settlements.length === 0 ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">✅</div>
                  <div className="text-sm font-semibold text-green-700">All settled up!</div>
                </div>
              ) : (
                settlements.map(s => {
                  const from = travelers.find(t => t.id === s.from);
                  const to = travelers.find(t => t.id === s.to);
                  return (
                    <motion.div
                      key={s.id}
                      className={`bg-white rounded-xl border p-3 flex items-center gap-3 ${s.settled ? 'opacity-50 border-gray-100' : 'border-gray-100'}`}
                      animate={{ opacity: s.settled ? 0.5 : 1 }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: from?.color ?? '#6B7280' }}
                      >
                        {from?.name.charAt(0)}
                      </div>
                      <div className="flex-1 text-sm">
                        <span className="font-semibold text-gray-800">{from?.name}</span>
                        <span className="text-gray-400"> owes </span>
                        <span className="font-semibold text-gray-800">{to?.name}</span>
                        <span className="font-bold text-gray-900"> ${s.amount.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => markSettled(tripId!, s.id)}
                        disabled={s.settled}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                          s.settled
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {s.settled ? <><Check size={12} className="inline mr-1" />Settled</> : 'Mark Settled'}
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* SUMMARY TAB */}
        {tab === 'summary' && (
          <div className="space-y-4">
            {/* Category breakdown */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">By Category</h3>
              <div className="space-y-2">
                {Object.entries(categoryTotals).map(([category, amount]) => {
                  const pct = grandTotal > 0 ? (amount / grandTotal) * 100 : 0;
                  const color = CATEGORY_COLORS[category] ?? '#6B7280';
                  return (
                    <div key={category} className="bg-white rounded-xl border border-gray-100 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 capitalize">{
                          CATEGORY_OPTIONS.find(c => c.value === category)?.label ?? category
                        }</span>
                        <span className="font-bold text-gray-900">${amount.toFixed(2)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{pct.toFixed(1)}% of total</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per-person totals */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Per Person</h3>
              <div className="space-y-2">
                {totals.map(({ traveler, paid, owes }) => (
                  <div key={traveler.id} className="bg-white rounded-xl border border-gray-100 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: traveler.color }}>
                        {traveler.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">{traveler.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <div className="text-gray-400">Total paid</div>
                        <div className="font-bold text-gray-900">${paid.toFixed(2)}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <div className="text-gray-400">Fair share</div>
                        <div className="font-bold text-gray-900">${owes.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Sheet */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowAdd(false)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h2 className="text-lg font-bold">Add Expense</h2>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={e => updateForm('description', e.target.value)}
                    placeholder="Dinner at Ichiran..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
                {/* Amount */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Amount ($)</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => updateForm('amount', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
                {/* Paid by */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Paid by</label>
                  <div className="flex gap-2 flex-wrap">
                    {travelers.map(t => (
                      <button
                        key={t.id}
                        onClick={() => updateForm('paidBy', t.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                          form.paidBy === t.id
                            ? 'border-current text-white'
                            : 'border-gray-200 text-gray-500 bg-white'
                        }`}
                        style={form.paidBy === t.id ? { backgroundColor: t.color, borderColor: t.color } : {}}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Split between */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                    Split between ({form.splits.length} people · ${form.amount ? (parseFloat(form.amount) / form.splits.length).toFixed(2) : '0'} each)
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {travelers.map(t => (
                      <button
                        key={t.id}
                        onClick={() => toggleSplit(t.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                          form.splits.includes(t.id)
                            ? 'text-white'
                            : 'border-gray-200 text-gray-400 bg-white opacity-50'
                        }`}
                        style={form.splits.includes(t.id) ? { backgroundColor: t.color, borderColor: t.color } : {}}
                      >
                        {form.splits.includes(t.id) && <Check size={12} />}
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORY_OPTIONS.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => updateForm('category', cat.value)}
                        className={`text-xs py-2 px-2 rounded-xl border-2 font-medium text-center transition-all ${
                          form.category === cat.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-100 text-gray-500 bg-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Date */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => updateForm('date', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
              </div>
              <div className="px-5 py-4 border-t border-gray-100">
                <button
                  onClick={handleAddExpense}
                  disabled={!form.description || !form.amount || form.splits.length === 0}
                  className="w-full bg-gray-900 text-white py-3.5 rounded-2xl font-semibold disabled:opacity-40 hover:bg-gray-800 transition-colors"
                >
                  Add Expense
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
