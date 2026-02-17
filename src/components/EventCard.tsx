import { motion } from 'framer-motion';
import {
  Plane, Train,
  Clock, MapPin, Hash, Users, DollarSign, CheckCircle, AlertCircle,
  ChevronRight, Trash2, Edit3,
} from 'lucide-react';
import {
  TripEvent, FlightEvent, HotelEvent, RestaurantEvent,
  ActivityEvent, TransportEvent, TrainEvent, NoteEvent,
} from '../types';
import { EVENT_COLORS, EVENT_BG, formatTime, formatDate } from '../utils/itineraryUtils';

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
  const bg = EVENT_BG[event.type] ?? '#F9FAFB';

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      {/* Action buttons — appear on hover/touch */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {onEdit && (
          <button
            onClick={() => onEdit(event)}
            className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Edit3 size={13} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(event.id)}
            className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
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
        <span className="text-xs text-gray-400 font-medium">{event.airline}</span>
        <span className="ml-auto text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
          {event.flightNumber}
        </span>
      </div>
      {/* Route */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{event.fromAirport}</div>
          <div className="text-xs text-gray-500">{event.fromCity}</div>
          <div className="text-sm font-semibold text-gray-700 mt-1">
            {formatTime(event.departureTime)}
          </div>
        </div>
        <div className="flex-1 px-4 flex flex-col items-center">
          <div className="text-xs text-gray-400 mb-1">{event.duration}</div>
          <div className="relative w-full flex items-center">
            <div className="flex-1 h-px bg-gray-200" />
            <Plane size={14} className="text-gray-400 mx-1 rotate-0" />
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="text-xs text-gray-400 mt-1">{event.cabin ?? 'Economy'}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{event.toAirport}</div>
          <div className="text-xs text-gray-500">{event.toCity}</div>
          <div className="text-sm font-semibold text-gray-700 mt-1">
            {formatTime(event.arrivalTime)}
          </div>
          {event.arrivalDate !== event.date && (
            <div className="text-xs text-orange-500 font-medium">+1 day</div>
          )}
        </div>
      </div>
      {/* Details row */}
      <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
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
      <div className="font-bold text-gray-900 text-lg leading-tight mb-1">{event.hotelName}</div>
      {event.neighborhood && (
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <MapPin size={12} />
          {event.neighborhood}
          {event.address && ` · ${event.address}`}
        </div>
      )}
      <div className="flex gap-4 mt-2 text-sm">
        <div>
          <div className="text-xs text-gray-400">Check-in</div>
          <div className="font-semibold text-gray-700">{event.checkInTime}</div>
          <div className="text-xs text-gray-500">{formatDate(event.date)}</div>
        </div>
        <div className="w-px bg-gray-100" />
        <div>
          <div className="text-xs text-gray-400">Check-out</div>
          <div className="font-semibold text-gray-700">{event.checkOutTime}</div>
          <div className="text-xs text-gray-500">{formatDate(event.checkOutDate)}</div>
        </div>
        {event.numRooms && (
          <>
            <div className="w-px bg-gray-100" />
            <div>
              <div className="text-xs text-gray-400">Rooms</div>
              <div className="font-semibold text-gray-700">{event.numRooms}</div>
            </div>
          </>
        )}
      </div>
      {(event.pricePerNight || event.confirmationNumber) && (
        <div className="flex gap-3 mt-2 text-xs text-gray-500">
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
    ? <CheckCircle size={12} className="text-green-500" />
    : event.reservationStatus === 'pending'
    ? <AlertCircle size={12} className="text-yellow-500" />
    : null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
          🍽️ Dining
        </span>
        {event.cuisine && (
          <span className="text-xs text-gray-400">{event.cuisine}</span>
        )}
        {event.price && (
          <span className="ml-auto text-xs text-gray-500 font-medium">{event.price}</span>
        )}
      </div>
      <div className="font-bold text-gray-900 text-lg leading-tight mb-1">
        {event.restaurantName}
      </div>
      <div className="flex gap-3 text-sm text-gray-500 flex-wrap">
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
          color: event.reservationStatus === 'confirmed' ? '#10B981' : '#F59E0B'
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
          <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
            {event.category}
          </span>
        )}
      </div>
      <div className="font-bold text-gray-900 text-base leading-tight mb-1">
        {event.activityName}
      </div>
      <div className="flex gap-3 text-sm text-gray-500 flex-wrap mb-1">
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
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <DollarSign size={11} />
          {event.price === 0 ? 'Free entry' : `$${event.price} per person`}
        </div>
      )}
      {event.bookingInfo && (
        <div className="mt-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-2 py-1.5 leading-relaxed">
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
        {event.provider && <span className="text-xs text-gray-400">{event.provider}</span>}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-gray-800">{event.fromLocation}</span>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="font-semibold text-gray-800">{event.toLocation}</span>
      </div>
      <div className="flex gap-3 text-sm text-gray-500">
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
        {event.trainName && <span className="text-xs text-gray-500 font-medium">{event.trainName}</span>}
        {event.trainNumber && (
          <span className="ml-auto text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
            {event.trainNumber}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-bold text-gray-900">{event.fromStation}</div>
          <div className="text-sm font-medium text-gray-600">{formatTime(event.departureTime)}</div>
        </div>
        <div className="flex flex-col items-center px-3">
          <div className="relative w-16 flex items-center">
            <div className="flex-1 h-px bg-gray-200" />
            <Train size={14} className="text-gray-400 mx-1" />
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-gray-900">{event.toStation}</div>
          <div className="text-sm font-medium text-gray-600">{formatTime(event.arrivalTime)}</div>
        </div>
      </div>
      {(event.ticketClass || event.confirmationNumber) && (
        <div className="flex gap-3 text-xs text-gray-400">
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
        <div className="font-semibold text-gray-800 mb-1">{event.title}</div>
      )}
      <div className="text-sm text-gray-600 leading-relaxed">{event.content}</div>
    </div>
  );
}
