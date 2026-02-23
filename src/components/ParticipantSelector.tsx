import { Traveler } from '../types';

interface ParticipantSelectorProps {
  travelers: Traveler[];
  selectedParticipants?: string[]; // undefined/empty = everyone
  onChange: (participants: string[]) => void;
}

/**
 * Participant selector for events.
 * Renders "Everyone" toggle + individual traveler buttons.
 * Manages the logic of toggling between everyone/subset modes.
 */
export default function ParticipantSelector({
  travelers,
  selectedParticipants = [],
  onChange,
}: ParticipantSelectorProps) {
  if (travelers.length === 0) return null;

  const isEveryoneMode = selectedParticipants.length === 0;

  const handleToggleTraveler = (travelerId: string) => {
    const isSelected = selectedParticipants.includes(travelerId);
    const updated = isSelected
      ? selectedParticipants.filter(id => id !== travelerId)
      : [...selectedParticipants, travelerId];
    
    // If we end up selecting everyone, reset to empty array (everyone mode)
    onChange(updated.length === travelers.length ? [] : updated);
  };

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#6b7280' }}>
        Participants
      </label>
      
      <div className="flex flex-wrap gap-2">
        {/* Everyone button */}
        <ParticipantButton
          emoji="👥"
          label="Everyone"
          isSelected={isEveryoneMode}
          onClick={() => onChange([])}
        />

        {/* Individual travelers */}
        {travelers.map(traveler => (
          <TravelerButton
            key={traveler.id}
            traveler={traveler}
            isSelected={selectedParticipants.includes(traveler.id) && !isEveryoneMode}
            disabled={isEveryoneMode}
            onClick={() => handleToggleTraveler(traveler.id)}
          />
        ))}
      </div>

      <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
        Select "Everyone" or choose specific travelers for this event
      </p>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ParticipantButtonProps {
  emoji: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function ParticipantButton({ emoji, label, isSelected, onClick }: ParticipantButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
      style={{
        border: `2px solid ${isSelected ? '#10b981' : '#2a2a2a'}`,
        backgroundColor: isSelected ? '#10b98120' : '#1e1e1e',
        color: isSelected ? '#10b981' : '#9ca3af',
      }}
    >
      <span className="text-base">{emoji}</span>
      {label}
    </button>
  );
}

interface TravelerButtonProps {
  traveler: Traveler;
  isSelected: boolean;
  disabled: boolean;
  onClick: () => void;
}

function TravelerButton({ traveler, isSelected, disabled, onClick }: TravelerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        border: `2px solid ${isSelected ? traveler.color : '#2a2a2a'}`,
        backgroundColor: isSelected ? `${traveler.color}20` : '#1e1e1e',
        color: isSelected ? traveler.color : '#9ca3af',
      }}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
        style={{ backgroundColor: traveler.color }}
      >
        {traveler.emoji || traveler.name.charAt(0).toUpperCase()}
      </span>
      {traveler.name}
    </button>
  );
}
