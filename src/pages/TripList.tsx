import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, MapPin, Calendar, Users, Plane, ChevronRight } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { formatDate } from '../utils/itineraryUtils';
import { Trip } from '../types';

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

export default function TripList() {
  const navigate = useNavigate();
  const { trips, setCurrentTrip, createTrip } = useTripStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: '', destination: '', startDate: '', endDate: '', emoji: '✈️'
  });

  const handleOpen = (trip: Trip) => {
    setCurrentTrip(trip.id);
    navigate(`/trip/${trip.id}`);
  };

  const handleCreate = () => {
    if (!newTrip.name || !newTrip.destination) return;
    const trip = createTrip({
      name: newTrip.name,
      destination: newTrip.destination,
      emoji: newTrip.emoji,
      startDate: newTrip.startDate || new Date().toISOString().split('T')[0],
      endDate: newTrip.endDate || new Date().toISOString().split('T')[0],
      travelers: [],
      coverGradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
    });
    setCurrentTrip(trip.id);
    navigate(`/trip/${trip.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Plane size={20} className="text-blue-500" />
                <h1 className="text-xl font-bold text-gray-900">Wanderplan</h1>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Plan trips with friends</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold
                         hover:bg-gray-800 active:bg-black transition-colors"
            >
              <Plus size={16} />
              New Trip
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Your Trips</h2>
          <span className="text-xs text-gray-400">{trips.length} trip{trips.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Trip cards */}
        {trips.map((trip, i) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => handleOpen(trip)}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer
                       active:scale-[0.98] transition-transform hover:shadow-md"
          >
            {/* Cover */}
            <div
              className="h-28 relative flex items-end px-5 pb-4"
              style={{ background: trip.coverGradient ?? GRADIENTS[0] }}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  {trip.emoji && (
                    <span className="text-3xl">{trip.emoji}</span>
                  )}
                  <div>
                    <h3 className="text-white font-bold text-xl leading-tight">{trip.name}</h3>
                    <div className="flex items-center gap-1 text-white/80 text-xs">
                      <MapPin size={11} />
                      {trip.destination}
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70" />
            </div>

            {/* Info */}
            <div className="px-5 py-3 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {formatDate(trip.startDate)}
                {trip.endDate !== trip.startDate && ` – ${formatDate(trip.endDate)}`}
              </span>
              {trip.travelers.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users size={13} />
                  {trip.travelers.length} traveler{trip.travelers.length !== 1 ? 's' : ''}
                </span>
              )}
              <span className="ml-auto text-xs text-gray-300">
                {trip.events.length} events
              </span>
            </div>

            {/* Traveler avatars */}
            {trip.travelers.length > 0 && (
              <div className="px-5 pb-3 flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {trip.travelers.slice(0, 5).map(t => (
                    <div
                      key={t.id}
                      className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: t.color }}
                      title={t.name}
                    >
                      {t.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {trip.travelers.map(t => t.name).join(', ')}
                </span>
              </div>
            )}
          </motion.div>
        ))}

        {trips.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="font-semibold text-gray-700 mb-1">No trips yet</h3>
            <p className="text-sm text-gray-400">Create your first trip and start planning!</p>
          </div>
        )}
      </div>

      {/* Create Trip Sheet */}
      {showCreate && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowCreate(false)} />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="px-5 py-4 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">New Trip</h2>

              <div className="grid grid-cols-[auto_1fr] gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Icon</label>
                  <input
                    type="text"
                    value={newTrip.emoji}
                    onChange={e => setNewTrip(p => ({ ...p, emoji: e.target.value }))}
                    className="w-14 text-center text-2xl border border-gray-200 rounded-xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Trip Name</label>
                  <input
                    type="text"
                    value={newTrip.name}
                    onChange={e => setNewTrip(p => ({ ...p, name: e.target.value }))}
                    placeholder="Tokyo Adventure"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Destination</label>
                <input
                  type="text"
                  value={newTrip.destination}
                  onChange={e => setNewTrip(p => ({ ...p, destination: e.target.value }))}
                  placeholder="Tokyo, Japan"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={newTrip.startDate}
                    onChange={e => setNewTrip(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={newTrip.endDate}
                    onChange={e => setNewTrip(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!newTrip.name || !newTrip.destination}
                className="w-full bg-gray-900 text-white py-3.5 rounded-2xl font-semibold disabled:opacity-40 hover:bg-gray-800 transition-colors"
              >
                Create Trip
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
