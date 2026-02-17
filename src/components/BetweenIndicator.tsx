import React from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { TripEvent } from '../types';
import { getTravelTime, inferTravelMode, hasLargeTimeGap, TRAVEL_MODE_EMOJI } from '../utils/mapUtils';

interface BetweenIndicatorProps {
  type: 'travel' | 'meal-gap' | 'overnight' | 'free' | 'add' | 'travel-time';
  label?: string;
  onAdd?: () => void;
  showAdd?: boolean;
  fromEvent?: TripEvent;
  toEvent?: TripEvent;
}

export default function BetweenIndicator({ type, label, onAdd, showAdd, fromEvent, toEvent }: BetweenIndicatorProps) {
  const content = () => {
    // Travel time pill between consecutive events
    if (type === 'travel-time' && fromEvent && toEvent) {
      const mode = inferTravelMode(fromEvent, toEvent);
      const emoji = TRAVEL_MODE_EMOJI[mode];
      const isLargeGap = hasLargeTimeGap(fromEvent, toEvent);

      // Check for transport/train events that already cover this leg
      if (fromEvent.type === 'transport' || fromEvent.type === 'train' ||
          toEvent.type === 'transport' || toEvent.type === 'train') {
        return null;
      }

      if (isLargeGap && mode !== 'flight') {
        return (
          <span
            className="text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5"
            style={{ backgroundColor: '#2a1a00', color: '#fbbf24', border: '1px solid #3a2a00' }}
          >
            <AlertTriangle size={11} />
            Large gap — missing transport?
          </span>
        );
      }

      if (fromEvent.lat && fromEvent.lng && toEvent.lat && toEvent.lng) {
        const timeStr = getTravelTime(fromEvent.lat, fromEvent.lng, toEvent.lat, toEvent.lng, mode);
        return (
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: '#141414', color: '#6b7280', border: '1px solid #1e1e1e' }}
          >
            {emoji} {timeStr} {mode === 'walk' ? 'walk' : mode === 'transit' ? 'transit' : mode === 'drive' ? 'drive' : ''}
          </span>
        );
      }

      return null;
    }

    switch (type) {
      case 'travel':
        return (
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: '#141414', color: '#6b7280', border: '1px solid #1e1e1e' }}
          >
            {label}
          </span>
        );
      case 'meal-gap':
        return (
          <span
            className="text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1"
            style={{ backgroundColor: '#1a1200', color: '#eab308', border: '1px solid #2a2000' }}
          >
            🍽️ {label ?? 'No meal planned!'}
          </span>
        );
      case 'overnight':
        return (
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: '#0f0a1a', color: '#8b5cf6', border: '1px solid #1a1030' }}
          >
            🌙 {label}
          </span>
        );
      case 'free':
        return (
          <span className="text-xs italic" style={{ color: '#6b7280' }}>
            {label ?? 'Free time'}
          </span>
        );
      default:
        return null;
    }
  };

  const pill = content();
  if (!pill) return null;

  return (
    <div className="flex items-center gap-2 py-1 group/between">
      {/* Vertical connector line */}
      <div className="flex flex-col items-center self-stretch ml-4">
        <div className="flex-1 w-px" style={{ backgroundColor: '#1e1e1e' }} />
      </div>

      <div className="flex-1 flex items-center gap-2 py-0.5 pl-2">
        {pill}
      </div>

      {/* Add button */}
      {showAdd && (
        <button
          onClick={onAdd}
          className="w-6 h-6 rounded-full flex items-center justify-center
                     opacity-0 group-hover/between:opacity-100 transition-all mr-2"
          style={{
            backgroundColor: '#141414',
            border: '2px dashed #3a3a3a',
            color: '#9ca3af',
          }}
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
        className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full
                   opacity-0 group-hover/add:opacity-100 transition-all"
        style={{ color: '#6b7280', border: '1px solid transparent' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.color = '#10b981';
          (e.currentTarget as HTMLElement).style.backgroundColor = '#0a2a1a';
          (e.currentTarget as HTMLElement).style.borderColor = '#0d3a22';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.color = '#6b7280';
          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
        }}
      >
        <Plus size={12} />
        {label ?? 'Add event'}
      </button>
    </div>
  );
}
