import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plane, Train,
  Clock, MapPin, Hash, Users, DollarSign, CheckCircle, AlertCircle,
  ChevronRight, Trash2, Edit3, Map,
} from 'lucide-react';
import {
  TripEvent, FlightEvent, HotelEvent, RestaurantEvent,
  ActivityEvent, TransportEvent, TrainEvent, NoteEvent,
} from '../types';
import { EVENT_COLORS, formatTime, formatDate } from '../utils/itineraryUtils';
import MapThumbnail from './MapThumbnail';

interface EventCardProps {
  event: TripEvent;
  onEdit?: (event: TripEvent) => void;
  onDelete?: (eventId: string) => void;
  index?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: [0.0, 0.0, 0.2, 1] as any },
  }),
} as any;

export default function EventCard({ event, onEdit, onDelete, index = 0 }: EventCardProps) {
  const color = EVENT_COLORS[event.type] ?? '#6B7280';
  const [showMap, setShowMap] = useState(false);
  const hasLocation = !!(event.lat && event.lng);
  const showMapByDefault = hasLocation && (
    event.type === 'hotel' || event.type === 'restaurant' || event.type === 'activity'
  );

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className="relative overflow-hidden group cursor-pointer"
      style={{
        backgroundColor: '#141414',
        border: '1px solid #242424',
        borderLeft: `4px solid ${color}`,
        borderRadius: '12px',
      }}
    >
      {/* Action buttons — appear on hover/touch */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {hasLocation && (
          <button
            onClick={() => setShowMap(v => !v)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: showMap ? color + '30' : '#242424',
              color: showMap ? color : '#9ca3af',
            }}
            title={showMap ? 'Hide map' : 'Show map'}
          >
            <Map size={13} />
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(event)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            style={{ backgroundColor: '#242424' }}
          >
            <Edit3 size={13} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(event.id)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
            style={{ backgroundColor: '#242424' }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="p-4">
        {event.type === 'flight' && <FlightCard event={event as FlightEvent} color={color} />}
        {event.type === 'hotel' && <HotelCard event={event as HotelEvent} color={color} />}
        {event.type === 'restaurant' && <RestaurantCard event={event as RestaurantEvent} color={color} />}
        {event.type === 'activity' && <ActivityCard event={event as ActivityEvent} color={color} />}
        {event.type === 'transport' && <TransportCard event={event as TransportEvent} color={color} />}
        {event.type === 'train' && <TrainCard event={event as TrainEvent} color={color} />}
        {event.type === 'note' && <NoteCard event={event as NoteEvent} color={color} />}
      </div>

      {/* Map thumbnail — shown by default for location-based events, togglable */}
      {hasLocation && (showMapByDefault || showMap) && (
        <div className="border-t" style={{ borderColor: '#242424' }}>
          <MapThumbnail
            lat={event.lat!}
            lng={event.lng!}
            label={event.title}
            color={color}
            height={150}
          />
        </div>
      )}
    </motion.div>
  );
}

// ─── Flight Card ──────────────────────────────────────────────────────────────

function FlightCard({ event, color }: { event: FlightEvent; color: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
          ✈️ Flight
        </span>
        <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>{event.airline}</span>
        <span
          className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: color + '20', color }}
        >
          {event.flightNumber}
        </span>
      </div>
      {/* Route */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{event.fromAirport}</div>
          <div className="text-xs" style={{ color: '#9ca3af' }}>{event.fromCity}</div>
          <div className="text-sm font-semibold text-white mt-1">{formatTime(event.departureTime)}</div>
        </div>
        <div className="flex-1 px-4 flex flex-col items-center">
          <div className="text-xs mb-1" style={{ color: '#6b7280' }}>{event.duration}</div>
          <div className="relative w-full flex items-center">
            <div className="flex-1 h-px" style={{ backgroundColor: '#3a3a3a' }} />
            <Plane size={14} className="mx-1" style={{ color: '#9ca3af' }} />
            <div className="flex-1 h-px" style={{ backgroundColor: '#3a3a3a' }} />
          </div>
          <div className="text-xs mt-1" style={{ color: '#6b7280' }}>{event.cabin ?? 'Economy'}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{event.toAirport}</div>
          <div className="text-xs" style={{ color: '#9ca3af' }}>{event.toCity}</div>
          <div className="text-sm font-semibold text-white mt-1">{formatTime(event.arrivalTime)}</div>
          {event.arrivalDate !== event.date && (
            <div className="text-xs font-medium mt-0.5" style={{ color: '#f97316' }}>+1 day</div>
          )}
        </div>
      </div>
      {/* Details row */}
      <div className="flex gap-3 text-xs flex-wrap" style={{ color: '#6b7280' }}>
        {event.confirmationNumber && (
          <span className="flex items-center gap-1">
            <Hash size={11} />
            {event.confirmationNumber}
          </span>
        )}
        {event.seatInfo && (
          <span className="flex items-center gap-1">
            <Users size={11} />
            {event.seatInfo}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Hotel Card ───────────────────────────────────────────────────────────────

function HotelCard({ event, color }: { event: HotelEvent; color: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
          🏨 {event.isCheckout ? 'Check-Out' : 'Hotel Check-In'}
        </span>
      </div>
      <div className="font-bold text-white text-lg leading-tight mb-1">{event.hotelName}</div>
      {event.neighborhood && (
        <div className="flex items-center gap-1 text-sm mb-2" style={{ color: '#9ca3af' }}>
          <MapPin size={12} />
          {event.neighborhood}
          {event.address && ` · ${event.address}`}
        </div>
      )}
      <div className="flex gap-4 mt-2 text-sm">
        <div>
          <div className="text-xs" style={{ color: '#6b7280' }}>Check-in</div>
          <div className="font-semibold text-white">{event.checkInTime}</div>
          <div className="text-xs" style={{ color: '#6b7280' }}>{formatDate(event.date)}</div>
        </div>
        <div className="w-px" style={{ backgroundColor: '#2a2a2a' }} />
        <div>
          <div className="text-xs" style={{ color: '#6b7280' }}>Check-out</div>
          <div className="font-semibold text-white">{event.checkOutTime}</div>
          <div className="text-xs" style={{ color: '#6b7280' }}>{formatDate(event.checkOutDate)}</div>
        </div>
        {event.numRooms && (
          <>
            <div className="w-px" style={{ backgroundColor: '#2a2a2a' }} />
            <div>
              <div className="text-xs" style={{ color: '#6b7280' }}>Rooms</div>
              <div className="font-semibold text-white">{event.numRooms}</div>
            </div>
          </>
        )}
      </div>
      {(event.pricePerNight || event.confirmationNumber) && (
        <div className="flex gap-3 mt-2 text-xs" style={{ color: '#6b7280' }}>
          {event.pricePerNight && (
            <span className="flex items-center gap-1">
              <DollarSign size={11} />
              ${event.pricePerNight}/night · ${event.totalPrice ?? ''} total
            </span>
          )}
          {event.confirmationNumber && (
            <span className="flex items-center gap-1">
              <Hash size={11} />
              {event.confirmationNumber}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Restaurant Card ──────────────────────────────────────────────────────────

function RestaurantCard({ event, color }: { event: RestaurantEvent; color: string }) {
  const statusIcon = event.reservationStatus === 'confirmed'
    ? <CheckCircle size={12} style={{ color: '#10b981' }} />
    : event.reservationStatus === 'pending'
    ? <AlertCircle size={12} style={{ color: '#eab308' }} />
    : null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
          🍽️ Dining
        </span>
        {event.cuisine && (
          <span className="text-xs" style={{ color: '#9ca3af' }}>{event.cuisine}</span>
        )}
        {event.price && (
          <span className="ml-auto text-xs font-medium" style={{ color: '#9ca3af' }}>{event.price}</span>
        )}
      </div>
      <div className="font-bold text-white text-lg leading-tight mb-1">
        {event.restaurantName}
      </div>
      <div className="flex gap-3 text-sm flex-wrap" style={{ color: '#9ca3af' }}>
        {event.time && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatTime(event.time)}
            {event.duration && ` · ${event.duration}`}
          </span>
        )}
        {event.address && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {event.address}
          </span>
        )}
      </div>
      {event.reservationStatus && event.reservationStatus !== 'none' && (
        <div className="flex items-center gap-1 mt-2 text-xs font-medium" style={{
          color: event.reservationStatus === 'confirmed' ? '#10b981' : '#eab308'
        }}>
          {statusIcon}
          Reservation {event.reservationStatus}
        </div>
      )}
    </div>
  );
}

// ─── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({ event, color }: { event: ActivityEvent; color: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
          🎯 Activity
        </span>
        {event.category && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: color + '20', color }}
          >
            {event.category}
          </span>
        )}
      </div>
      <div className="font-bold text-white text-base leading-tight mb-1">
        {event.activityName}
      </div>
      <div className="flex gap-3 text-sm flex-wrap mb-1" style={{ color: '#9ca3af' }}>
        {event.time && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatTime(event.time)}
            {event.duration && ` · ${event.duration}`}
          </span>
        )}
        {event.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {event.location}
          </span>
        )}
      </div>
      {event.price !== undefined && event.price !== null && (
        <div className="text-xs flex items-center gap-1" style={{ color: '#6b7280' }}>
          <DollarSign size={11} />
          {event.price === 0 ? 'Free entry' : `$${event.price} per person`}
        </div>
      )}
      {event.bookingInfo && (
        <div
          className="mt-2 text-xs rounded-lg px-2 py-1.5 leading-relaxed"
          style={{ backgroundColor: '#1a1a1a', color: '#9ca3af', border: '1px solid #2a2a2a' }}
        >
          {event.bookingInfo}
        </div>
      )}
    </div>
  );
}

