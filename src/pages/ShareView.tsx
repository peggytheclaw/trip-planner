import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plane, Train, Hotel, UtensilsCrossed, Zap, Car, FileText,
  MapPin, Clock, ChevronRight, Copy, Check, ExternalLink,
  Share2, Users, Calendar, ArrowRight, Hash, DollarSign,
  CheckCircle, Star,
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import {
  groupEventsByDay, formatTime, formatDate,
  getActiveHotel,
} from '../utils/itineraryUtils';
import {
  FlightEvent, HotelEvent, RestaurantEvent, ActivityEvent,
  TransportEvent, TrainEvent, NoteEvent, TripEvent, Trip, DayGroup,
} from '../types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useState, useEffect } from 'react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tripDuration(start: string, end: string): string {
  const nights = differenceInDays(parseISO(end), parseISO(start));
  if (nights <= 0) return '1 Day';
  return `${nights} Night${nights !== 1 ? 's' : ''}`;
}

function longDate(iso: string): string {
  return format(parseISO(iso), 'MMMM d, yyyy');
}

function shortDate(iso: string): string {
  return format(parseISO(iso), 'MMM d');
}

// Day backgrounds — alternating subtle tints
const DAY_BGTINTS = [
  'bg-white',
  'bg-slate-50',
  'bg-stone-50',
  'bg-zinc-50',
  'bg-neutral-50',
  'bg-gray-50',
  'bg-white',
  'bg-slate-50',
];

// ─── Share View Page ──────────────────────────────────────────────────────────

