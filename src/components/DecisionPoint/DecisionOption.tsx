import { DecisionOption as DecisionOptionType } from '../../types';
import { OptionPreview } from './OptionPreview';
import { Check } from 'lucide-react';

interface DecisionOptionProps {
  option: DecisionOptionType;
  selected: boolean;
  votes?: number;
  showVotes: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export function DecisionOption({
  option,
  selected,
  votes = 0,
  showVotes,
  onSelect,
  disabled = false,
}: DecisionOptionProps) {
  const borderColor = option.color || '#3B82F6';

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        relative w-full text-left rounded-2xl border-2 transition-all
        ${selected 
          ? 'border-opacity-100 shadow-lg scale-[1.02]' 
          : 'border-opacity-20 hover:border-opacity-40 hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        bg-white p-4
      `}
      style={{ borderColor }}
    >
      {/* Selected checkmark */}
      {selected && (
        <div
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md"
          style={{ backgroundColor: borderColor }}
        >
          <Check size={16} className="text-white" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {option.emoji && (
          <div className="text-2xl flex-shrink-0">{option.emoji}</div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base leading-tight">
            {option.title}
          </h3>
          {option.description && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {option.description}
            </p>
          )}
        </div>
      </div>

      {/* Vote count badge */}
      {showVotes && votes > 0 && (
        <div className="mb-3">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${borderColor}15`,
              color: borderColor,
            }}
          >
            <span>{votes}</span>
            <span className="text-[10px]">{votes === 1 ? 'vote' : 'votes'}</span>
          </div>
        </div>
      )}

      {/* Event preview */}
      {option.events.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">
            {option.events.length} {option.events.length === 1 ? 'event' : 'events'}
          </div>
          <OptionPreview events={option.events} compact />
        </div>
      )}
    </button>
  );
}
