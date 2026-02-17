import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import EventCard from '../components/EventCard';

export default function EventDetail() {
  const { tripId, eventId } = useParams<{ tripId: string; eventId: string }>();
  const navigate = useNavigate();
  const trip = useTripStore(s => s.getTripById(tripId!));
  const event = trip?.events.find(e => e.id === eventId);

  if (!trip || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Event not found.{' '}
        <button className="text-blue-500 ml-2" onClick={() => navigate(`/trip/${tripId}`)}>Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(`/trip/${tripId}`)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <ArrowLeft size={16} />
          </button>
          <h1 className="font-bold text-gray-900 flex-1">Event Details</h1>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-6">
        <EventCard event={event} />
        {event.notes && (
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{event.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