// ─── Transport Card ───────────────────────────────────────────────────────────

function TransportCard({ event, color }: { event: TransportEvent; color: string }) {
  const typeLabels: Record<string, string> = {
    car: '🚗 Car', taxi: '🚕 Taxi', bus: '🚌 Bus',
    subway: '🚇 Subway', ferry: '⛴️ Ferry', other: '🚐 Transport',
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
          {typeLabels[event.transportType] ?? '🚗 Transport'}
        </span>
        {event.provider && <span className="text-xs" style={{ color: '#9ca3af' }}>{event.provider}</span>}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-white">{event.fromLocation}</span>
        <ChevronRight size={16} style={{ color: '#6b7280' }} />
        <span className="font-semibold text-white">{event.toLocation}</span>
      </div>
      <div className="flex gap-3 text-sm" style={{ color: '#9ca3af' }}>
        {event.time && <span className="flex items-center gap-1"><Clock size={12} />{formatTime(event.time)}</span>}
        {event.duration && <span>{event.duration}</span>}
        {event.cost !== undefined && event.cost > 0 && (
          <span className="flex items-center gap-1"><DollarSign size={11} />${event.cost}</span>
        )}
      </div>
    </div>
  );
}

// ─── Train Card ───────────────────────────────────────────────────────────────

