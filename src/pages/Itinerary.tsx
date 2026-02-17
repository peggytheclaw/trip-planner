import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Share2, DollarSign, Settings, Plus, Check, Copy, X, Eye
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { groupEventsByDay, getActiveHotel, detectMealGap } from '../utils/itineraryUtils';
import type { TripEvent } from '../types';
import EventCard from '../components/EventCard';
import DayDivider from '../components/DayDivider';
import BetweenIndicator from '../components/BetweenIndicator';
import AddEventSheet from '../components/AddEventSheet';
import CollabAvatars from '../components/CollabAvatars';
import TripHeroMap from '../components/TripHeroMap';

export default function Itinerary() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { getTripById, addEvent, updateEvent, deleteEvent, setCurrentTrip } = useTripStore();

  const trip = getTripById(tripId!);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<TripEvent | null>(null);
  const [insertDate, setInsertDate] = useState<string | undefined>();
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (trip) setCurrentTrip(trip.id);
  }, [trip?.id]);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="text-center">
          <p style={{ color: '#6b7280' }}>Trip not found.</p>
          <button
            className="mt-2 text-sm"
            style={{ color: '#10b981' }}
            onClick={() => navigate('/')}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const dayGroups = groupEventsByDay(trip.events);
  const shareUrl = `${window.location.origin}/trip/${trip.id}/share`;
  const editUrl = `${window.location.origin}/trip/${trip.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSaveEvent = (eventData: Omit<TripEvent, 'id' | 'createdAt'>) => {
    if (editEvent) {
      updateEvent(trip.id, editEvent.id, eventData);
    } else {
      addEvent(trip.id, eventData);
    }
    setEditEvent(null);
    setInsertDate(undefined);
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
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20" style={{ backgroundColor: '#0a0a0a', borderBottom: '1px solid #1a1a1a' }}>
        <div className="max-w-lg mx-auto">
          {/* Trip cover strip */}
          <div
            className="px-4 pt-4 pb-3 relative"
            style={{ background: trip.coverGradient ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} />
            <div className="relative z-10">
              {/* Back + actions row */}
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => navigate('/')}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShareModalOpen(true)}
                    className="flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <Share2 size={12} />
                    Share
                  </button>
                  <button
                    onClick={() => navigate(`/trip/${trip.id}/expenses`)}
                    className="flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <DollarSign size={12} />
                    Expenses
                  </button>
                  <button
                    onClick={() => navigate(`/trip/${trip.id}/settings`)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <Settings size={14} />
                  </button>
                </div>
              </div>
              {/* Trip title */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {trip.emoji && <span className="text-2xl">{trip.emoji}</span>}
                    <h1 className="text-white font-bold text-xl leading-tight">{trip.name}</h1>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {trip.destination} · {trip.travelers.length} traveler{trip.travelers.length !== 1 ? 's' : ''}
                  </p>
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

      {/* ── HERO MAP ────────────────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto">
        <TripHeroMap events={trip.events} height={280} />
      </div>

      {/* ── TIMELINE ────────────────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 py-4 pb-24">
        {dayGroups.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-semibold text-white mb-1">No events yet</h3>
            <p className="text-sm mb-5" style={{ color: '#6b7280' }}>Start adding events to build your itinerary</p>
            <button
              onClick={() => handleOpenAdd()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white transition-all"
              style={{ backgroundColor: '#10b981' }}
            >
              <Plus size={16} />
              Add First Event
            </button>
          </div>
        ) : (
          dayGroups.map((day, dayIdx) => {
            const activeHotel = getActiveHotel(trip.events, day.date);
            const mealGap = detectMealGap(day.events, day.date);

            return (
              <div key={day.date}>
                {/* Day divider with map */}
                <DayDivider
                  label={day.label}
                  date={day.date}
                  hotelName={dayIdx > 0 ? activeHotel?.hotelName : undefined}
                  events={day.events}
                />

                {/* Meal gap nudge */}
                {mealGap.hasMealGap && day.events.length > 0 && (
                  <div className="mb-2">
                    <BetweenIndicator
                      type="meal-gap"
                      label={`No ${mealGap.mealType} planned!`}
                      showAdd
                      onAdd={() => handleOpenAdd(day.date)}
                    />
                  </div>
                )}

                {/* Events */}
                <div className="space-y-0">
                  {day.events.map((event, evtIdx) => (
                    <div key={event.id}>
                      {/* Add between button (before first event) */}
                      {evtIdx === 0 && (
                        <div className="flex justify-center py-1 opacity-0 hover:opacity-100 transition-opacity group">
                          <button
                            onClick={() => handleOpenAdd(day.date)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full hover:opacity-80 transition-all"
                            style={{ color: '#6b7280' }}
                          >
                            <Plus size={12} />
                            Insert event
                          </button>
                        </div>
                      )}

                      <div className="mb-3">
                        <EventCard
                          event={event}
                          onEdit={handleEditEvent}
                          onDelete={handleDeleteEvent}
                          index={evtIdx + dayIdx * 5}
                        />
                      </div>

                      {/* Travel time pill + connector between events */}
                      {evtIdx < day.events.length - 1 && (
                        <div className="flex items-center group mb-0">
                          <div className="flex-1">
                            <BetweenIndicator
                              type="travel-time"
                              fromEvent={event}
                              toEvent={day.events[evtIdx + 1]}
                            />
                          </div>
                          <button
                            onClick={() => handleOpenAdd(day.date)}
                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full mr-1
                                       opacity-0 group-hover:opacity-100 transition-all"
                            style={{ color: '#6b7280' }}
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add at end of day */}
                  <button
                    onClick={() => handleOpenAdd(day.date)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all mt-3"
                    style={{
                      border: '2px dashed #1e1e1e',
                      color: '#6b7280',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#10b98140';
                      (e.currentTarget as HTMLElement).style.color = '#10b981';
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#10b98108';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#1e1e1e';
                      (e.currentTarget as HTMLElement).style.color = '#6b7280';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <Plus size={14} />
                    Add event to {day.label.split(' — ')[1] ?? 'this day'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-4 z-30">
        <motion.button
          onClick={() => handleOpenAdd()}
          className="w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center"
          style={{ backgroundColor: '#10b981', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
        >
          <Plus size={24} />
        </motion.button>
      </div>

      {/* Add/Edit Event Sheet */}
      <AddEventSheet
        isOpen={addSheetOpen}
        onClose={() => { setAddSheetOpen(false); setEditEvent(null); }}
        onSave={handleSaveEvent}
        defaultDate={insertDate}
        editEvent={editEvent}
        travelers={trip.travelers}
      />

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
              onClick={() => setShareModalOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-2xl"
              style={{ backgroundColor: '#141414', border: '1px solid #242424' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#2a2a2a' }} />
              </div>
              <div className="px-5 pt-3 pb-8">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-black text-white">Share Trip</h2>
                    <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>Anyone with these links can view or edit</p>
                  </div>
                  <button
                    onClick={() => setShareModalOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#242424', color: '#9ca3af' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Public view link */}
                <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={15} style={{ color: '#10b981' }} />
                    <span className="text-white font-semibold text-sm">Public View</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
                      Read-only
                    </span>
                  </div>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: '#6b7280' }}>
                    A beautiful travel-magazine-style view. Share with family and friends — no account needed.
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-xl px-3 py-2 text-xs font-mono truncate"
                      style={{ backgroundColor: '#0a0a0a', color: '#9ca3af', border: '1px solid #242424' }}>
                      {shareUrl}
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                      style={linkCopied
                        ? { backgroundColor: '#10b981', color: 'white' }
                        : { backgroundColor: '#10b981', color: 'white' }
                      }
                    >
                      {linkCopied ? <Check size={12} /> : <Copy size={12} />}
                      {linkCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <button
                    onClick={() => { setShareModalOpen(false); navigate(`/trip/${trip.id}/share`); }}
                    className="mt-2 w-full text-center text-xs py-1 transition-colors"
                    style={{ color: '#10b981' }}
                  >
                    Preview public view →
                  </button>
                </div>

                {/* Collab link */}
                <div className="rounded-2xl p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 size={15} style={{ color: '#9ca3af' }} />
                    <span className="text-white font-semibold text-sm">Collaboration Link</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: '#1a2a1a', color: '#86efac' }}>
                      Can edit
                    </span>
                  </div>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: '#6b7280' }}>
                    Real-time peer-to-peer sync via WebRTC. Co-travelers can add and edit events together.
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-xl px-3 py-2 text-xs font-mono truncate"
                      style={{ backgroundColor: '#0a0a0a', color: '#9ca3af', border: '1px solid #242424' }}>
                      {editUrl}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(editUrl)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                      style={{ backgroundColor: '#242424', color: '#9ca3af' }}
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                  </div>
                </div>

                {'share' in navigator && (
                  <button
                    onClick={async () => {
                      await navigator.share({
                        title: `${trip.name} — ${trip.destination}`,
                        text: `Check out my trip itinerary!`,
                        url: shareUrl,
                      });
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white"
                    style={{ backgroundColor: '#242424' }}
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
