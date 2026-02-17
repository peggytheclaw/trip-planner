import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, X, Check, DollarSign,
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useExpenseStore } from '../store/expenseStore';
import { calculateSettlements, getTotalByTraveler, getTotalByCategory } from '../utils/expenseCalculator';
import { formatDate } from '../utils/itineraryUtils';
import ExpenseItem from '../components/ExpenseItem';
import { toast } from '../components/Toast';

const CATEGORY_OPTIONS = [
  { value: 'food',       label: '🍽️ Food & Dining' },
  { value: 'transport',  label: '🚗 Transport' },
  { value: 'hotel',      label: '🏨 Accommodation' },
  { value: 'activities', label: '🎯 Activities' },
  { value: 'other',      label: '📦 Other' },
];

const CATEGORY_COLORS: Record<string, string> = {
  food:       '#F97316',
  transport:  '#EAB308',
  hotel:      '#8B5CF6',
  activities: '#10B981',
  other:      '#6B7280',
};

type TabType = 'expenses' | 'settle' | 'summary';

// ── Helpers ────────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white";
const inputSty = { backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a' };

// ── Main Component ─────────────────────────────────────────────────────────────

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

  const travelers = trip?.travelers ?? [];

  const defaultForm = () => ({
    description: '',
    amount: '',
    paidBy: travelers[0]?.id ?? '',
    splits: travelers.map(t => t.id),
    category: 'food',
    date: new Date().toISOString().split('T')[0],
  });

  const [form, setForm] = useState(defaultForm);

  const expenses = getExpensesByTrip(tripId!);

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
    const newExpense = addExpense({
      tripId: tripId!,
      description: form.description,
      amount,
      paidBy: form.paidBy,
      splits: form.splits.map(id => ({ travelerId: id, amount: perPerson, settled: false })),
      category: form.category as any,
      date: form.date,
    });
    const newExpenses = [...expenses, newExpense];
    setSettlements(tripId!, calculateSettlements(newExpenses, travelers));
    setShowAdd(false);
    setForm(defaultForm());
    toast.success('Expense saved ✓');
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    setSettlements(tripId!, calculateSettlements(expenses.filter(e => e.id !== id), travelers));
  };

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <p className="text-gray-400">Trip not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: '#0a0a0a', borderBottom: '1px solid #1a1a1a' }}>
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/trip/${tripId}`)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#1a1a1a', color: '#9ca3af' }}>
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="font-bold text-white">Expenses</h1>
              <p className="text-xs" style={{ color: '#6b7280' }}>{trip.name}</p>
            </div>
            <button
              onClick={() => { setForm(defaultForm()); setShowAdd(true); }}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white"
              style={{ backgroundColor: '#10b981' }}
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 p-1 rounded-xl" style={{ backgroundColor: '#141414' }}>
            {([
              { id: 'expenses', label: '🧾 Expenses' },
              { id: 'settle',   label: '⚖️ Settle Up' },
              { id: 'summary',  label: '📊 Summary' },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={{
                  backgroundColor: tab === t.id ? '#10b981' : 'transparent',
                  color: tab === t.id ? '#ffffff' : '#6b7280',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 pb-24">
        {/* Summary card */}
        <div className="rounded-2xl p-4 mb-5 text-white"
          style={{ background: 'linear-gradient(135deg, #0f1a10 0%, #0a1a1a 100%)', border: '1px solid #1a2a1a' }}>
          <div className="text-xs mb-1" style={{ color: '#6b7280' }}>Total Trip Cost</div>
          <div className="text-3xl font-bold" style={{ color: '#10b981' }}>${grandTotal.toFixed(2)}</div>
          <div className="text-sm mt-1" style={{ color: '#6b7280' }}>
            ${travelers.length > 0 ? (grandTotal / travelers.length).toFixed(2) : '0'} per person · {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* EXPENSES TAB */}
        {tab === 'expenses' && (
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">💸</div>
                <h3 className="font-semibold mb-1 text-white">No expenses yet</h3>
                <p className="text-sm mb-5" style={{ color: '#6b7280' }}>Track spending and split costs with your travel crew</p>
                <button
                  onClick={() => { setForm(defaultForm()); setShowAdd(true); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: '#10b981' }}
                >
                  <Plus size={16} />
                  Add First Expense
                </button>
              </div>
            ) : (
              expenses.map(expense => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  travelers={travelers}
                  onDelete={handleDeleteExpense}
                />
              ))
            )}
          </div>
        )}

        {/* SETTLE UP TAB */}
        {tab === 'settle' && (
          <div className="space-y-5">
            {/* Per-person balances */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Balances</h3>
              {travelers.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: '#6b7280' }}>
                  Add travelers in Trip Settings to track balances
                </p>
              ) : (
                totals.map(({ traveler, paid, owes, net }) => (
                  <div key={traveler.id}
                    className="rounded-xl p-3 flex items-center gap-3"
                    style={{ backgroundColor: '#141414', border: '1px solid #242424' }}>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: traveler.color }}
                    >
                      {traveler.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">{traveler.name}</div>
                      <div className="text-xs" style={{ color: '#6b7280' }}>
                        Paid ${paid.toFixed(2)} · Owes ${owes.toFixed(2)}
                      </div>
                    </div>
                    <div
                      className="font-bold text-sm"
                      style={{ color: net >= 0 ? '#10b981' : '#ef4444' }}
                    >
                      {net >= 0 ? '+' : ''}${net.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Settlement transactions */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                Transactions to settle ({settlements.filter(s => !s.settled).length} remaining)
              </h3>
              {settlements.length === 0 ? (
                <div className="rounded-xl p-4 text-center"
                  style={{ backgroundColor: '#0a1a0a', border: '1px solid #10b98130' }}>
                  <div className="text-2xl mb-1">✅</div>
                  <div className="text-sm font-semibold" style={{ color: '#10b981' }}>All settled up!</div>
                </div>
              ) : (
                settlements.map(s => {
                  const from = travelers.find(t => t.id === s.from);
                  const to = travelers.find(t => t.id === s.to);
                  return (
                    <motion.div
                      key={s.id}
                      className="rounded-xl p-3 flex items-center gap-3"
                      style={{
                        backgroundColor: '#141414',
                        border: '1px solid #242424',
                        opacity: s.settled ? 0.5 : 1,
                      }}
                      animate={{ opacity: s.settled ? 0.5 : 1 }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: from?.color ?? '#6B7280' }}
                      >
                        {from?.name.charAt(0)}
                      </div>
                      <div className="flex-1 text-sm">
                        <span className="font-semibold text-white">{from?.name}</span>
                        <span style={{ color: '#6b7280' }}> owes </span>
                        <span className="font-semibold text-white">{to?.name}</span>
                        <span className="font-bold" style={{ color: '#10b981' }}> ${s.amount.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => {
                          markSettled(tripId!, s.id);
                          toast.success('Marked as settled ✓');
                        }}
                        disabled={s.settled}
                        className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                        style={s.settled
                          ? { backgroundColor: '#1a1a1a', color: '#4b5563' }
                          : { backgroundColor: '#10b98120', color: '#10b981', border: '1px solid #10b98140' }
                        }
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
          <div className="space-y-5">
            {/* Category breakdown */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6b7280' }}>By Category</h3>
              {Object.keys(categoryTotals).length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: '#6b7280' }}>No expenses to summarize yet</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(categoryTotals).map(([category, amount]) => {
                    const pct = grandTotal > 0 ? (amount / grandTotal) * 100 : 0;
                    const color = CATEGORY_COLORS[category] ?? '#6B7280';
                    return (
                      <div key={category} className="rounded-xl p-3"
                        style={{ backgroundColor: '#141414', border: '1px solid #242424' }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-white capitalize">{
                            CATEGORY_OPTIONS.find(c => c.value === category)?.label ?? category
                          }</span>
                          <span className="font-bold text-white">${(amount as number).toFixed(2)}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                        <div className="text-xs mt-1" style={{ color: '#6b7280' }}>{pct.toFixed(1)}% of total</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Per-person totals */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6b7280' }}>Per Person</h3>
              <div className="space-y-2">
                {totals.map(({ traveler, paid, owes }) => (
                  <div key={traveler.id} className="rounded-xl p-3"
                    style={{ backgroundColor: '#141414', border: '1px solid #242424' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: traveler.color }}>
                        {traveler.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-white text-sm">{traveler.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg px-2.5 py-1.5" style={{ backgroundColor: '#0f0f0f' }}>
                        <div style={{ color: '#6b7280' }}>Total paid</div>
                        <div className="font-bold text-white">${paid.toFixed(2)}</div>
                      </div>
                      <div className="rounded-lg px-2.5 py-1.5" style={{ backgroundColor: '#0f0f0f' }}>
                        <div style={{ color: '#6b7280' }}>Fair share</div>
                        <div className="font-bold text-white">${owes.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Expense Sheet ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              onClick={() => setShowAdd(false)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col"
              style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#2a2a2a' }} />
              </div>
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #242424' }}>
                <h2 className="text-lg font-bold text-white">Add Expense</h2>
                <button onClick={() => setShowAdd(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#1a1a1a', color: '#9ca3af' }}>
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Description */}
                <div>
                  <FieldLabel>Description</FieldLabel>
                  <input type="text" value={form.description}
                    onChange={e => updateForm('description', e.target.value)}
                    placeholder="Dinner at Ichiran..."
                    className={inputCls} style={inputSty}
                  />
                </div>

                {/* Amount */}
                <div>
                  <FieldLabel>Amount ($)</FieldLabel>
                  <input type="number" value={form.amount}
                    onChange={e => updateForm('amount', e.target.value)}
                    placeholder="0.00" step="0.01"
                    className={inputCls} style={inputSty}
                  />
                </div>

                {/* Paid by */}
                {travelers.length > 0 && (
                  <div>
                    <FieldLabel>Paid by</FieldLabel>
                    <div className="flex gap-2 flex-wrap">
                      {travelers.map(t => (
                        <button key={t.id} onClick={() => updateForm('paidBy', t.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                          style={{
                            backgroundColor: form.paidBy === t.id ? t.color : '#1a1a1a',
                            border: `2px solid ${form.paidBy === t.id ? t.color : '#2a2a2a'}`,
                            color: form.paidBy === t.id ? '#fff' : '#9ca3af',
                          }}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Split between */}
                {travelers.length > 0 && (
                  <div>
                    <FieldLabel>
                      Split between ({form.splits.length} people · ${form.amount ? (parseFloat(form.amount) / Math.max(form.splits.length, 1)).toFixed(2) : '0'} each)
                    </FieldLabel>
                    <div className="flex gap-2 flex-wrap">
                      {travelers.map(t => (
                        <button key={t.id} onClick={() => toggleSplit(t.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                          style={{
                            backgroundColor: form.splits.includes(t.id) ? t.color : '#1a1a1a',
                            border: `2px solid ${form.splits.includes(t.id) ? t.color : '#2a2a2a'}`,
                            color: form.splits.includes(t.id) ? '#fff' : '#6b7280',
                            opacity: form.splits.includes(t.id) ? 1 : 0.6,
                          }}
                        >
                          {form.splits.includes(t.id) && <Check size={12} />}
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category */}
                <div>
                  <FieldLabel>Category</FieldLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORY_OPTIONS.map(cat => {
                      const selected = form.category === cat.value;
                      const col = CATEGORY_COLORS[cat.value] ?? '#6b7280';
                      return (
                        <button key={cat.value} onClick={() => updateForm('category', cat.value)}
                          className="text-xs py-2 px-2 rounded-xl font-medium text-center transition-all"
                          style={{
                            border: `2px solid ${selected ? col : '#242424'}`,
                            backgroundColor: selected ? col + '22' : '#1a1a1a',
                            color: selected ? col : '#6b7280',
                          }}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <FieldLabel>Date</FieldLabel>
                  <input type="date" value={form.date}
                    onChange={e => updateForm('date', e.target.value)}
                    className={inputCls} style={{ ...inputSty, colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div className="px-5 py-4" style={{ borderTop: '1px solid #242424' }}>
                <button
                  onClick={handleAddExpense}
                  disabled={!form.description || !form.amount || form.splits.length === 0}
                  className="w-full py-3.5 rounded-2xl font-semibold text-white transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: '#10b981' }}
                >
                  Save Expense
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