function TrainCard({ event, color }: { event: TrainEvent; color: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
          🚂 Train
        </span>
        {event.trainName && <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>{event.trainName}</span>}
        {event.trainNumber && (
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: color + '20', color }}
          >
            {event.trainNumber}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-bold text-white">{event.fromStation}</div>
          <div className="text-sm font-medium" style={{ color: '#9ca3af' }}>{formatTime(event.departureTime)}</div>
        </div>
        <div className="flex flex-col items-center px-3">
          <div className="relative w-16 flex items-center">
            <div className="flex-1 h-px" style={{ backgroundColor: '#3a3a3a' }} />
            <Train size={14} className="mx-1" style={{ color: '#9ca3af' }} />
            <div className="flex-1 h-px" style={{ backgroundColor: '#3a3a3a' }} />
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-white">{event.toStation}</div>
          <div className="text-sm font-medium" style={{ color: '#9ca3af' }}>{formatTime(event.arrivalTime)}</div>
        </div>
      </div>
      {(event.ticketClass || event.confirmationNumber) && (
        <div className="flex gap-3 text-xs" style={{ color: '#6b7280' }}>
          {event.ticketClass && <span>{event.ticketClass}</span>}
          {event.confirmationNumber && (
            <span className="flex items-center gap-1"><Hash size={11} />{event.confirmationNumber}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Note Card ────────────────────────────────────────────────────────────────

function NoteCard({ event, color }: { event: NoteEvent; color: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
          📝 Note
        </span>
      </div>
      {event.title && (
        <div className="font-semibold text-white mb-1">{event.title}</div>
      )}
      <div className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>{event.content}</div>
    </div>
  );
}
