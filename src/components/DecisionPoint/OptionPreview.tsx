import { TripEvent } from '../../types';
import {
  Plane,
  Building2,
  Utensils,
  Star,
  Train,
  Car,
  FileText,
} from 'lucide-react';

interface OptionPreviewProps {
  events: TripEvent[];
  compact?: boolean;
}

const EVENT_ICONS = {
  flight: Plane,
  hotel: Building2,
  restaurant: Utensils,
  activity: Star,
  train: Train,
  transport: Car,
  note: FileText,
  decision: FileText, // Shouldn't happen but safe default
};

const EVENT_COLORS = {
  flight: '#3B82F6',
  hotel: '#8B5CF6',
  restaurant: '#F97316',
  activity: '#10B981',
  train: '#EC4899',
  transport: '#6366F1',
  note: '#6B7280',
  decision: '#6B7280',
};

export function OptionPreview({ events, compact = false }: OptionPreviewProps) {
  if (events.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic py-2">
        No events in this option
      </div>
    );
  }

  return (
    <div className={`space-y-${compact ? '1' : '1.5'}`}>
      {events.map((event, index) => {
        const Icon = EVENT_ICONS[event.type];
        const color = EVENT_COLORS[event.type];

        return (
          <div
            key={`${event.id || index}`}
            className={`flex items-center gap-2 rounded-lg bg-gray-50 ${
              compact ? 'px-2 py-1' : 'px-2.5 py-2'
            } border border-gray-100`}
          >
            <div
              className={`flex-shrink-0 ${
                compact ? 'w-5 h-5' : 'w-6 h-6'
              } rounded-md flex items-center justify-center`}
              style={{ backgroundColor: `${color}18` }}
            >
              <Icon size={compact ? 10 : 12} style={{ color }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-gray-900 truncate ${
                compact ? 'text-[10px]' : 'text-xs'
              }`}>
                {event.title}
              </div>
              {!compact && event.time && (
                <div className="text-[10px] text-gray-400">
                  {event.time}
                </div>
              )}
            </div>

            {compact && event.time && (
              <div className="flex-shrink-0 text-[9px] text-gray-400 font-medium">
                {event.time}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
