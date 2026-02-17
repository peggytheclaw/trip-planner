import React from 'react';
import { Plus } from 'lucide-react';

interface BetweenIndicatorProps {
  type: 'travel' | 'meal-gap' | 'overnight' | 'free' | 'add';
  label?: string;
  onAdd?: () => void;
  showAdd?: boolean;
}

export default function BetweenIndicator({ type, label, onAdd, showAdd }: BetweenIndicatorProps) {
  const content = () => {
    switch (type) {
      case 'travel':
        return (
          <span className="text-xs text-gray-400 font-medium px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
            {label}
          </span>
        );
      case 'meal-gap':
        return (
          <span className="text-xs font-medium px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
            🍽️ {label ?? 'No meal planned!'}
          </span>
        );
      case 'overnight':
        return (
          <span className="text-xs text-purple-500 font-medium px-3 py-1 bg-purple-50 rounded-full border border-purple-100">
            🌙 {label}
          </span>
        );
      case 'free':
        return (
          <span className="text-xs text-gray-400 italic px-3 py-1">
            {label ?? 'Free time'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2 py-1 group/between">
      {/* Vertical connector line */}
      <div className="flex flex-col items-center self-stretch ml-4">
        <div className="flex-1 w-px bg-gray-200" />
      </div>

      <div className="flex-1 flex items-center gap-2 py-0.5 pl-2">
        {content()}
      </div>

      {/* Add button */}
      {showAdd && (
        <button
          onClick={onAdd}
          className="w-6 h-6 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center
                     text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50
                     opacity-0 group-hover/between:opacity-100 transition-all mr-2"
          title="Insert event here"
        >
          <Plus size={12} />
        </button>
      )}
    </div>
  );
}

// A simple add-between button shown between events
export function AddBetweenButton({ onAdd, label }: { onAdd: () => void; label?: string }) {
  return (
    <div className="flex items-center justify-center py-1 group/add">
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 px-3 py-1 rounded-full
                   hover:bg-blue-50 border border-transparent hover:border-blue-100
                   opacity-0 group-hover/add:opacity-100 transition-all"
      >
        <Plus size={12} />
        {label ?? 'Add event'}
      </button>
    </div>
  );
}