export default function ShareView() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const trip = useTripStore(s => s.getTripById(tripId!));
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    setCanShare('share' in navigator);
    const onScroll = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(Math.min(100, Math.max(0, pct)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="text-5xl">🗺️</div>
        <h1 className="text-xl font-bold text-gray-700">Trip not found</h1>
        <p className="text-sm text-gray-400">This itinerary may have been deleted or the link is incorrect.</p>
        <button onClick={() => navigate('/')} className="mt-2 text-sm text-blue-500 hover:underline">
          ← Back to Wanderplan
        </button>
      </div>
    );
  }

  const dayGroups = groupEventsByDay(trip.events);
  const shareUrl = window.location.href;
  const nights = differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    await navigator.share({
      title: `${trip.name} — ${trip.destination}`,
      text: `Check out my trip itinerary: ${nights} nights in ${trip.destination}!`,
      url: shareUrl,
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── READING PROGRESS BAR ─────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gray-100 z-50 pointer-events-none">
        <motion.div
          className="h-full origin-left"
          style={{
            background: trip.coverGradient ?? 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
            scaleX: scrollPct / 100,
          }}
          transition={{ duration: 0.05 }}
        />
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <Hero trip={trip} nights={nights} onCopy={handleCopy} onShare={handleNativeShare}
        copied={copied} canShare={canShare} />

      {/* ── TRIP STATS STRIP ─────────────────────────────────────────────── */}
      <TripStats trip={trip} dayCount={dayGroups.length} />

      {/* ── DAY SECTIONS ─────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-0">
        {dayGroups.map((day, i) => (
          <DaySection
            key={day.date}
            day={day}
            dayNumber={i + 1}
            totalDays={dayGroups.length}
            bgClass={DAY_BGTINTS[i % DAY_BGTINTS.length]}
            activeHotel={getActiveHotel(trip.events, day.date)?.hotelName}
          />
        ))}
      </div>

      {/* ── FOOTER / GROWTH HACK ─────────────────────────────────────────── */}
      <Footer trip={trip} onCopy={handleCopy} onShare={handleNativeShare} copied={copied} canShare={canShare} />
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function Hero({ trip, nights, onCopy, onShare, copied, canShare }: {
  trip: Trip; nights: number;
  onCopy: () => void; onShare: () => void;
  copied: boolean; canShare: boolean;
}) {
  return (
    <div
      className="relative min-h-[55vh] flex flex-col justify-end overflow-hidden"
      style={{ background: trip.coverGradient ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(0,0,0,0.2) 0%, transparent 50%)`,
        }}
      />

      {/* Floating share bar at top */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-20">
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-full px-3 py-1.5">
          <div className="w-4 h-4 rounded-full bg-white/90 flex items-center justify-center">
            <Plane size={9} className="text-gray-800" />
          </div>
          <span className="text-white text-xs font-semibold tracking-wide">WANDERPLAN</span>
        </div>
        <div className="flex items-center gap-2">
          {canShare && (
            <button
              onClick={onShare}
              className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full
                         flex items-center gap-1.5 hover:bg-white/30 transition-colors"
            >
              <Share2 size={12} />
              Share
            </button>
          )}
          <button
            onClick={onCopy}
            className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full
                       flex items-center gap-1.5 hover:bg-white/30 transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 px-6 pb-10 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-white/70 text-xs font-semibold uppercase tracking-[0.2em]">
              Trip Itinerary
            </span>
            <span className="w-8 h-px bg-white/40" />
            <span className="text-white/70 text-xs font-semibold uppercase tracking-[0.2em]">
              {tripDuration(trip.startDate, trip.endDate)}
            </span>
          </div>

          {/* Big title */}
          <div className="flex items-start gap-4 mb-3">
            {trip.emoji && (
              <span className="text-5xl leading-none mt-1 drop-shadow-lg">{trip.emoji}</span>
            )}
            <div>
              <h1 className="text-white font-black text-4xl sm:text-5xl leading-none tracking-tight drop-shadow-md">
                {trip.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-2 text-white/80">
                <MapPin size={14} />
                <span className="text-base font-medium">{trip.destination}</span>
              </div>
            </div>
          </div>

          {/* Dates + travelers */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div className="bg-black/25 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
              <Calendar size={14} className="text-white/70" />
              <span className="text-white text-sm font-medium">
                {shortDate(trip.startDate)} – {longDate(trip.endDate)}
              </span>
            </div>
            {trip.travelers.length > 0 && (
              <div className="bg-black/25 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2.5">
                <div className="flex -space-x-1.5">
                  {trip.travelers.slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      className="w-5 h-5 rounded-full border border-white/50 flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: t.color }}
                      title={t.name}
                    >
                      {t.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="text-white text-sm font-medium">
                  {trip.travelers.map(t => t.name).join(', ')}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

// ─── Trip Stats Strip ─────────────────────────────────────────────────────────

function TripStats({ trip, dayCount }: { trip: Trip; dayCount: number }) {
  const flightCount = trip.events.filter(e => e.type === 'flight').length;
  const mealCount = trip.events.filter(e => e.type === 'restaurant').length;
  const activityCount = trip.events.filter(e => e.type === 'activity').length;

  const stats = [
    { label: 'Days', value: String(dayCount), icon: '📅' },
    { label: 'Travelers', value: String(trip.travelers.length), icon: '👥' },
    { label: 'Flights', value: String(flightCount), icon: '✈️' },
    { label: 'Restaurants', value: String(mealCount), icon: '🍽️' },
    { label: 'Activities', value: String(activityCount), icon: '🎯' },
  ].filter(s => parseInt(s.value) > 0);

  return (
    <div className="bg-white border-y border-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-1">
          {stats.map((stat) => (
            <div key={stat.label} className="flex-shrink-0 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-black text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Day Section ──────────────────────────────────────────────────────────────

function DaySection({ day, dayNumber, totalDays, bgClass, activeHotel }: {
  day: DayGroup; dayNumber: number; totalDays: number;
  bgClass: string; activeHotel?: string;
}) {
  return (
    <div className={`${bgClass} rounded-3xl mb-6 overflow-hidden`}>
      {/* Day header */}
      <div className="px-6 pt-7 pb-4">
        <div className="flex items-baseline gap-4">
          <span className="text-7xl font-black text-gray-100 leading-none select-none" style={{
            fontVariantNumeric: 'tabular-nums',
            WebkitTextStroke: '1px #e5e7eb',
          }}>
            {String(dayNumber).padStart(2, '0')}
          </span>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {format(parseISO(day.date), 'EEEE')}
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              {format(parseISO(day.date), 'MMMM d, yyyy')}
              {activeHotel && (
                <span className="text-purple-500 ml-2">· 🌙 {activeHotel}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Events list with timeline connector */}
      <div className="px-5 pb-6">
        <div className="relative">
          {/* Vertical timeline line */}
          {day.events.length > 1 && (
            <div className="absolute left-5 top-6 bottom-6 w-px bg-gray-100 pointer-events-none" />
          )}
          <div className="space-y-3">
            {day.events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <EditorialCard event={event} />
              </motion.div>
            ))}
          </div>
        </div>

        {day.events.length === 0 && (
          <div className="text-center py-6 text-gray-300 text-sm italic">
            Free day — explore as you wish ✨
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Editorial Card Dispatcher ────────────────────────────────────────────────

function EditorialCard({ event }: { event: TripEvent }) {
  switch (event.type) {
    case 'flight':    return <EditorialFlight event={event as FlightEvent} />;
    case 'hotel':     return <EditorialHotel event={event as HotelEvent} />;
    case 'restaurant':return <EditorialRestaurant event={event as RestaurantEvent} />;
    case 'activity':  return <EditorialActivity event={event as ActivityEvent} />;
    case 'transport': return <EditorialTransport event={event as TransportEvent} />;
    case 'train':     return <EditorialTrain event={event as TrainEvent} />;
    case 'note':      return <EditorialNote event={event as NoteEvent} />;
    default:          return null;
  }
}

// ─── Editorial Flight Card ────────────────────────────────────────────────────

function EditorialFlight({ event }: { event: FlightEvent }) {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
        <Plane size={80} className="rotate-0 text-white" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
            ✈️ Flight
          </span>
          <div className="text-right text-white/70 text-xs">
            <div className="font-semibold text-white">{event.airline}</div>
            <div>{event.flightNumber}</div>
          </div>
        </div>

        {/* Route — the star of the card */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-5xl font-black tracking-tighter leading-none">{event.fromAirport}</div>
            <div className="text-white/70 text-sm mt-1">{event.fromCity}</div>
            <div className="text-white font-bold text-lg mt-1">{formatTime(event.departureTime)}</div>
          </div>

          <div className="flex flex-col items-center px-4 flex-1">
            <div className="text-white/60 text-xs mb-2 font-medium">{event.duration}</div>
            <div className="flex items-center w-full gap-1">
              <div className="flex-1 h-px bg-white/30" />
              <Plane size={16} className="text-white" />
              <div className="flex-1 h-px bg-white/30" />
            </div>
            <div className="text-white/60 text-xs mt-1 font-medium">{event.cabin ?? 'Economy'}</div>
          </div>

          <div className="text-right">
            <div className="text-5xl font-black tracking-tighter leading-none">{event.toAirport}</div>
            <div className="text-white/70 text-sm mt-1">{event.toCity}</div>
            <div className="text-white font-bold text-lg mt-1">
              {formatTime(event.arrivalTime)}
              {event.arrivalDate !== event.date && (
                <span className="text-xs text-yellow-300 ml-1">+1</span>
              )}
            </div>
          </div>
        </div>

        {event.confirmationNumber && (
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center gap-1.5 text-white/60 text-xs">
            <Hash size={11} />
            <span>Confirmation: {event.confirmationNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Editorial Hotel Card ─────────────────────────────────────────────────────

function EditorialHotel({ event }: { event: HotelEvent }) {
  const isCheckout = event.isCheckout;
  return (
    <div className={`rounded-2xl overflow-hidden border ${isCheckout ? 'border-purple-100 bg-purple-50' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className="flex">
        {/* Left accent */}
        <div className="w-1.5 bg-purple-500 flex-shrink-0 rounded-l-2xl" />
        <div className="flex-1 p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 text-xl">
              🏨
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold uppercase tracking-widest text-purple-500">
                  {isCheckout ? 'Check-out' : 'Hotel Check-in'}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{event.hotelName}</h3>
              {event.neighborhood && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                  <MapPin size={11} />
                  {event.neighborhood}
                </div>
              )}
              <div className="flex gap-4 mt-2 text-sm">
                <div>
                  <span className="text-gray-400 text-xs block">Check-in</span>
                  <span className="font-semibold text-gray-700">{event.checkInTime}</span>
                  <span className="text-gray-400 text-xs ml-1">· {shortDate(event.date)}</span>
                </div>
                <div className="w-px bg-gray-100" />
                <div>
                  <span className="text-gray-400 text-xs block">Check-out</span>
                  <span className="font-semibold text-gray-700">{event.checkOutTime}</span>
                  <span className="text-gray-400 text-xs ml-1">· {shortDate(event.checkOutDate)}</span>
                </div>
                {event.numRooms && (
                  <>
                    <div className="w-px bg-gray-100" />
                    <div>
                      <span className="text-gray-400 text-xs block">Rooms</span>
                      <span className="font-semibold text-gray-700">{event.numRooms}</span>
                    </div>
                  </>
                )}
              </div>
              {event.pricePerNight && (
                <div className="mt-2 text-xs text-gray-400">
                  ${event.pricePerNight}/night · ${event.totalPrice} total
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Editorial Restaurant Card ────────────────────────────────────────────────

function EditorialRestaurant({ event }: { event: RestaurantEvent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex">
        <div className="w-1.5 bg-orange-400 flex-shrink-0 rounded-l-2xl" />
        <div className="flex-1 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-xl">
              🍽️
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
                  {event.cuisine ?? 'Dining'}
                </span>
                {event.price && (
                  <span className="text-sm text-gray-400 font-medium">{event.price}</span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight mt-0.5">
                {event.restaurantName}
              </h3>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                {event.time && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(event.time)}
                    {event.duration && ` · ${event.duration}`}
                  </span>
                )}
                {event.address && (
                  <span className="flex items-center gap-1 text-xs">
                    <MapPin size={11} />
                    {event.address}
                  </span>
                )}
              </div>
              {event.reservationStatus === 'confirmed' && (
                <div className="inline-flex items-center gap-1 mt-2 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <CheckCircle size={11} />
                  Reservation confirmed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Editorial Activity Card ──────────────────────────────────────────────────

function EditorialActivity({ event }: { event: ActivityEvent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex">
        <div className="w-1.5 bg-emerald-500 flex-shrink-0 rounded-l-2xl" />
        <div className="flex-1 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 text-xl">
              🎯
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Activity{event.category ? ` · ${event.category}` : ''}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">
                {event.activityName}
              </h3>
              <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-gray-500">
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
              {event.price !== undefined && (
                <div className="mt-1.5 text-xs text-gray-400">
                  {event.price === 0 ? '🆓 Free entry' : `$${event.price} per person`}
                </div>
              )}
              {event.bookingInfo && (
                <div className="mt-2 bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-500 leading-relaxed border border-gray-100">
                  {event.bookingInfo}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Editorial Transport Card ─────────────────────────────────────────────────

function EditorialTransport({ event }: { event: TransportEvent }) {
  const icons: Record<string, string> = {
    car: '🚗', taxi: '🚕', bus: '🚌', subway: '🚇', ferry: '⛴️', other: '🚐',
  };
  const labels: Record<string, string> = {
    car: 'Car', taxi: 'Taxi / Rideshare', bus: 'Bus', subway: 'Subway / Metro', ferry: 'Ferry', other: 'Transport',
  };

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl flex-shrink-0">
          {icons[event.transportType] ?? '🚐'}
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-0.5">
            {labels[event.transportType] ?? 'Transport'}
            {event.provider ? ` · ${event.provider}` : ''}
          </div>
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <span>{event.fromLocation}</span>
            <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
            <span>{event.toLocation}</span>
          </div>
          <div className="flex gap-3 text-xs text-gray-500 mt-1">
            {event.time && <span>{formatTime(event.time)}</span>}
            {event.duration && <span>· {event.duration}</span>}
            {event.cost && event.cost > 0 && <span>· ${event.cost}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Editorial Train Card ─────────────────────────────────────────────────────

function EditorialTrain({ event }: { event: TrainEvent }) {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl flex-shrink-0">
          🚂
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Train{event.trainName ? ` · ${event.trainName}` : ''}
            </span>
            {event.trainNumber && (
              <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                {event.trainNumber}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div>
              <div className="font-bold text-gray-900 text-sm">{event.fromStation}</div>
              <div className="text-gray-500 text-xs">{formatTime(event.departureTime)}</div>
            </div>
            <div className="flex-1 flex items-center gap-1 px-2">
              <div className="flex-1 h-px bg-amber-300" />
              <Train size={12} className="text-amber-500" />
              <div className="flex-1 h-px bg-amber-300" />
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900 text-sm">{event.toStation}</div>
              <div className="text-gray-500 text-xs">{formatTime(event.arrivalTime)}</div>
            </div>
          </div>
          {event.ticketClass && (
            <div className="text-xs text-gray-400 mt-1">{event.ticketClass}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Editorial Note Card ──────────────────────────────────────────────────────

function EditorialNote({ event }: { event: NoteEvent }) {
  return (
    <div className="border-l-4 border-gray-300 pl-4 py-2">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">📝 Note</div>
      {event.title && (
        <div className="font-semibold text-gray-700 text-sm mb-1">{event.title}</div>
      )}
      <p className="text-sm text-gray-500 leading-relaxed italic">{event.content}</p>
    </div>
  );
}

// ─── Footer / Growth Hack ─────────────────────────────────────────────────────

function Footer({ trip, onCopy, onShare, copied, canShare }: {
  trip: Trip; onCopy: () => void; onShare: () => void;
  copied: boolean; canShare: boolean;
}) {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-950 text-white">
      {/* CTA section */}
      <div className="max-w-2xl mx-auto px-5 py-12 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm font-medium mb-6">
          <Star size={14} className="text-yellow-400" fill="currentColor" />
          <span className="text-white/80">Free to use · No account needed</span>
        </div>

        <h2 className="text-3xl font-black leading-tight mb-3">
          Plan your own trip like this
        </h2>
        <p className="text-gray-400 text-base mb-8 leading-relaxed max-w-md mx-auto">
          Beautiful itineraries, real-time collaboration with friends, and automatic
          expense splitting. All in one place.
        </p>

        {/* Share actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          {canShare && (
            <button
              onClick={onShare}
              className="flex items-center justify-center gap-2 bg-white text-gray-900 font-bold py-3.5 px-6 rounded-2xl
                         hover:bg-gray-100 transition-colors"
            >
              <Share2 size={16} />
              Share this Itinerary
            </button>
          )}
          <button
            onClick={onCopy}
            className={`flex items-center justify-center gap-2 border-2 font-bold py-3.5 px-6 rounded-2xl transition-all
              ${copied
                ? 'border-green-500 text-green-400 bg-green-500/10'
                : 'border-white/20 text-white hover:border-white/40'
              }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Link copied!' : 'Copy link'}
          </button>
        </div>

        {/* Start planning CTA */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white
                     font-bold py-4 px-8 rounded-2xl hover:opacity-90 transition-opacity text-base"
        >
          <Plane size={18} />
          Start Planning Free
          <ExternalLink size={14} className="opacity-70" />
        </button>
      </div>

      {/* Watermark */}
      <div className="border-t border-white/10">
        <div className="max-w-2xl mx-auto px-5 py-5 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Plane size={14} className="text-white" />
            </div>
            <span className="font-black text-white text-base tracking-tight">Wanderplan</span>
          </button>
          <p className="text-gray-600 text-xs">
            Made with <span className="text-gray-400 font-medium">Wanderplan</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
