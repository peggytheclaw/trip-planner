import React from 'react';

interface DayDividerProps {
  label: string;
  date: string;
  mealGap?: { hasMealGap: boolean; mealType: string };
  hotelName?: string;
}

export default function DayDivider({ label, date, mealGap, hotelName }: DayDividerProps) {
  return (
    <div className="py-1">
      {/* Day header */}
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 h-px bg-gray-200" />
        <div className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">
          {label}
        </div>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Staying at hotel indicator */}
      {hotelName && (
        <div className="flex items-center justify-center gap-1.5 py-1">
          <span className="text-xs text-purple-500 font-medium">🌙 Staying at {hotelName}</span>
        </div>
      )}
    </div>
  );
}
