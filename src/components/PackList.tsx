import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Package } from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from './Toast';

interface PackItem {
  id: string;
  text: string;
  checked: boolean;
  addedBy?: string;
}

interface PackListStore {
  lists: Record<string, PackItem[]>; // key: tripId
  addItem: (tripId: string, text: string, addedBy?: string) => void;
  toggleItem: (tripId: string, itemId: string) => void;
  deleteItem: (tripId: string, itemId: string) => void;
  clearChecked: (tripId: string) => void;
}

export const usePackListStore = create<PackListStore>()(
  persist(
    (set, get) => ({
      lists: {},

      addItem: (tripId, text, addedBy) => {
        const item: PackItem = {
          id: Date.now().toString(),
          text: text.trim(),
          checked: false,
          addedBy,
        };
        set(state => ({
          lists: {
            ...state.lists,
            [tripId]: [...(state.lists[tripId] ?? []), item],
          },
        }));
      },

      toggleItem: (tripId, itemId) => {
        set(state => ({
          lists: {
            ...state.lists,
            [tripId]: (state.lists[tripId] ?? []).map(item =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          },
        }));
      },

      deleteItem: (tripId, itemId) => {
        set(state => ({
          lists: {
            ...state.lists,
            [tripId]: (state.lists[tripId] ?? []).filter(item => item.id !== itemId),
          },
        }));
      },

      clearChecked: (tripId) => {
        set(state => ({
          lists: {
            ...state.lists,
            [tripId]: (state.lists[tripId] ?? []).filter(item => !item.checked),
          },
        }));
      },
    }),
    { name: 'wanderplan-packlist' }
  )
);

// ─── Quick-add suggestions ─────────────────────────────────────────────────────

const QUICK_ADD_SUGGESTIONS = [
  { label: 'Passport', icon: '🛂' },
  { label: 'Travel insurance docs', icon: '📄' },
  { label: 'Phone charger', icon: '🔌' },
  { label: 'Power adapter', icon: '🔋' },
  { label: 'Headphones', icon: '🎧' },
  { label: 'Sunscreen', icon: '🧴' },
  { label: 'First aid kit', icon: '🩹' },
  { label: 'Local currency', icon: '💵' },
  { label: 'Portable battery pack', icon: '🔋' },
  { label: 'Camera', icon: '📷' },
];

interface PackListProps {
  tripId: string;
}

export default function PackList({ tripId }: PackListProps) {
  const { lists, addItem, toggleItem, deleteItem, clearChecked } = usePackListStore();
  const [input, setInput] = useState('');

  const items = lists[tripId] ?? [];
  const checkedCount = items.filter(i => i.checked).length;
  const unchecked = items.filter(i => !i.checked);
  const checked = items.filter(i => i.checked);

  const handleAdd = () => {
    if (!input.trim()) return;
    addItem(tripId, input);
    setInput('');
  };

  const handleQuickAdd = (label: string) => {
    addItem(tripId, label);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package size={15} style={{ color: '#10b981' }} />
          <h3 className="font-semibold text-white">Pack List</h3>
          {items.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: '#1a1a1a', color: '#6b7280', border: '1px solid #2a2a2a' }}>
              {checkedCount}/{items.length}
            </span>
          )}
        </div>
        {checkedCount > 0 && (
          <button
            onClick={() => clearChecked(tripId)}
            className="text-xs transition-colors"
            style={{ color: '#6b7280' }}
          >
            Clear packed
          </button>
        )}
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: '#10b981' }}
            initial={{ width: 0 }}
            animate={{ width: `${items.length > 0 ? (checkedCount / items.length) * 100 : 0}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      {/* Add input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add item..."
          className="flex-1 rounded-xl px-3 py-2 text-sm outline-none text-white"
          style={{ backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a' }}
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: '#10b981' }}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Quick add suggestions */}
      {items.length === 0 && (
        <div className="mb-4">
          <p className="text-xs mb-2" style={{ color: '#6b7280' }}>Quick add essentials:</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ADD_SUGGESTIONS.map(s => (
              <button
                key={s.label}
                onClick={() => handleQuickAdd(s.label)}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition-colors"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#9ca3af' }}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items — unchecked */}
      <div className="space-y-1.5">
        <AnimatePresence>
          {unchecked.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12, height: 0 }}
              className="flex items-center gap-2.5 py-1.5 group"
            >
              <button
                onClick={() => toggleItem(tripId, item.id)}
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ border: '2px solid #3a3a3a' }}
              />
              <span className="flex-1 text-sm" style={{ color: '#d1d5db' }}>{item.text}</span>
              <button
                onClick={() => deleteItem(tripId, item.id)}
                className="opacity-0 group-hover:opacity-100 transition-all"
                style={{ color: '#4b5563' }}
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Packed section */}
        {checked.length > 0 && (
          <div className="pt-2 mt-2" style={{ borderTop: '1px solid #1a1a1a' }}>
            <p className="text-xs mb-1.5 font-medium" style={{ color: '#4b5563' }}>Packed ✓</p>
            <AnimatePresence>
              {checked.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2.5 py-1.5 group opacity-40"
                >
                  <button
                    onClick={() => toggleItem(tripId, item.id)}
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    <Check size={11} className="text-white" />
                  </button>
                  <span className="flex-1 text-sm line-through" style={{ color: '#6b7280' }}>{item.text}</span>
                  <button
                    onClick={() => deleteItem(tripId, item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: '#4b5563' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {items.length === 0 && (
          <p className="text-sm text-center py-4 italic" style={{ color: '#4b5563' }}>
            Your pack list is empty — add items above
          </p>
        )}
      </div>
    </div>
  );
}
