import React from 'react';
import { Trash2 } from 'lucide-react';
import { Expense, Traveler } from '../types';
import { formatDate } from '../utils/itineraryUtils';

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍽️',
  transport: '🚗',
  hotel: '🏨',
  activities: '🎯',
  other: '📦',
};

const CATEGORY_COLORS: Record<string, string> = {
  food: '#F97316',
  transport: '#EAB308',
  hotel: '#8B5CF6',
  activities: '#10B981',
  other: '#6B7280',
};

interface ExpenseItemProps {
  expense: Expense;
  travelers: Traveler[];
  onDelete?: (id: string) => void;
}

export default function ExpenseItem({ expense, travelers, onDelete }: ExpenseItemProps) {
  const payer = travelers.find(t => t.id === expense.paidBy);
  const color = CATEGORY_COLORS[expense.category] ?? '#6B7280';

  return (
    <div className="rounded-xl p-3 flex items-start gap-3 group"
      style={{ backgroundColor: '#141414', border: '1px solid #242424' }}>
      {/* Category icon */}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
        style={{ backgroundColor: color + '18' }}>
        {CATEGORY_ICONS[expense.category] ?? '📦'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium text-white text-sm leading-tight">{expense.description}</span>
          <span className="font-bold text-white text-sm whitespace-nowrap">${expense.amount.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs flex-wrap" style={{ color: '#6b7280' }}>
          <span className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payer?.color ?? '#6B7280' }} />
            Paid by {payer?.name ?? 'Unknown'}
          </span>
          <span>·</span>
          <span>Split {expense.splits.length} ways</span>
          <span>·</span>
          <span>{formatDate(expense.date)}</span>
        </div>
        {/* Per-person breakdown */}
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          {expense.splits.map(split => {
            const traveler = travelers.find(t => t.id === split.travelerId);
            return (
              <span key={split.travelerId}
                className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: (traveler?.color ?? '#6B7280') + '22',
                  color: traveler?.color ?? '#6B7280',
                }}>
                {traveler?.name ?? '?'} ${split.amount.toFixed(0)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Delete — always visible on mobile */}
      {onDelete && (
        <button
          onClick={() => onDelete(expense.id)}
          className="opacity-40 group-hover:opacity-100 transition-opacity mt-0.5"
          style={{ color: '#ef4444' }}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
