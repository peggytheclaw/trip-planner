import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plane, Train, Clock, MapPin, Hash, DollarSign,
  CheckCircle, ChevronRight, Trash2, Edit3, Map,
  Building2, Utensils, Star, Car, FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  TripEvent, FlightEvent, HotelEvent, RestaurantEvent,
  ActivityEvent, TransportEvent, TrainEvent, NoteEvent, Traveler,
} from '../types';
import { formatTime, formatDate } from '../utils/itineraryUtils';
import { EVENT_COORDS } from '../utils/eventCoordinates';
import MiniMap from './MiniMap';
import ParticipantAvatars from './ParticipantAvatars';

// ─── Color map (accent left border + icon bg tint) ────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  flight:     '#3b82f6',
  hotel:      '#8b5cf6',
  restaurant: '#f97316',
  activity:   '#10b981',
  transport:  '#f59e0b',
  train:      '#f59e0b',
  note:       '#6b7280',
};
const TYPE_ICON_COMPONENT: Record<string, LucideIcon> = {
  flight: Plane,
  hotel: Building2,
  restaurant: Utensils,
  activity: Star,
  transport: Car,
  train: Train,
  note: FileText,
};
const TYPE_LABEL: Record<string, string> = {
  flight: 'FLIGHT', hotel: 'HOTEL', restaurant: 'DINING',
  activity: 'ACTIVITY', transport: 'TRANSPORT', train: 'TRAIN', note: 'NOTE',
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] as any },
  }),
} as any;

interface EventCardProps {
  event: TripEvent;
  travelers?: Traveler[];
  onEdit?: (e: TripEvent) => void;
  onDelete?: (id: string) => void;
  index?: number;
}

export default function EventCard({ event, travelers = [], onEdit, onDelete, index = 0 }: EventCardProps) {
  const color = TYPE_COLOR[event.type] ?? '#6b7280';
  const coords = EVENT_COORDS[event.id];

  // Auto-show map for restaurants and activities that have coords
  const autoShowMap = coords && (event.type === 'restaurant' || event.type === 'activity');
  const [showMap, setShowMap] = useState(!!autoShowMap);

  // Activity cover photo
  const coverPhoto = event.type === 'activity' ? (event as ActivityEvent).coverPhoto : undefined;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className="relative rounded-2xl overflow-hidden group"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${color}`,
      }}
    >
      {/* Activity hero image — full width at top */}
      {coverPhoto && (
        <div className="relative w-full overflow-hidden" style={{ height: 120 }}>
          <img
            src={coverPhoto}
            alt=""
            className="w-full h-full object-cover"
            style={{ borderRadius: '0' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Gradient overlay — dark at bottom */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)' }}
          />
        </div>
      )}

      {/* Action buttons — always visible (small on mobile, larger on hover/desktop) */}
      <div className="absolute top-3 right-3 flex gap-1 z-10">
        {coords && (
          <button
            onClick={() => setShowMap(v => !v)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            title="Toggle map"
          >
            <Map size={12} style={{ color: showMap ? color : 'rgba(255,255,255,0.35)' }} />
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(event)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            title="Edit"
          >
            <Edit3 size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(event.id)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-red-500/20 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            title="Delete"
          >
            <Trash2 size={12} style={{ color: 'rgba(239,68,68,0.5)' }} />
          </button>
        )}
      </div>

      {/* Card content */}
      <div className="p-4">
        {event.type === 'flight'     && <FlightCard    event={event as FlightEvent}     color={color} travelers={travelers} />}
        {event.type === 'hotel'      && <HotelCard     event={event as HotelEvent}      color={color} travelers={travelers} />}
        {event.type === 'restaurant' && <RestaurantCard event={event as RestaurantEvent} color={color} travelers={travelers} />}
        {event.type === 'activity'   && <ActivityCard  event={event as ActivityEvent}   color={color} travelers={travelers} />}
        {event.type === 'transport'  && <TransportCard event={event as TransportEvent}  color={color} travelers={travelers} />}
        {event.type === 'train'      && <TrainCard     event={event as TrainEvent}      color={color} travelers={travelers} />}
        {event.type === 'note'       && <NoteCard      event={event as NoteEvent}       color={color} travelers={travelers} />}

        {/* Description — shared across all types */}
        {event.description && (
          <p
            className="text-sm leading-relaxed mt-3"
            style={{ color: 'var(--text-3)', fontStyle: 'italic' }}
          >
            {event.description}
          </p>
        )}
      </div>

      {/* Mini map — auto-shown for restaurant/activity, toggled for others */}
      {showMap && coords && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 116, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4">
            <MiniMap lat={coords[0]} lng={coords[1]} zoom={14} height={100} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function TypeBadge({ type, color }: { type: string; color: string }) {
  const Icon = TYPE_ICON_COMPONENT[type];
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em]"
      style={{ color: color + 'cc' }}>
      {Icon && <Icon size={11} />}
      {TYPE_LABEL[type]}
    </span>
  );
}

function DetailRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 flex-wrap mt-2" style={{ color: 'var(--text-3)', fontSize: '12px' }}>
      {children}
    </div>
  );
}

function DetailChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-1">
      {icon}
      <span>{text}</span>
    </span>
  );
}

// ─── Flight ───────────────────────────────────────────────────────────────────
function FlightCard({ event, color, travelers = [] }: { event: FlightEvent; color: string; travelers?: Traveler[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <TypeBadge type="flight" color={color} />
        <div className="flex items-center gap-2">
          <ParticipantAvatars participants={event.participants} travelers={travelers} size="sm" />
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${color}22`, color }}>
            {event.flightNumber}
          </span>
        </div>
      </div>
      {/* Big route */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-4xl font-black tracking-tighter leading-none"
            style={{ color: 'var(--text)' }}>{event.fromAirport}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{event.fromCity}</div>
          <div className="text-sm font-bold mt-1.5" style={{ color: 'var(--text-2)' }}>
            {formatTime(event.departureTime)}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center px-3">
          <div className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>{event.duration}</div>
          <div className="flex items-center w-full gap-1">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <Plane size={14} style={{ color }} />
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>
          <div className="text-[10px] mt-1.5 uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
            {event.cabin ?? 'Economy'}
          </div>
        </div>

        <div className="text-right">
          <div className="text-4xl font-black tracking-tighter leading-none"
            style={{ color: 'var(--text)' }}>{event.toAirport}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{event.toCity}</div>
          <div className="text-sm font-bold mt-1.5" style={{ color: 'var(--text-2)' }}>
            {formatTime(event.arrivalTime)}
            {event.arrivalDate !== event.date && (
              <span className="text-xs ml-1" style={{ color: '#f59e0b' }}>+1</span>
            )}
          </div>
        </div>
      </div>
      <DetailRow>
        {event.confirmationNumber && (
          <DetailChip icon={<Hash size={11} />} text={event.confirmationNumber} />
        )}
        {event.airline && <DetailChip icon={<Plane size={11} />} text={event.airline} />}
      </DetailRow>
    </div>
  );
}

