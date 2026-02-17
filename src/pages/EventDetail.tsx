import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import EventCard from '../components/EventCard';

export default function EventDetail() {
  const { tripId, eventId } = useParams<{ tripId: string; eventId: string }>();
  const navigate = useNavigate();
  const trip = useTripStore(s => s.getTripById(tripId!));
  const event = trip?.events.find(e => e.id === eventId);

  if (!trip || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: '#0a0a0a' }}>
        <div className="text-4xl">🔍</div>
        <h1 className="font-bold text-white">Event not found</h1>
        <button onClick={() => navigate(`/trip/${tripId}`)}
          className="text-sm px-4 py-2 rounded-xl"
          style={{ color: '#10b981', border: '1px solid #10b98140' }}>
          ← Back to itinerary
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <div className="sticky top-0 z-10" style={{ background: '#0a0a0a', borderBottom: '1px solid #1a1a1a' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(`/trip/${tripId}`)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#1a1a1a', color: '#9ca3af' }}>
            <ArrowLeft size={16} />
          </button>
          <h1 className="font-bold text-white">Event Details</h1>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-6">
        <EventCard event={event} />
        {event.notes && (
          <div className="mt-4 rounded-2xl p-4" style={{ backgroundColor: '#141414', border: '1px solid #242424' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>Notes</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>{event.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
