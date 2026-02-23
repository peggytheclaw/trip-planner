import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Share2, DollarSign, Settings, Plus, Check,
  Copy, X, Eye, Map, ClipboardList, Sparkles, Lightbulb,
} from 'lucide-react';
import { AIAgentPanel } from '../components/AIAgentPanel';
import { useTripStore } from '../store/tripStore';
import { groupEventsByDay, getActiveHotel, detectMealGap } from '../utils/itineraryUtils';
import { EVENT_COORDS } from '../utils/eventCoordinates';
import { estimateTravelTime, PRECOMPUTED_TRAVEL } from '../utils/travelTimeUtils';
import type { TripEvent } from '../types';
import EventCard from '../components/EventCard';
import AddEventSheet from '../components/AddEventSheet';
import CollabAvatars from '../components/CollabAvatars';
import TravelIndicator, { OvernightIndicator, MealNudge } from '../components/TravelIndicator';
import { DayMap } from '../components/MiniMap';
import { toast } from '../components/Toast';
import IdeaBankPanel from '../components/IdeaBankPanel';

export default function Itinerary() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const {
    getTripById, addEvent, updateEvent, deleteEvent, setCurrentTrip,
    addIdeaToBank, promoteIdeaToItinerary, updateIdea, deleteIdea,
  } = useTripStore();

  const trip = getTripById(tripId!);
  const [view, setView] = useState<'itinerary' | 'ideas'>('itinerary');
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<TripEvent | null>(null);
  const [insertDate, setInsertDate] = useState<string | undefined>();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [expandedDayMaps, setExpandedDayMaps] = useState<Set<string>>(new Set());
  const [aiOpen, setAiOpen] = useState(false);
  const [isAddingIdea, setIsAddingIdea] = useState(false);

  useEffect(() => {
    if (trip) setCurrentTrip(trip.id);
  }, [trip?.id]);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text-2)' }}>
        Trip not found.{' '}
        <button className="ml-2" style={{ color: 'var(--accent)' }} onClick={() => navigate('/app')}>← Back</button>
      </div>
    );
  }

  const dayGroups = groupEventsByDay(trip.events);
  const shareUrl = `${window.location.origin}/trip/${trip.id}/share`;
  const editUrl  = `${window.location.origin}/trip/${trip.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSaveEvent = (eventData: Omit<TripEvent, 'id' | 'createdAt'>) => {
    if (isAddingIdea) {
      // Adding to idea bank
      if (editEvent) {
        // Editing existing idea
        updateIdea(trip.id, editEvent.id, eventData);
      } else {
        // Adding new idea
        addIdeaToBank(trip.id, eventData);
      }
    } else {
      // Adding to itinerary
      if (editEvent) updateEvent(trip.id, editEvent.id, eventData);
      else addEvent(trip.id, eventData);
    }
    setEditEvent(null);
    setInsertDate(undefined);
    setIsAddingIdea(false);
  };

  const handleOpenAdd = (date?: string) => {
    setInsertDate(date);
    setEditEvent(null);
    setAddSheetOpen(true);
  };

  const handleEditEvent = (event: TripEvent) => {
    setEditEvent(event);
    setInsertDate(event.date);
    setAddSheetOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Remove this event?')) {
      deleteEvent(trip.id, eventId);
      toast.info('Event removed');
    }
  };

  const toggleDayMap = (date: string) => {
    setExpandedDayMaps(prev => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          {/* Trip cover strip */}
          <div
            className="px-4 pt-4 pb-3 relative"
            style={{ background: trip.coverGradient ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <div className="absolute inset-0 map-overlay-full" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => navigate('/app')}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <ArrowLeft size={16} className="text-white" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShareModalOpen(true)}
                    className="flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    <Share2 size={12} />
                    Share
                  </button>
                  <button
                    onClick={() => navigate(`/trip/${trip.id}/expenses`)}
                    className="flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    <DollarSign size={12} />
                    Expenses
                  </button>
                  <button
                    onClick={() => navigate(`/trip/${trip.id}/settings`)}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    <Settings size={13} className="text-white" />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {trip.emoji && <span className="text-2xl">{trip.emoji}</span>}
                    <h1 className="text-white font-black text-xl leading-tight">{trip.name}</h1>
                  </div>
                  <p className="text-white/60 text-xs mt-0.5">{trip.destination} · {trip.travelers.length} travelers</p>
                </div>
                <CollabAvatars
                  connected={false}
                  peers={[]}
                  localUser={trip.travelers[0] ? { name: trip.travelers[0].name, color: trip.travelers[0].color } : null}
                  onCopyLink={handleCopyLink}
                  shareUrl={shareUrl}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── VIEW TABS ────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20" style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView('itinerary')}
              className="flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-all"
              style={{
                color: view === 'itinerary' ? 'var(--text)' : 'var(--text-3)',
                borderBottom: view === 'itinerary' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <ClipboardList size={16} />
              Itinerary
            </button>
            <button
              onClick={() => setView('ideas')}
              className="flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-all"
              style={{
                color: view === 'ideas' ? 'var(--text)' : 'var(--text-3)',
                borderBottom: view === 'ideas' ? '2px solid #f59e0b' : '2px solid transparent',
              }}
            >
              <Lightbulb size={16} />
              Ideas
              {trip.ideaBank && trip.ideaBank.length > 0 && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: '#f59e0b', color: 'white' }}
                >
                  {trip.ideaBank.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      {view === 'ideas' ? (
        <IdeaBankPanel
          ideas={trip.ideaBank || []}
          travelers={trip.travelers}
          onAddIdea={() => {
            setIsAddingIdea(true);
            setEditEvent(null);
            setAddSheetOpen(true);
          }}
          onAddToItinerary={(ideaId, date) => {
            promoteIdeaToItinerary(trip.id, ideaId, date);
            toast.success('Added to itinerary!');
          }}
          onEditIdea={(idea) => {
            setIsAddingIdea(true);
            setEditEvent(idea);
            setAddSheetOpen(true);
          }}
          onDeleteIdea={(ideaId) => {
            if (confirm('Delete this idea?')) {
              deleteIdea(trip.id, ideaId);
            }
          }}
        />
      ) : (
        <>
          {/* ── TIMELINE ────────────────────────────────────────────────────────── */}
          <div className="max-w-6xl mx-auto md:flex md:gap-8 md:px-8 md:py-6">
          <div className="flex-1 min-w-0 px-4 py-5 pb-28 md:px-0 md:max-w-2xl">
        {dayGroups.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-4 flex justify-center"><ClipboardList size={48} style={{ color: 'var(--text-3)' }} /></div>
            <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>No events yet</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-3)' }}>Start building your itinerary</p>
            <button
              onClick={() => handleOpenAdd()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white"
              style={{ background: 'var(--accent)' }}
            >
              <Plus size={16} />
              Add First Event
            </button>
          </div>
        ) : (
          dayGroups.map((day, dayIdx) => {
            const activeHotel = getActiveHotel(trip.events, day.date);
            const mealGap = detectMealGap(day.events, day.date);
            const dayMapOpen = expandedDayMaps.has(day.date);

            // Collect stops with coordinates for this day's map
            const dayStops = day.events
              .map((e, i) => {
                const coords = EVENT_COORDS[e.id];
                return coords ? { lat: coords[0], lng: coords[1], label: e.title, index: i + 1 } : null;
              })
              .filter(Boolean) as Array<{ lat: number; lng: number; label: string; index: number }>;

            return (
              <div key={day.date}>
                {/* ── Day Header ─────────────────────────────────────── */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <div className="flex items-center gap-2">
                    <div
                      className="text-xs font-black uppercase tracking-[0.18em] px-3.5 py-1.5 rounded-full"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                    >
                      {day.label}
                    </div>
                    {dayStops.length > 1 && (
                      <button
                        onClick={() => toggleDayMap(day.date)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        style={{
                          background: dayMapOpen ? `var(--accent)` : 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          color: dayMapOpen ? '#fff' : 'var(--text-3)',
                        }}
                        title="Toggle day map"
                      >
                        <Map size={12} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>

                {/* Overnight hotel pill */}
                {dayIdx > 0 && activeHotel && (
                  <OvernightIndicator hotelName={activeHotel.hotelName} />
                )}

                {/* Day map */}
                <AnimatePresence>
                  {dayMapOpen && dayStops.length > 1 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 200, opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mb-4"
                    >
                      <DayMap stops={dayStops} height={195} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Meal nudge */}
                {mealGap.hasMealGap && day.events.length > 0 && (
                  <MealNudge mealType={mealGap.mealType} />
                )}

                {/* Events */}
                <div className="space-y-1">
                  {day.events.map((event, evtIdx) => {
                    const nextEvent = day.events[evtIdx + 1] ?? dayGroups[dayIdx + 1]?.events[0];
                    const preKey = `${event.id}→${nextEvent?.id}`;
                    const precomputed = PRECOMPUTED_TRAVEL[preKey];

                    const travelEst = precomputed
                      ? {
                          mode: 'transit' as const,
                          minutes: precomputed.minutes,
                          distanceKm: 0,
                          label: precomputed.label,
                          emoji: precomputed.emoji,
                          isGap: false,
                          isOvernight: nextEvent?.date !== event.date,
                        }
                      : estimateTravelTime(
                          EVENT_COORDS[event.id] ?? null,
                          nextEvent ? EVENT_COORDS[nextEvent.id] ?? null : null,
                          event.date, event.endTime ?? event.time,
                          nextEvent?.date ?? event.date, nextEvent?.time,
                          nextEvent?.type,
                        );

                    return (
                      <div key={event.id}>
                        <EventCard
                          event={event}
                          travelers={trip.travelers}
                          onEdit={handleEditEvent}
                          onDelete={handleDeleteEvent}
                          index={evtIdx + dayIdx * 5}
                        />

                        {/* Travel / gap indicator */}
                        {nextEvent && (
                          <TravelIndicator
                            estimate={travelEst}
                            onAddEvent={() => handleOpenAdd(event.date)}
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Add to day */}
                  <motion.button
                    onClick={() => handleOpenAdd(day.date)}
                    whileHover={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm transition-colors"
                    style={{
                      border: '1.5px dashed var(--border)',
                      color: 'var(--text-3)',
                      background: 'transparent',
                    }}
                  >
                    <Plus size={14} />
                    Add to {day.label.split(' — ')[1] ?? 'day'}
                  </motion.button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Desktop right column: sticky AI panel hint ── */}
      <div className="hidden md:flex flex-col w-80 shrink-0 pt-5">
        <div
          className="sticky top-24 rounded-2xl p-5 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(16,185,129,0.15)' }}>
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>AI Travel Assistant</h3>
          <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-3)' }}>
            Let AI help you plan days, add restaurants, or suggest activities for {trip.destination}.
          </p>
          <button
            onClick={() => setAiOpen(true)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            Open AI Assistant
          </button>
        </div>
      </div>
      </div>

      {/* ── FABs ────────────────────────────────────────────────────────────── */}
      {/* AI Agent FAB */}
      <motion.button
        onClick={() => setAiOpen(true)}
        className="fixed bottom-24 right-4 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: 'var(--accent)', boxShadow: '0 4px 20px var(--accent-glow)' }}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.06 }}
        title="AI Travel Assistant"
      >
        <Sparkles size={20} color="#fff" />
      </motion.button>

      {/* Add Event FAB */}
      <div className="fixed bottom-6 right-4 z-30">
        <motion.button
          onClick={() => handleOpenAdd()}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white"
          style={{ background: 'var(--accent)', boxShadow: '0 4px 20px var(--accent-glow)' }}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.06 }}
        >
          <Plus size={24} />
        </motion.button>
      </div>
        </>
      )}

      {/* AI Agent Panel */}
      <AIAgentPanel
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        trip={trip}
      />

      {/* ── ADD/EDIT SHEET ───────────────────────────────────────────────────── */}
      <AddEventSheet
        isOpen={addSheetOpen}
        onClose={() => { setAddSheetOpen(false); setEditEvent(null); }}
        onSave={handleSaveEvent}
        defaultDate={insertDate}
        editEvent={editEvent}
        travelers={trip.travelers}
      />

      {/* ── SHARE MODAL ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {shareModalOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setShareModalOpen(false)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[85vh] flex flex-col"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
              </div>
              <div className="px-5 pt-3 pb-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-black" style={{ color: 'var(--text)' }}>Share Trip</h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>Choose what to share</p>
                  </div>
                  <button onClick={() => setShareModalOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--bg-elevated)' }}>
                    <X size={16} style={{ color: 'var(--text-2)' }} />
                  </button>
                </div>

                {/* Public view */}
                <div className="rounded-2xl p-4 mb-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={15} style={{ color: 'var(--accent)' }} />
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Public View</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                      Read-only
                    </span>
                  </div>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-3)' }}>
                    Beautiful travel-magazine layout. Share with anyone — no account needed.
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-xl px-3 py-2 text-xs font-mono truncate"
                      style={{ background: 'var(--bg-input)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
                      {shareUrl}
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                      style={{
                        background: linkCopied ? 'rgba(16,185,129,0.2)' : 'var(--bg)',
                        color: linkCopied ? 'var(--accent)' : 'var(--text)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {linkCopied ? <Check size={12} /> : <Copy size={12} />}
                      {linkCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <button
                    onClick={() => { setShareModalOpen(false); navigate(`/trip/${trip.id}/share`); }}
                    className="mt-2 w-full text-center text-xs py-1"
                    style={{ color: 'var(--accent)' }}
                  >
                    Preview →
                  </button>
                </div>

                {/* Collab link */}
                <div className="rounded-2xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 size={15} style={{ color: '#10b981' }} />
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Collaboration Link</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                      Can edit
                    </span>
                  </div>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-3)' }}>
                    Real-time P2P sync. Co-travelers can add and edit events live.
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-xl px-3 py-2 text-xs font-mono truncate"
                      style={{ background: 'var(--bg-input)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
                      {editUrl}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(editUrl)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                {'share' in navigator && (
                  <button
                    onClick={async () => {
                      await navigator.share({ title: trip.name, url: shareUrl });
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    <Share2 size={16} />
                    Share via…
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