// ─── Hotel ────────────────────────────────────────────────────────────────────
function HotelCard({ event, color, travelers = [] }: { event: HotelEvent; color: string; travelers?: Traveler[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <TypeBadge type="hotel" color={color} />
        {travelers.length > 0 && (
          <ParticipantAvatars participants={event.participants} travelers={travelers} size="sm" />
        )}
        {event.isCheckout && (
          <span className="text-[10px] font-semibold" style={{ color: 'var(--text-3)' }}>CHECK-OUT</span>
        )}
      </div>
      <div className="text-lg font-bold leading-tight mb-1" style={{ color: 'var(--text)' }}>
        {event.hotelName}
      </div>
      {event.neighborhood && (
        <div className="flex items-center gap-1 text-sm mb-1" style={{ color: 'var(--text-3)' }}>
          <MapPin size={12} />
          {event.neighborhood}
        </div>
      )}
      {event.neighborhoodDescription && (
        <p className="text-xs mb-2 leading-snug" style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>
          {event.neighborhoodDescription}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[
          { label: 'Check-in', val: event.checkInTime, sub: formatDate(event.date) },
          { label: 'Check-out', val: event.checkOutTime, sub: formatDate(event.checkOutDate) },
          ...(event.numRooms ? [{ label: 'Rooms', val: String(event.numRooms), sub: event.roomType ?? '' }] : []),
        ].map(({ label, val, sub }) => (
          <div key={label} className="rounded-xl p-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{label}</div>
            <div className="font-bold text-sm mt-0.5" style={{ color: 'var(--text)' }}>{val}</div>
            {sub && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>{sub}</div>}
          </div>
        ))}
      </div>
      {event.pricePerNight && (
        <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--text-3)' }}>
          <DollarSign size={11} />
          ${event.pricePerNight}/night · ${event.totalPrice} total
          {event.confirmationNumber && <> · <Hash size={11} />{event.confirmationNumber}</>}
        </div>
      )}
    </div>
  );
}

// ─── Restaurant ───────────────────────────────────────────────────────────────
function RestaurantCard({ event, color, travelers = [] }: { event: RestaurantEvent; color: string; travelers?: Traveler[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <TypeBadge type="restaurant" color={color} />
        {travelers.length > 0 && (
          <ParticipantAvatars participants={event.participants} travelers={travelers} size="sm" />
        )}
        {event.price && <span className="text-sm font-bold" style={{ color: 'var(--text-3)' }}>{event.price}</span>}
      </div>
      <div className="text-lg font-bold leading-tight" style={{ color: 'var(--text)' }}>
        {event.restaurantName}
      </div>
      {event.cuisine && (
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{event.cuisine}</div>
      )}
      <DetailRow>
        {event.time && <DetailChip icon={<Clock size={11} />} text={`${formatTime(event.time)}${event.duration ? ` · ${event.duration}` : ''}`} />}
        {event.address && <DetailChip icon={<MapPin size={11} />} text={event.address} />}
      </DetailRow>
      {event.reservationStatus === 'confirmed' && (
        <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold" style={{ color: '#10b981' }}>
          <CheckCircle size={11} />
          Reservation confirmed
        </div>
      )}
      {/* What to try callout */}
      {event.whatToTry && (
        <div
          className="mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs leading-relaxed"
          style={{ background: `rgba(249,115,22,0.1)`, border: '1px solid rgba(249,115,22,0.2)' }}
        >
          <span className="shrink-0 mt-0.5">🍴</span>
          <span style={{ color: '#fb923c' }}>
            <strong>Try the</strong> {event.whatToTry.replace(/^try the\s+/i, '')}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Activity ─────────────────────────────────────────────────────────────────
function ActivityCard({ event, color, travelers = [] }: { event: ActivityEvent; color: string; travelers?: Traveler[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <TypeBadge type="activity" color={color} />
        {event.category && (
          <span className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: `${color}18`, color: `${color}cc` }}>
            {event.category}
          </span>
        )}
        {travelers.length > 0 && (
          <div className="ml-auto">
            <ParticipantAvatars participants={event.participants} travelers={travelers} size="sm" />
          </div>
        )}
      </div>
      <div className="text-base font-bold leading-tight" style={{ color: 'var(--text)' }}>
        {event.activityName}
      </div>
      <DetailRow>
        {event.time && <DetailChip icon={<Clock size={11} />} text={`${formatTime(event.time)}${event.duration ? ` · ${event.duration}` : ''}`} />}
        {event.location && <DetailChip icon={<MapPin size={11} />} text={event.location} />}
      </DetailRow>
      {event.price !== undefined && (
        <div className="text-xs mt-1.5" style={{ color: 'var(--text-3)' }}>
          {event.price === 0 ? 'Free entry' : `$${event.price} per person`}
        </div>
      )}
      {event.bookingInfo && (
        <div className="mt-2 text-xs leading-relaxed rounded-xl p-2.5"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-3)', border: '1px solid var(--border-light)' }}>
          {event.bookingInfo}
        </div>
      )}
    </div>
  );
}

// ─── Transport ────────────────────────────────────────────────────────────────
function TransportCard({ event, color, travelers = [] }: { event: TransportEvent; color: string; travelers?: Traveler[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em]"
          style={{ color: color + 'cc' }}>
          <Car size={11} />
          {event.transportType.toUpperCase()}
        </span>
        {event.provider && <span className="text-xs" style={{ color: 'var(--text-3)' }}>{event.provider}</span>}
        {travelers.length > 0 && (
          <div className="ml-auto">
            <ParticipantAvatars participants={event.participants} travelers={travelers} size="sm" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--text)' }}>
        <span>{event.fromLocation}</span>
        <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
        <span>{event.toLocation}</span>
      </div>
      <DetailRow>
        {event.time && <DetailChip icon={<Clock size={11} />} text={formatTime(event.time)} />}
        {event.duration && <span>{event.duration}</span>}
        {event.cost && event.cost > 0 && <DetailChip icon={<DollarSign size={11} />} text={`$${event.cost}`} />}
      </DetailRow>
    </div>
  );
}

// ─── Train ────────────────────────────────────────────────────────────────────
function TrainCard({ event, color, travelers = [] }: { event: TrainEvent; color: string; travelers?: Traveler[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <TypeBadge type="train" color={color} />
        <div className="flex items-center gap-2">
          {travelers.length > 0 && (
            <ParticipantAvatars participants={event.participants} travelers={travelers} size="sm" />
          )}
          {event.trainNumber && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: `${color}22`, color }}>
              {event.trainNumber}
            </span>
          )}
        </div>
      </div>
      {event.trainName && (
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>{event.trainName}</div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold" style={{ color: 'var(--text)' }}>{event.fromStation}</div>
          <div className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-2)' }}>
            {formatTime(event.departureTime)}
          </div>
        </div>
        <div className="flex items-center gap-1 px-3">
          <div className="w-8 h-px" style={{ background: 'var(--border)' }} />
          <Train size={14} style={{ color }} />
          <div className="w-8 h-px" style={{ background: 'var(--border)' }} />
        </div>
        <div className="text-right">
          <div className="font-bold" style={{ color: 'var(--text)' }}>{event.toStation}</div>
          <div className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-2)' }}>
            {formatTime(event.arrivalTime)}
          </div>
        </div>
      </div>
      {event.ticketClass && (
        <div className="text-xs mt-1.5" style={{ color: 'var(--text-3)' }}>{event.ticketClass}</div>
      )}
    </div>
  );
}

// ─── Note ─────────────────────────────────────────────────────────────────────
function NoteCard({ event, color, travelers = [] }: { event: NoteEvent; color: string; travelers?: Traveler[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <TypeBadge type="note" color={color} />
        {travelers.length > 0 && (
          <ParticipantAvatars participants={event.participants} travelers={travelers} size="sm" />
        )}
      </div>
      {event.title && (
        <div className="font-semibold text-sm mt-2 mb-1" style={{ color: 'var(--text-2)' }}>{event.title}</div>
      )}
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>{event.content}</p>
    </div>
  );
}
