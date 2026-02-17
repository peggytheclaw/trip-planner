import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Package } from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// ─── Default suggestions by category ─────────────────────────────────────────

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
  const [showSuggestions, setShowSuggestions] = useState(false);

  const items = lists[tripId] ?? [];
  const checkedCount = items.filter(i => i.checked).length;
  const unchecked = items.filter(i => !i.checked);
  const checked = items.filter(i => i.checked);

  const handleAdd = () => {
    if (!input.trim()) return;
    addItem(tripId, input);
    setInput('');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package size={15} className="text-gray-500" />
          <h3 className="font-semibold text-gray-800">Pack List</h3>
          {items.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
              {checkedCount}/{items.length}
            </span>
          )}
        </div>
        {checkedCount > 0 && (
          <button
            onClick={() => clearChecked(tripId)}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            Clear packed
          </button>
        )}
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-green-500 rounded-full"
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
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-gray-800"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Quick add suggestions */}
      {items.length === 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Quick add essentials:</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ADD_SUGGESTIONS.map(s => (
              <button
                key={s.label}
                onClick={() => addItem(tripId, s.label)}
                className="flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
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
                className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0
                           hover:border-green-400 transition-colors"
              />
              <span className="flex-1 text-sm text-gray-700">{item.text}</span>
              <button
                onClick={() => deleteItem(tripId, item.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Packed section */}
        {checked.length > 0 && (
          <div className="pt-2 border-t border-gray-100 mt-2">
            <p className="text-xs text-gray-400 mb-1.5 font-medium">Packed ✓</p>
            <AnimatePresence>
              {checked.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2.5 py-1.5 group opacity-50"
                >
                  <button
                    onClick={() => toggleItem(tripId, item.id)}
                    className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                  >
                    <Check size={11} className="text-white" />
                  </button>
                  <span className="flex-1 text-sm text-gray-400 line-through">{item.text}</span>
                  <button
                    onClick={() => deleteItem(tripId, item.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4 italic">
            Your pack list is empty — add items above
          </p>
        )}
      </div>
    </div>
  );
}
