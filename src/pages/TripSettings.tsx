import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Copy, Check, Link2 } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { Traveler } from '../types';

const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EF4444',
  '#EC4899', '#06B6D4', '#84CC16', '#F59E0B', '#6366F1',
];

export default function TripSettings() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { getTripById, updateTrip, addTraveler, removeTraveler } = useTripStore();
  const trip = getTripById(tripId!);

  const [linkCopied, setLinkCopied] = useState(false);
  const [showAddTraveler, setShowAddTraveler] = useState(false);
  const [newTraveler, setNewTraveler] = useState({ name: '', color: AVATAR_COLORS[0], emoji: '' });
  const [tripForm, setTripForm] = useState({
    name: trip?.name ?? '',
    destination: trip?.destination ?? '',
    startDate: trip?.startDate ?? '',
    endDate: trip?.endDate ?? '',
    emoji: trip?.emoji ?? '',
  });

  if (!trip) return <div className="p-8 text-center">Trip not found</div>;

  const shareUrl = `${window.location.origin}/trip/${trip.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSaveTripInfo = () => {
    updateTrip(trip.id, tripForm);
  };

  const handleAddTraveler = () => {
    if (!newTraveler.name) return;
    addTraveler(trip.id, {
      name: newTraveler.name,
      color: newTraveler.color,
      emoji: newTraveler.emoji || undefined,
    });
    setNewTraveler({ name: '', color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)], emoji: '' });
    setShowAddTraveler(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(`/trip/${tripId}`)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-bold text-gray-900">Trip Settings</h1>
            <p className="text-xs text-gray-400">{trip.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Share Link */}
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Link2 size={16} className="text-blue-500" />
            <h2 className="font-semibold text-gray-800">Collaboration Link</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Share this link with friends. Anyone with it can view and edit this trip in real-time.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-white rounded-xl px-3 py-2.5 text-xs text-gray-600 font-mono border border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
              {shareUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                linkCopied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {linkCopied ? <Check size={12} /> : <Copy size={12} />}
              {linkCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            Real-time sync via WebRTC — no server needed
          </p>
        </section>

        {/* Trip Info */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Trip Details</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Icon</label>
                <input
                  type="text"
                  value={tripForm.emoji}
                  onChange={e => setTripForm(p => ({ ...p, emoji: e.target.value }))}
                  className="w-14 text-center text-xl border border-gray-200 rounded-xl px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Trip Name</label>
                <input
                  type="text"
                  value={tripForm.name}
                  onChange={e => setTripForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Destination</label>
              <input
                type="text"
                value={tripForm.destination}
                onChange={e => setTripForm(p => ({ ...p, destination: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Start Date</label>
                <input type="date" value={tripForm.startDate} onChange={e => setTripForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">End Date</label>
                <input type="date" value={tripForm.endDate} onChange={e => setTripForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>
            </div>
            <button
              onClick={handleSaveTripInfo}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </section>

        {/* Travelers */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Travelers ({trip.travelers.length})</h2>
            <button
              onClick={() => setShowAddTraveler(!showAddTraveler)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
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
              className="bg-gray-50 rounded-xl p-3 mb-4 space-y-3"
            >
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Name</label>
                <input
                  type="text"
                  value={newTraveler.name}
                  onChange={e => setNewTraveler(p => ({ ...p, name: e.target.value }))}
                  placeholder="Sam"
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  onKeyDown={e => e.key === 'Enter' && handleAddTraveler()}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewTraveler(p => ({ ...p, color }))}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        newTraveler.color === color ? 'border-gray-400 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddTraveler}
                  disabled={!newTraveler.name}
                  className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddTraveler(false)}
                  className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-gray-200"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Traveler list */}
          <div className="space-y-2">
            {trip.travelers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No travelers added yet</p>
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
                    <div className="font-medium text-gray-800">{traveler.name}</div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${traveler.name}?`)) removeTraveler(trip.id, traveler.id);
                    }}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Danger zone */}
        <section className="bg-white rounded-2xl border border-red-100 p-5">
          <h2 className="font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-xs text-gray-400 mb-3">These actions cannot be undone.</p>
          <button
            onClick={() => {
              if (confirm('Delete this trip and all its data? This cannot be undone.')) {
                useTripStore.getState().deleteTrip(trip.id);
                navigate('/');
              }
            }}
            className="text-sm text-red-500 font-medium border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
          >
            Delete Trip
          </button>
        </section>
      </div>
    </div>
  );
}
