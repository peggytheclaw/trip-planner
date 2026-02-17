import React from 'react';
import { TripEvent } from '../types';
import DayMap from './DayMap';

interface DayDividerProps {
  label: string;
  date: string;
  hotelName?: string;
  events?: TripEvent[];
}

export default function DayDivider({ label, date: _date, hotelName, events = [] }: DayDividerProps) {
  const eventsWithCoords = events.filter(e => e.lat && e.lng);
  const showMap = eventsWithCoords.length > 0;

  return (
    <div className="pt-4 pb-2">
      {/* Day map strip */}
      {showMap && (
        <div className="mb-3 rounded-xl overflow-hidden" style={{ border: '1px solid #1a1a1a' }}>
          <DayMap events={events} height={180} />
        </div>
      )}

      {/* Day header pill */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px" style={{ backgroundColor: '#1a1a1a' }} />
        <div
          className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap text-white"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          {label}
        </div>
        <div className="flex-1 h-px" style={{ backgroundColor: '#1a1a1a' }} />
      </div>

      {/* Staying at hotel indicator */}
      {hotelName && (
        <div className="flex items-center justify-center gap-1.5 py-1">
          <span className="text-xs font-medium" style={{ color: '#8b5cf6' }}>🌙 Staying at {hotelName}</span>
        </div>
      )}
    </div>
  );
}
