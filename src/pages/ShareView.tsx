import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plane, Train,
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
import TripHeroMap from '../components/TripHeroMap';
import MapThumbnail from '../components/MapThumbnail';
import { EVENT_COLORS } from '../utils/itineraryUtils';
import { getTravelTime, inferTravelMode, TRAVEL_MODE_EMOJI } from '../utils/mapUtils';

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: '#0a0a0a' }}>
        <div className="text-5xl">🗺️</div>
        <h1 className="text-xl font-bold text-white">Trip not found</h1>
        <p className="text-sm" style={{ color: '#6b7280' }}>This itinerary may have been deleted or the link is incorrect.</p>
        <button onClick={() => navigate('/')} className="mt-2 text-sm" style={{ color: '#10b981' }}>
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
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50 pointer-events-none"
        style={{ backgroundColor: '#1a1a1a' }}>
        <motion.div
          className="h-full origin-left"
          style={{ backgroundColor: '#10b981', scaleX: scrollPct / 100 }}
          transition={{ duration: 0.05 }}
        />
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <ShareHero trip={trip} nights={nights} onCopy={handleCopy} onShare={handleNativeShare}
        copied={copied} canShare={canShare} />

      {/* ── TRIP STATS ─────────────────────────────────────────────────── */}
      <ShareStats trip={trip} dayCount={dayGroups.length} />

      {/* ── DAY SECTIONS ─────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {dayGroups.map((day, i) => (
          <DaySection
            key={day.date}
            day={day}
            dayNumber={i + 1}
            totalDays={dayGroups.length}
            activeHotel={getActiveHotel(trip.events, day.date)?.hotelName}
          />
        ))}
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <ShareFooter trip={trip} onCopy={handleCopy} onShare={handleNativeShare} copied={copied} canShare={canShare} />
    </div>
  );
}

// ─── Share Hero ───────────────────────────────────────────────────────────────

function ShareHero({ trip, nights, onCopy, onShare, copied, canShare }: {
  trip: Trip; nights: number;
  onCopy: () => void; onShare: () => void;
  copied: boolean; canShare: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden" style={{ minHeight: '60vh' }}>
      {/* Hero map background */}
      <TripHeroMap events={trip.events} height={500} />

      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.6) 50%, #0a0a0a 100%)',
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{ backgroundColor: 'rgba(20,20,20,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
            <Plane size={9} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold tracking-wide">WANDERPLAN</span>
        </button>

        <div className="flex items-center gap-2">
          {canShare && (
            <button
              onClick={onShare}
              className="text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
              style={{ backgroundColor: 'rgba(20,20,20,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Share2 size={12} />
              Share
            </button>
          )}
          <button
            onClick={onCopy}
            className="text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
            style={{ backgroundColor: 'rgba(20,20,20,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      {/* Hero content - positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Trip Itinerary
            </span>
            <span className="w-8 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {tripDuration(trip.startDate, trip.endDate)}
            </span>
          </div>

          <div className="flex items-start gap-4 mb-3">
            {trip.emoji && (
              <span className="text-5xl leading-none mt-1 drop-shadow-lg">{trip.emoji}</span>
            )}
            <div>
              <h1 className="text-white font-black leading-none tracking-tight drop-shadow-md"
                style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)' }}>
                {trip.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <MapPin size={14} />
                <span className="text-base font-medium">{trip.destination}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div
              className="rounded-xl px-3 py-2 flex items-center gap-2"
              style={{ backgroundColor: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Calendar size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <span className="text-white text-sm font-medium">
                {shortDate(trip.startDate)} – {longDate(trip.endDate)}
              </span>
            </div>
            {trip.travelers.length > 0 && (
              <div
                className="rounded-xl px-3 py-2 flex items-center gap-2.5"
                style={{ backgroundColor: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex -space-x-1.5">
                  {trip.travelers.slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: t.color, border: '1px solid rgba(255,255,255,0.3)' }}
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
    </div>
  );
}

// ─── Trip Stats Strip ─────────────────────────────────────────────────────────

function ShareStats({ trip, dayCount }: { trip: Trip; dayCount: number }) {
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
    <div style={{ backgroundColor: '#0a0a0a', borderTop: '1px solid #141414', borderBottom: '1px solid #141414' }}>
      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="flex gap-8 overflow-x-auto no-scrollbar pb-1 justify-center">
          {stats.map((stat) => (
            <div key={stat.label} className="flex-shrink-0 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Day Section ──────────────────────────────────────────────────────────────

function DaySection({ day, dayNumber, totalDays: _totalDays, activeHotel }: {
  day: DayGroup; dayNumber: number; totalDays: number;
  activeHotel?: string;
}) {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: '#0f0f0f', border: '1px solid #1a1a1a' }}>
      {/* Day header */}
      <div className="px-6 pt-7 pb-4" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div className="flex items-baseline gap-4">
          <span
            className="text-7xl font-black leading-none select-none"
            style={{
              color: 'transparent',
              WebkitTextStroke: '1px #1e1e1e',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {String(dayNumber).padStart(2, '0')}
          </span>
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">
              {format(parseISO(day.date), 'EEEE')}
            </h2>
            <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
              {format(parseISO(day.date), 'MMMM d, yyyy')}
              {activeHotel && (
                <span className="ml-2" style={{ color: '#8b5cf6' }}>· 🌙 {activeHotel}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Events */}
      <div className="px-5 py-5">
        <div className="space-y-3">
          {day.events.map((event, i) => (
            <div key={event.id}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <EditorialCard event={event} />
              </motion.div>

              {/* Travel time between events */}
              {i < day.events.length - 1 && (() => {
                const nextEvent = day.events[i + 1];
                const from = event;
                const to = nextEvent;
                if (!from.lat || !from.lng || !to.lat || !to.lng) return null;
                const mode = inferTravelMode(from, to);
                const timeStr = getTravelTime(from.lat, from.lng, to.lat, to.lng, mode);
                const emoji = TRAVEL_MODE_EMOJI[mode];
                return (
                  <div className="flex items-center justify-center py-2">
                    <span
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ backgroundColor: '#141414', color: '#6b7280', border: '1px solid #1e1e1e' }}
                    >
                      {emoji} {timeStr} {mode !== 'flight' ? mode : ''}
                    </span>
                  </div>
                );
              })()}
            </div>
          ))}

          {day.events.length === 0 && (
            <div className="text-center py-6 text-sm italic" style={{ color: '#3a3a3a' }}>
              Free day — explore as you wish ✨
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Editorial Card Dispatcher ────────────────────────────────────────────────

function EditorialCard({ event }: { event: TripEvent }) {
  switch (event.type) {
    case 'flight':     return <EditorialFlight event={event as FlightEvent} />;
    case 'hotel':      return <EditorialHotel event={event as HotelEvent} />;
    case 'restaurant': return <EditorialRestaurant event={event as RestaurantEvent} />;
    case 'activity':   return <EditorialActivity event={event as ActivityEvent} />;
    case 'transport':  return <EditorialTransport event={event as TransportEvent} />;
    case 'train':      return <EditorialTrain event={event as TrainEvent} />;
    case 'note':       return <EditorialNote event={event as NoteEvent} />;
    default:           return null;
  }
}

// ─── Editorial Cards (dark redesign) ─────────────────────────────────────────

function EditorialFlight({ event }: { event: FlightEvent }) {
  return (
    <div className="rounded-2xl p-5 text-white overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #1a2a4a 0%, #0f1a2e 100%)', border: '1px solid #1e3a6e' }}>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
        <Plane size={80} className="text-white" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>
            ✈️ Flight
          </span>
          <div className="text-right text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <div className="font-semibold text-white">{event.airline}</div>
            <div>{event.flightNumber}</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-black tracking-tighter leading-none">{event.fromAirport}</div>
            <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{event.fromCity}</div>
            <div className="text-white font-bold text-lg mt-1">{formatTime(event.departureTime)}</div>
          </div>
          <div className="flex flex-col items-center px-4 flex-1">
            <div className="text-xs mb-2 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{event.duration}</div>
            <div className="flex items-center w-full gap-1">
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <Plane size={14} className="text-white" />
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            </div>
            <div className="text-xs mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{event.cabin ?? 'Economy'}</div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black tracking-tighter leading-none">{event.toAirport}</div>
            <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{event.toCity}</div>
            <div className="text-white font-bold text-lg mt-1">
              {formatTime(event.arrivalTime)}
              {event.arrivalDate !== event.date && (
                <span className="text-xs ml-1" style={{ color: '#fbbf24' }}>+1</span>
              )}
            </div>
          </div>
        </div>
        {event.confirmationNumber && (
          <div className="mt-4 pt-3 flex items-center gap-1.5 text-xs"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
            <Hash size={11} />
            <span>Confirmation: {event.confirmationNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function EditorialHotel({ event }: { event: HotelEvent }) {
  const color = EVENT_COLORS['hotel'];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#141414', border: `1px solid #242424`, borderLeft: `4px solid ${color}` }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{ backgroundColor: '#1e1030' }}>
            🏨
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color }}>
              {event.isCheckout ? 'Check-out' : 'Hotel Check-in'}
            </div>
            <h3 className="font-bold text-white text-lg leading-tight">{event.hotelName}</h3>
            {event.neighborhood && (
              <div className="flex items-center gap-1 text-sm mt-0.5" style={{ color: '#9ca3af' }}>
                <MapPin size={11} />
                {event.neighborhood}
              </div>
            )}
            <div className="flex gap-4 mt-2 text-sm">
              <div>
                <span className="text-xs block" style={{ color: '#6b7280' }}>Check-in</span>
                <span className="font-semibold text-white">{event.checkInTime}</span>
                <span className="text-xs ml-1" style={{ color: '#6b7280' }}>· {shortDate(event.date)}</span>
              </div>
              <div className="w-px" style={{ backgroundColor: '#2a2a2a' }} />
              <div>
                <span className="text-xs block" style={{ color: '#6b7280' }}>Check-out</span>
                <span className="font-semibold text-white">{event.checkOutTime}</span>
                <span className="text-xs ml-1" style={{ color: '#6b7280' }}>· {shortDate(event.checkOutDate)}</span>
              </div>
              {event.numRooms && (
                <>
                  <div className="w-px" style={{ backgroundColor: '#2a2a2a' }} />
                  <div>
                    <span className="text-xs block" style={{ color: '#6b7280' }}>Rooms</span>
                    <span className="font-semibold text-white">{event.numRooms}</span>
                  </div>
                </>
              )}
            </div>
            {event.pricePerNight && (
              <div className="mt-2 text-xs" style={{ color: '#6b7280' }}>
                ${event.pricePerNight}/night · ${event.totalPrice} total
              </div>
            )}
          </div>
        </div>
      </div>
      {event.lat && event.lng && (
        <div style={{ borderTop: '1px solid #1e1e1e' }}>
          <MapThumbnail lat={event.lat} lng={event.lng} label={event.hotelName} color={color} height={140} />
        </div>
      )}
    </div>
  );
}

function EditorialRestaurant({ event }: { event: RestaurantEvent }) {
  const color = EVENT_COLORS['restaurant'];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#141414', border: `1px solid #242424`, borderLeft: `4px solid ${color}` }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{ backgroundColor: '#1e1008' }}>
            🍽️
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
                {event.cuisine ?? 'Dining'}
              </span>
              {event.price && <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>{event.price}</span>}
            </div>
            <h3 className="font-bold text-white text-lg leading-tight mt-0.5">{event.restaurantName}</h3>
            <div className="flex flex-wrap gap-3 mt-2 text-sm" style={{ color: '#9ca3af' }}>
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
              <div className="inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#0a2a0a', color: '#4ade80' }}>
                <CheckCircle size={11} />
                Reservation confirmed
              </div>
            )}
          </div>
        </div>
      </div>
      {event.lat && event.lng && (
        <div style={{ borderTop: '1px solid #1e1e1e' }}>
          <MapThumbnail lat={event.lat} lng={event.lng} label={event.restaurantName} color={color} height={130} />
        </div>
      )}
    </div>
  );
}

function EditorialActivity({ event }: { event: ActivityEvent }) {
  const color = EVENT_COLORS['activity'];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#141414', border: `1px solid #242424`, borderLeft: `4px solid ${color}` }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{ backgroundColor: '#0a1e14' }}>
            🎯
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
                Activity{event.category ? ` · ${event.category}` : ''}
              </span>
            </div>
            <h3 className="font-bold text-white text-base leading-tight">{event.activityName}</h3>
            <div className="flex flex-wrap gap-3 mt-1.5 text-sm" style={{ color: '#9ca3af' }}>
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
              <div className="mt-1.5 text-xs" style={{ color: '#6b7280' }}>
                {event.price === 0 ? '🆓 Free entry' : `$${event.price} per person`}
              </div>
            )}
            {event.bookingInfo && (
              <div className="mt-2 rounded-xl px-3 py-2 text-xs leading-relaxed"
                style={{ backgroundColor: '#0f0f0f', color: '#9ca3af', border: '1px solid #1e1e1e' }}>
                {event.bookingInfo}
              </div>
            )}
          </div>
        </div>
      </div>
      {event.lat && event.lng && (
        <div style={{ borderTop: '1px solid #1e1e1e' }}>
          <MapThumbnail lat={event.lat} lng={event.lng} label={event.activityName} color={color} height={140} />
        </div>
      )}
    </div>
  );
}

function EditorialTransport({ event }: { event: TransportEvent }) {
  const color = EVENT_COLORS['transport'];
  const icons: Record<string, string> = {
    car: '🚗', taxi: '🚕', bus: '🚌', subway: '🚇', ferry: '⛴️', other: '🚐',
  };
  const labels: Record<string, string> = {
    car: 'Car', taxi: 'Taxi / Rideshare', bus: 'Bus', subway: 'Subway / Metro', ferry: 'Ferry', other: 'Transport',
  };

  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: '#141414', border: `1px solid #242424`, borderLeft: `4px solid ${color}` }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: '#1e1a00' }}>
          {icons[event.transportType] ?? '🚐'}
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color }}>
            {labels[event.transportType] ?? 'Transport'}
            {event.provider ? ` · ${event.provider}` : ''}
          </div>
          <div className="flex items-center gap-2 font-semibold text-white">
            <span>{event.fromLocation}</span>
            <ArrowRight size={14} style={{ color: '#6b7280' }} />
            <span>{event.toLocation}</span>
          </div>
          <div className="flex gap-3 text-xs mt-1" style={{ color: '#6b7280' }}>
            {event.time && <span>{formatTime(event.time)}</span>}
            {event.duration && <span>· {event.duration}</span>}
            {event.cost && event.cost > 0 && <span>· ${event.cost}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorialTrain({ event }: { event: TrainEvent }) {
  const color = EVENT_COLORS['train'];
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: '#141414', border: `1px solid #242424`, borderLeft: `4px solid ${color}` }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: '#1e1a00' }}>
          🚂
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
              Train{event.trainName ? ` · ${event.trainName}` : ''}
            </span>
            {event.trainNumber && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ backgroundColor: color + '30', color }}>
                {event.trainNumber}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div>
              <div className="font-bold text-white text-sm">{event.fromStation}</div>
              <div className="text-xs" style={{ color: '#9ca3af' }}>{formatTime(event.departureTime)}</div>
            </div>
            <div className="flex-1 flex items-center gap-1 px-2">
              <div className="flex-1 h-px" style={{ backgroundColor: color + '60' }} />
              <Train size={12} style={{ color }} />
              <div className="flex-1 h-px" style={{ backgroundColor: color + '60' }} />
            </div>
            <div className="text-right">
              <div className="font-bold text-white text-sm">{event.toStation}</div>
              <div className="text-xs" style={{ color: '#9ca3af' }}>{formatTime(event.arrivalTime)}</div>
            </div>
          </div>
          {event.ticketClass && (
            <div className="text-xs mt-1" style={{ color: '#6b7280' }}>{event.ticketClass}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditorialNote({ event }: { event: NoteEvent }) {
  return (
    <div className="pl-4 py-3 rounded-r-xl" style={{ borderLeft: '3px solid #2a2a2a', backgroundColor: '#0f0f0f' }}>
      <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#6b7280' }}>📝 Note</div>
      {event.title && (
        <div className="font-semibold text-white text-sm mb-1">{event.title}</div>
      )}
      <p className="text-sm italic leading-relaxed" style={{ color: '#9ca3af' }}>{event.content}</p>
    </div>
  );
}

// ─── Share Footer ─────────────────────────────────────────────────────────────

function ShareFooter({ trip, onCopy, onShare, copied, canShare }: {
  trip: Trip; onCopy: () => void; onShare: () => void;
  copied: boolean; canShare: boolean;
}) {
  const navigate = useNavigate();
  return (
    <footer style={{ backgroundColor: '#060606', borderTop: '1px solid #141414' }}>
      <div className="max-w-2xl mx-auto px-5 py-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-6"
          style={{ backgroundColor: '#141414', color: '#9ca3af', border: '1px solid #242424' }}>
          <Star size={14} style={{ color: '#fbbf24' }} fill="#fbbf24" />
          <span>Free to use · No account needed</span>
        </div>

        <h2 className="text-3xl font-black text-white leading-tight mb-3">
          Plan your own trip like this
        </h2>
        <p className="text-base mb-8 leading-relaxed max-w-md mx-auto" style={{ color: '#6b7280' }}>
          Beautiful itineraries, real-time collaboration with friends, and automatic
          expense splitting. All in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          {canShare && (
            <button
              onClick={onShare}
              className="flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-2xl transition-colors text-white"
              style={{ backgroundColor: '#141414', border: '1px solid #242424' }}
            >
              <Share2 size={16} />
              Share this Itinerary
            </button>
          )}
          <button
            onClick={onCopy}
            className="flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-2xl transition-all"
            style={copied
              ? { border: '2px solid #10b981', color: '#10b981', backgroundColor: '#10b98115' }
              : { border: '2px solid #242424', color: '#9ca3af' }
            }
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Link copied!' : 'Copy link'}
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 font-bold py-4 px-8 rounded-2xl hover:opacity-90 transition-opacity text-base text-white"
          style={{ backgroundColor: '#10b981', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
        >
          <Plane size={18} />
          Start Planning Free
          <ExternalLink size={14} className="opacity-70" />
        </button>

        <p className="mt-8 text-sm" style={{ color: '#3a3a3a' }}>
          Shared via <span style={{ color: '#6b7280' }}>wanderplan.app</span>
        </p>
      </div>

      <div style={{ borderTop: '1px solid #141414' }}>
        <div className="max-w-2xl mx-auto px-5 py-5 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:opacity-80 transition-opacity"
              style={{ backgroundColor: '#10b981' }}>
              <Plane size={14} className="text-white" />
            </div>
            <span className="font-black text-white text-base tracking-tight">Wanderplan</span>
          </button>
          <p className="text-xs" style={{ color: '#3a3a3a' }}>
            Made with <span style={{ color: '#6b7280' }}>Wanderplan</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
