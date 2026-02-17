import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Copy, Check, Link2 } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import PackList from '../components/PackList';
import { toast } from '../components/Toast';

const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EF4444',
  '#EC4899', '#06B6D4', '#84CC16', '#F59E0B', '#6366F1',
];

const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white";
const inputSty = { backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a' };

export default function TripSettings() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { getTripById, updateTrip, addTraveler, removeTraveler, deleteTrip } = useTripStore();
  const trip = getTripById(tripId!);

  const [linkCopied, setLinkCopied] = useState(false);
  const [showAddTraveler, setShowAddTraveler] = useState(false);
  const [newTraveler, setNewTraveler] = useState({ name: '', color: AVATAR_COLORS[0] });
  const [tripForm, setTripForm] = useState({
    name: trip?.name ?? '',
    destination: trip?.destination ?? '',
    startDate: trip?.startDate ?? '',
    endDate: trip?.endDate ?? '',
    emoji: trip?.emoji ?? '',
  });
  const [saved, setSaved] = useState(false);

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <p className="text-gray-400">Trip not found.</p>
    </div>
  );

  const shareUrl = `${window.location.origin}/trip/${trip.id}/share`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSaveTripInfo = () => {
    updateTrip(trip.id, tripForm);
    setSaved(true);
    toast.success('Trip updated ✓');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddTraveler = () => {
    if (!newTraveler.name) return;
    addTraveler(trip.id, {
      name: newTraveler.name,
      color: newTraveler.color,
    });
    setNewTraveler({ name: '', color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] });
    setShowAddTraveler(false);
    toast.success(`${newTraveler.name} added ✓`);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: '#0a0a0a', borderBottom: '1px solid #1a1a1a' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(`/trip/${tripId}`)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#1a1a1a', color: '#9ca3af' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-bold text-white">Trip Settings</h1>
            <p className="text-xs" style={{ color: '#6b7280' }}>{trip.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* ── Share Link ─────────────────────────────────────────────────────── */}
        <section className="rounded-2xl p-5" style={{ backgroundColor: '#141414', border: '1px solid #242424' }}>
          <div className="flex items-center gap-2 mb-3">
            <Link2 size={16} style={{ color: '#10b981' }} />
            <h2 className="font-semibold text-white">Share Link</h2>
          </div>
          <p className="text-xs mb-3 leading-relaxed" style={{ color: '#6b7280' }}>
            Share this link to let anyone view the beautiful travel-magazine view of this trip.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 rounded-xl px-3 py-2.5 text-xs font-mono overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ backgroundColor: '#1e1e1e', color: '#6b7280', border: '1px solid #2a2a2a' }}>
              {shareUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-white"
              style={{
                backgroundColor: linkCopied ? '#10b981' : '#1a1a1a',
                border: '1px solid #2a2a2a',
              }}
            >
              {linkCopied ? <Check size={12} /> : <Copy size={12} />}
              {linkCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </section>

        {/* ── Trip Info ──────────────────────────────────────────────────────── */}
        <section className="rounded-2xl p-5" style={{ backgroundColor: '#141414', border: '1px solid #242424' }}>
          <h2 className="font-semibold text-white mb-4">Trip Details</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>Icon</label>
                <input
                  type="text"
                  value={tripForm.emoji}
                  onChange={e => setTripForm(p => ({ ...p, emoji: e.target.value }))}
                  className="w-14 text-center text-xl rounded-xl px-2 py-2.5 outline-none text-white"
                  style={inputSty}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>Trip Name</label>
                <input type="text" value={tripForm.name}
                  onChange={e => setTripForm(p => ({ ...p, name: e.target.value }))}
                  className={inputCls} style={inputSty} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>Destination</label>
              <input type="text" value={tripForm.destination}
                onChange={e => setTripForm(p => ({ ...p, destination: e.target.value }))}
                className={inputCls} style={inputSty} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>Start Date</label>
                <input type="date" value={tripForm.startDate}
                  onChange={e => setTripForm(p => ({ ...p, startDate: e.target.value }))}
                  className={inputCls} style={{ ...inputSty, colorScheme: 'dark' }} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>End Date</label>
                <input type="date" value={tripForm.endDate}
                  onChange={e => setTripForm(p => ({ ...p, endDate: e.target.value }))}
                  className={inputCls} style={{ ...inputSty, colorScheme: 'dark' }} />
              </div>
            </div>
            <button
              onClick={handleSaveTripInfo}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all text-white"
              style={{ backgroundColor: saved ? '#10b981' : '#1a1a1a', border: '1px solid #2a2a2a' }}
            >
              {saved ? '✓ Saved' : 'Save Changes'}
            </button>
          </div>
        </section>

        {/* ── Travelers ─────────────────────────────────────────────────────── */}
        <section className="rounded-2xl p-5" style={{ backgroundColor: '#141414', border: '1px solid #242424' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Travelers ({trip.travelers.length})</h2>
            <button
              onClick={() => setShowAddTraveler(!showAddTraveler)}
              className="flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: '#10b981' }}
            >
              <Plus size={14} />
              Add person
            </button>
          </div>

          {/* Add traveler form */}
          {showAddTraveler && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-xl p-3 mb-4 space-y-3"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
            >
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>Name</label>
                <input
                  type="text"
                  value={newTraveler.name}
                  onChange={e => setNewTraveler(p => ({ ...p, name: e.target.value }))}
                  placeholder="Sam"
                  autoFocus
                  className={inputCls} style={inputSty}
                  onKeyDown={e => e.key === 'Enter' && handleAddTraveler()}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>Color</label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewTraveler(p => ({ ...p, color }))}
                      className="w-7 h-7 rounded-full transition-transform"
                      style={{
                        backgroundColor: color,
                        border: `2px solid ${newTraveler.color === color ? '#fff' : 'transparent'}`,
                        transform: newTraveler.color === color ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddTraveler}
                  disabled={!newTraveler.name}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                  style={{ backgroundColor: '#10b981' }}
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddTraveler(false)}
                  className="px-4 py-2 rounded-xl text-sm"
                  style={{ color: '#9ca3af', border: '1px solid #2a2a2a' }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Traveler list */}
          <div className="space-y-2">
            {trip.travelers.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: '#6b7280' }}>No travelers added yet</p>
            ) : (
              trip.travelers.map(traveler => (
                <div key={traveler.id} className="flex items-center gap-3 py-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: traveler.color }}
                  >
                    {traveler.emoji || traveler.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{traveler.name}</div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${traveler.name}?`)) {
                        removeTraveler(trip.id, traveler.id);
                        toast.info(`${traveler.name} removed`);
                      }
                    }}
                    className="transition-colors"
                    style={{ color: '#4b5563' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── Pack List ─────────────────────────────────────────────────────── */}
        <section className="rounded-2xl p-5" style={{ backgroundColor: '#141414', border: '1px solid #242424' }}>
          <PackList tripId={trip.id} />
        </section>

        {/* ── Danger Zone ───────────────────────────────────────────────────── */}
        <section className="rounded-2xl p-5" style={{ backgroundColor: '#141414', border: '1px solid #3f0f0f' }}>
          <h2 className="font-semibold mb-2" style={{ color: '#ef4444' }}>Danger Zone</h2>
          <p className="text-xs mb-3" style={{ color: '#6b7280' }}>These actions cannot be undone.</p>
          <button
            onClick={() => {
              if (confirm('Delete this trip and all its data? This cannot be undone.')) {
                deleteTrip(trip.id);
                navigate('/app');
                toast.info('Trip deleted');
              }
            }}
            className="text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            style={{ color: '#ef4444', border: '1px solid #3f0f0f', backgroundColor: '#1a0a0a' }}
          >
            Delete Trip
          </button>
        </section>
      </div>
    </div>
  );
}
