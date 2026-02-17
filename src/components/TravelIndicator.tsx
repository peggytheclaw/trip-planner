import { motion } from 'framer-motion';
import { Plus, AlertTriangle, Moon } from 'lucide-react';
import type { TravelEstimate } from '../utils/travelTimeUtils';

interface TravelIndicatorProps {
  estimate: TravelEstimate | null;
  onAddEvent?: () => void;
  showAdd?: boolean;
}

export default function TravelIndicator({ estimate, onAddEvent, showAdd = true }: TravelIndicatorProps) {
  // Overnight stay — render nothing (handled by DayDivider hotel pill)
  if (estimate?.isOvernight) return null;

  return (
    <div className="flex items-center gap-3 py-1 group/travel relative">
      {/* Vertical line */}
      <div className="absolute left-3.5 top-0 bottom-0 w-px bg-white/5 pointer-events-none" />

      <div className="flex-1 flex items-center gap-2 pl-8">
        {estimate?.isGap ? (
          <GapWarning estimate={estimate} />
        ) : estimate ? (
          <TravelPill estimate={estimate} />
        ) : (
          <div className="h-4" /> // spacer
        )}
      </div>

      {/* Add between button */}
      {showAdd && (
        <motion.button
          onClick={onAddEvent}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="opacity-0 group-hover/travel:opacity-100 flex items-center gap-1.5 text-xs text-white/30
                     hover:text-emerald-400 px-2.5 py-1 rounded-full hover:bg-white/5 transition-all
                     border border-transparent hover:border-white/10"
        >
          <Plus size={11} />
          insert
        </motion.button>
      )}
    </div>
  );
}

function TravelPill({ estimate }: { estimate: TravelEstimate }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-white/40 font-medium
                    bg-white/[0.04] border border-white/[0.07] rounded-full px-3 py-1">
      <span>{estimate.emoji}</span>
      <span>{estimate.label}</span>
      {estimate.distanceKm > 0 && (
        <span className="text-white/20">· {estimate.distanceKm} km</span>
      )}
    </div>
  );
}

function GapWarning({ estimate }: { estimate: TravelEstimate }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs font-semibold
                    bg-amber-500/10 border border-amber-500/20 text-amber-400/80
                    rounded-full px-3 py-1">
      <AlertTriangle size={11} />
      <span>Gap — {estimate.label}</span>
    </div>
  );
}

// ─── Overnight indicator ───────────────────────────────────────────────────────
export function OvernightIndicator({ hotelName }: { hotelName?: string }) {
  return (
    <div className="flex items-center gap-3 py-2 px-1">
      <div className="flex items-center gap-2 text-xs text-purple-400/70 font-medium
                      bg-purple-500/5 border border-purple-500/10 rounded-full px-3 py-1.5">
        <Moon size={11} />
        <span>{hotelName ? `Staying at ${hotelName}` : 'Overnight stay'}</span>
      </div>
    </div>
  );
}

// ─── Meal gap nudge ────────────────────────────────────────────────────────────
export function MealNudge({ mealType }: { mealType: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs font-medium
                    bg-amber-500/8 border border-amber-500/15 text-amber-400/70
                    rounded-full px-3 py-1 my-1">
      <span>🍽️</span>
      <span>No {mealType} planned</span>
    </div>
  );
}
