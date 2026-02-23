import { Users } from 'lucide-react';
import { Traveler } from '../types';

interface ParticipantAvatarsProps {
  participants?: string[]; // traveler IDs (undefined/empty = everyone)
  travelers: Traveler[];
  size?: 'sm' | 'md';
  showEveryoneLabel?: boolean;
}

/**
 * Shows participant avatars for an event.
 * - If participants is undefined/empty → shows "Everyone" or all avatars
 * - If participants is a subset → shows stacked avatars with hover tooltips
 */
export default function ParticipantAvatars({
  participants,
  travelers,
  size = 'sm',
  showEveryoneLabel = true,
}: ParticipantAvatarsProps) {
  // If no travelers, show nothing
  if (travelers.length === 0) return null;

  // Determine who's participating
  const isEveryone = !participants || participants.length === 0 || participants.length === travelers.length;
  const participatingTravelers = isEveryone
    ? travelers
    : travelers.filter(t => participants.includes(t.id));

  // Size configs
  const sizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-6 h-6 text-xs',
  };
  const iconSize = size === 'sm' ? 12 : 14;

  // If everyone, show subtle indicator
  if (isEveryone && showEveryoneLabel) {
    return (
      <div className="flex items-center gap-1 text-gray-400 text-xs">
        <Users size={iconSize} />
        <span>Everyone</span>
      </div>
    );
  }

  // Show stacked avatars
  return (
    <div className="flex items-center">
      {participatingTravelers.map((traveler, idx) => (
        <div
          key={traveler.id}
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold border-2 border-white ${
            idx > 0 ? '-ml-2' : ''
          }`}
          style={{ backgroundColor: traveler.color, zIndex: participatingTravelers.length - idx }}
          title={traveler.name}
        >
          {traveler.emoji || traveler.name.charAt(0).toUpperCase()}
        </div>
      ))}
      {!isEveryone && (
        <span className="ml-2 text-xs text-gray-500">
          {participatingTravelers.map(t => t.name).join(', ')}
        </span>
      )}
    </div>
  );
}
