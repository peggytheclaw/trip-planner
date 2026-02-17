import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Calendar, Users, Plane, ChevronRight, Map, Globe, CreditCard, Share2, X, Check } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { formatDate } from '../utils/itineraryUtils';
import { Trip } from '../types';
import LandingMap from '../components/LandingMap';

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

function useWaitlist() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(() => {
    return !!localStorage.getItem('wanderplan_waitlist');
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    localStorage.setItem('wanderplan_waitlist', email);
    setSubmitted(true);
  };

  return { email, setEmail, submitted, submit };
}

export default function TripList() {
  const navigate = useNavigate();
  const { trips, setCurrentTrip, createTrip } = useTripStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: '', destination: '', startDate: '', endDate: '', emoji: '✈️'
  });
  const { email, setEmail, submitted, submit } = useWaitlist();

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
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* ── HERO SECTION WITH MAP ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Full-screen dark map background */}
        <div className="absolute inset-0 z-0">
          <LandingMap />
        </div>

        {/* Gradient overlay — map fades to dark at bottom */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `
              linear-gradient(to bottom,
                rgba(10,10,10,0.2) 0%,
                rgba(10,10,10,0.1) 30%,
                rgba(10,10,10,0.6) 60%,
                rgba(10,10,10,0.95) 85%,
                #0a0a0a 100%
              )
            `,
          }}
        />

        {/* Top nav */}
        <nav className="relative z-20 flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#10b981' }}
            >
              <Plane size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Wanderplan</span>
          </div>
          {trips.length > 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ backgroundColor: '#141414', border: '1px solid #242424', color: '#9ca3af' }}
            >
              <Plus size={15} />
              New Trip
            </button>
          )}
        </nav>

        {/* Hero content */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 text-center -mt-16">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ backgroundColor: '#10b98120', color: '#10b981', border: '1px solid #10b98140' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Now in beta
            </div>

            <h1 className="text-white font-black leading-[1.05] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)' }}
            >
              Plan your next<br />
              <span style={{ color: '#10b981' }}>adventure</span> together
            </h1>

            <p className="text-lg mb-10 max-w-md mx-auto leading-relaxed" style={{ color: '#9ca3af' }}>
              Collaborative itineraries, shared expenses, beautiful memories.
            </p>

            {/* Waitlist CTA */}
            {!submitted ? (
              <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto mb-5">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 rounded-xl text-sm outline-none text-white placeholder-gray-600"
                  style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
                  style={{ backgroundColor: '#10b981' }}
                >
                  Get Early Access
                </button>
              </form>
            ) : (
              <div
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold mb-5"
                style={{ backgroundColor: '#10b98120', color: '#10b981', border: '1px solid #10b98140' }}
              >
                <Check size={16} />
                You're on the list! We'll be in touch.
              </div>
            )}

            {/* View demo */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/trip/tokyo-2025-demo')}
                className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl transition-all hover:opacity-80"
                style={{ color: '#9ca3af', border: '1px solid #242424' }}
              >
                View Demo Trip →
              </button>
            </div>
          </motion.div>
        </div>

        {/* Feature highlights */}
        <div className="relative z-20 pb-16 px-6">
          <div className="max-w-lg mx-auto grid grid-cols-3 gap-4">
            {[
              { icon: '🗺️', label: 'Visual Itinerary', desc: 'Map-based planning' },
              { icon: '💸', label: 'Split Expenses', desc: 'Auto-calculated splits' },
              { icon: '✈️', label: 'Share Beautifully', desc: 'Travel-mag style view' },
            ].map(f => (
              <div
                key={f.label}
                className="text-center p-4 rounded-2xl"
                style={{ backgroundColor: '#0f0f0f', border: '1px solid #1a1a1a' }}
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="text-white text-xs font-semibold mb-1">{f.label}</div>
                <div className="text-xs" style={{ color: '#6b7280' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── YOUR TRIPS SECTION ─────────────────────────────────────────── */}
      {trips.length > 0 && (
        <section className="px-5 pb-24" style={{ backgroundColor: '#0a0a0a' }}>
          <div className="max-w-lg mx-auto">
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white text-lg">Your Trips</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: '#6b7280' }}>{trips.length} trip{trips.length !== 1 ? 's' : ''}</span>
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                  style={{ backgroundColor: '#10b981', color: 'white' }}
                >
                  <Plus size={13} />
                  New
                </button>
              </div>
            </div>

            {/* Trip cards */}
            <div className="space-y-4">
              {trips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} index={i} onOpen={handleOpen} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── EMPTY STATE ────────────────────────────────────────────────── */}
      {trips.length === 0 && (
        <section className="px-6 pb-24">
          <div className="max-w-lg mx-auto text-center">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ backgroundColor: '#141414', border: '1px dashed #2a2a2a', color: '#9ca3af' }}
            >
              <Plus size={16} style={{ color: '#10b981' }} />
              Create your first trip
            </button>
          </div>
        </section>
      )}

      {/* ── CREATE TRIP SHEET ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
              onClick={() => setShowCreate(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
              style={{ backgroundColor: '#141414', border: '1px solid #242424' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#2a2a2a' }} />
              </div>
              <div className="px-5 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">New Trip</h2>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#242424', color: '#9ca3af' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-[auto_1fr] gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>Icon</label>
                    <input
                      type="text"
                      value={newTrip.emoji}
                      onChange={e => setNewTrip(p => ({ ...p, emoji: e.target.value }))}
                      className="w-14 text-center text-2xl rounded-xl px-2 py-2 outline-none text-white"
                      style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>Trip Name</label>
                    <input
                      type="text"
                      value={newTrip.name}
                      onChange={e => setNewTrip(p => ({ ...p, name: e.target.value }))}
                      placeholder="Tokyo Adventure"
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white placeholder-gray-600"
                      style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>Destination</label>
                  <input
                    type="text"
                    value={newTrip.destination}
                    onChange={e => setNewTrip(p => ({ ...p, destination: e.target.value }))}
                    placeholder="Tokyo, Japan"
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white placeholder-gray-600"
                    style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>Start Date</label>
                    <input
                      type="date"
                      value={newTrip.startDate}
                      onChange={e => setNewTrip(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white"
                      style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', colorScheme: 'dark' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>End Date</label>
                    <input
                      type="date"
                      value={newTrip.endDate}
                      onChange={e => setNewTrip(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white"
                      style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', colorScheme: 'dark' }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!newTrip.name || !newTrip.destination}
                  className="w-full py-3.5 rounded-2xl font-semibold transition-all disabled:opacity-40 text-white"
                  style={{ backgroundColor: '#10b981' }}
                >
                  Create Trip
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Trip Card ────────────────────────────────────────────────────────────────

function TripCard({ trip, index, onOpen }: { trip: Trip; index: number; onOpen: (t: Trip) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => onOpen(trip)}
      className="overflow-hidden cursor-pointer group"
      style={{
        backgroundColor: '#141414',
        border: '1px solid #242424',
        borderRadius: '16px',
      }}
      whileHover={{ borderColor: '#3a3a3a' }}
    >
      {/* Cover gradient */}
      <div
        className="h-24 relative flex items-end px-5 pb-4"
        style={{ background: trip.coverGradient ?? GRADIENTS[0] }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }} />
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2">
            {trip.emoji && <span className="text-2xl">{trip.emoji}</span>}
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">{trip.name}</h3>
              <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
                <MapPin size={10} />
                {trip.destination}
              </div>
            </div>
          </div>
        </div>
        <ChevronRight
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 transition-transform group-hover:translate-x-1"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        />
      </div>

      {/* Info row */}
      <div className="px-5 py-3 flex items-center gap-4 text-sm" style={{ color: '#9ca3af' }}>
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {formatDate(trip.startDate)}
          {trip.endDate !== trip.startDate && ` – ${formatDate(trip.endDate)}`}
        </span>
        {trip.travelers.length > 0 && (
          <span className="flex items-center gap-1">
            <Users size={12} />
            {trip.travelers.length}
          </span>
        )}
        <span className="ml-auto text-xs" style={{ color: '#3a3a3a' }}>
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
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  backgroundColor: t.color,
                  border: '2px solid #141414',
                }}
                title={t.name}
              >
                {t.name.charAt(0)}
              </div>
            ))}
          </div>
          <span className="text-xs" style={{ color: '#6b7280' }}>
            {trip.travelers.map(t => t.name).join(', ')}
          </span>
        </div>
      )}
    </motion.div>
  );
}
