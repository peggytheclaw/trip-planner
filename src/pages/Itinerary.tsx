import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Share2, DollarSign, Settings, Plus, Check
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { groupEventsByDay, getActiveHotel, detectMealGap } from '../utils/itineraryUtils';
import type { TripEvent } from '../types';
import EventCard from '../components/EventCard';
import DayDivider from '../components/DayDivider';
import BetweenIndicator from '../components/BetweenIndicator';
import AddEventSheet from '../components/AddEventSheet';
import CollabAvatars from '../components/CollabAvatars';

export default function Itinerary() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { getTripById, addEvent, updateEvent, deleteEvent, setCurrentTrip } = useTripStore();

  const trip = getTripById(tripId!);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<TripEvent | null>(null);
  const [insertDate, setInsertDate] = useState<string | undefined>();
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (trip) setCurrentTrip(trip.id);
  }, [trip?.id]);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Trip not found.{' '}
        <button className="text-blue-500 ml-2" onClick={() => navigate('/')}>Go back</button>
      </div>
    );
  }

  const dayGroups = groupEventsByDay(trip.events);
  const shareUrl = `${window.location.origin}/trip/${trip.id}`;

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-lg mx-auto">
          {/* Trip cover strip */}
          <div
            className="px-4 pt-4 pb-3 relative"
            style={{ background: trip.coverGradient ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <div className="absolute inset-0 bg-black/25" />
            <div className="relative z-10">
              {/* Back + actions row */}
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => navigate('/')}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {linkCopied ? <Check size={12} /> : <Share2 size={12} />}
                    {linkCopied ? 'Copied!' : 'Share'}
                  </button>
                  <button
                    onClick={() => navigate(`/trip/${trip.id}/expenses`)}
                    className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    <DollarSign size={12} />
                    Expenses
                  </button>
                  <button
                    onClick={() => navigate(`/trip/${trip.id}/settings`)}
                    className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
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
                  <p className="text-white/75 text-xs mt-0.5">
                    {trip.destination} · {trip.travelers.length} traveler{trip.travelers.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {/* Collab avatars */}
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

      {/* Timeline */}
      <div className="max-w-lg mx-auto px-4 py-4 pb-24">
        {dayGroups.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-semibold text-gray-700 mb-1">No events yet</h3>
            <p className="text-sm text-gray-400 mb-5">Start adding events to build your itinerary</p>
            <button
              onClick={() => handleOpenAdd()}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium text-sm"
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
                {/* Day divider */}
                <DayDivider
                  label={day.label}
                  date={day.date}
                  hotelName={dayIdx > 0 ? activeHotel?.hotelName : undefined}
                />

                {/* Meal gap nudge at top of day */}
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
                <div className="space-y-3">
                  {day.events.map((event, evtIdx) => (
                    <div key={event.id}>
                      {/* Add between button (before first event) */}
                      {evtIdx === 0 && (
                        <div className="flex justify-center py-1 opacity-0 hover:opacity-100 transition-opacity group">
                          <button
                            onClick={() => handleOpenAdd(day.date)}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 px-3 py-1
                                       rounded-full hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
                          >
                            <Plus size={12} />
                            Insert event
                          </button>
                        </div>
                      )}

                      <EventCard
                        event={event}
                        onEdit={handleEditEvent}
                        onDelete={handleDeleteEvent}
                        index={evtIdx + dayIdx * 5}
                      />

                      {/* Connector / add between */}
                      {evtIdx < day.events.length - 1 && (
                        <div className="flex items-center justify-center py-1 group">
                          <div className="flex-1 flex items-center justify-center gap-2">
                            <div className="w-px h-4 bg-gray-200" />
                          </div>
                          <button
                            onClick={() => handleOpenAdd(day.date)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 px-2.5 py-1
                                       rounded-full hover:bg-blue-50 border border-transparent hover:border-blue-100
                                       opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Plus size={11} />
                          </button>
                          <div className="flex-1 flex items-center justify-center gap-2">
                            <div className="w-px h-4 bg-gray-200" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add at end of day */}
                  <button
                    onClick={() => handleOpenAdd(day.date)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200
                               rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50
                               transition-all"
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
          className="w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center
                     hover:bg-gray-800 active:bg-black"
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
    </div>
  );
}
