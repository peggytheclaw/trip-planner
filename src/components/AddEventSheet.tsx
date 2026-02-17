import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { EventType, TripEvent, Traveler } from '../types';
import { EVENT_ICONS, EVENT_LABELS } from '../utils/itineraryUtils';

interface AddEventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<TripEvent, 'id' | 'createdAt'>) => void;
  defaultDate?: string;
  editEvent?: TripEvent | null;
  travelers: Traveler[];
}

const EVENT_TYPES: EventType[] = ['flight', 'hotel', 'restaurant', 'activity', 'transport', 'train', 'note'];

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function AddEventSheet({
  isOpen, onClose, onSave, defaultDate, editEvent, travelers
}: AddEventSheetProps) {
  const [eventType, setEventType] = useState<EventType>(editEvent?.type ?? 'activity');
  const [formData, setFormData] = useState<Record<string, any>>(
    editEvent ? { ...editEvent } : {
      date: defaultDate ?? new Date().toISOString().split('T')[0],
      time: '09:00',
    }
  );

  const update = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const base = {
      type: eventType,
      date: formData.date ?? defaultDate ?? new Date().toISOString().split('T')[0],
      time: formData.time,
      title: formData.title ?? formData.restaurantName ?? formData.hotelName ?? formData.activityName ?? 'Event',
      ...formData,
    };
    onSave(base as Omit<TripEvent, 'id' | 'createdAt'>);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 sheet-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editEvent ? 'Edit Event' : 'Add Event'}
              </h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Event Type Selector */}
              {!editEvent && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Event Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {EVENT_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => setEventType(type)}
                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 transition-all
                          ${eventType === type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                          }`}
                      >
                        <span className="text-xl">{EVENT_ICONS[type]}</span>
                        <span className={`text-xs font-medium ${eventType === type ? 'text-blue-600' : 'text-gray-500'}`}>
                          {EVENT_LABELS[type]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Date</label>
                  <input
                    type="date"
                    value={formData.date ?? ''}
                    onChange={e => update('date', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Time</label>
                  <input
                    type="time"
                    value={formData.time ?? ''}
                    onChange={e => update('time', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Dynamic form fields */}
              <EventForm eventType={eventType} formData={formData} update={update} travelers={travelers} />

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Notes</label>
                <textarea
                  value={formData.notes ?? ''}
                  onChange={e => update('notes', e.target.value)}
                  placeholder="Any additional info..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="px-5 py-4 border-t border-gray-100 safe-bottom">
              <button
                onClick={handleSave}
                className="w-full bg-gray-900 text-white py-3.5 rounded-2xl font-semibold text-base flex items-center justify-center gap-2
                           hover:bg-gray-800 active:bg-black transition-colors"
              >
                <Save size={16} />
                Save to Itinerary
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Dynamic Form Fields ──────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
    />
  );
}

function EventForm({ eventType, formData, update, travelers }: {
  eventType: EventType;
  formData: Record<string, any>;
  update: (key: string, value: any) => void;
  travelers: Traveler[];
}) {
  switch (eventType) {
    case 'flight':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Airline">
              <Input value={formData.airline} onChange={v => update('airline', v)} placeholder="United Airlines" />
            </Field>
            <Field label="Flight #">
              <Input value={formData.flightNumber} onChange={v => update('flightNumber', v)} placeholder="UA837" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From (IATA)">
              <Input value={formData.fromAirport} onChange={v => update('fromAirport', v)} placeholder="SFO" />
            </Field>
            <Field label="To (IATA)">
              <Input value={formData.toAirport} onChange={v => update('toAirport', v)} placeholder="NRT" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Departure">
              <input type="time" value={formData.departureTime ?? ''} onChange={e => update('departureTime', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </Field>
            <Field label="Arrival">
              <input type="time" value={formData.arrivalTime ?? ''} onChange={e => update('arrivalTime', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </Field>
          </div>
          <Field label="Confirmation #">
            <Input value={formData.confirmationNumber} onChange={v => update('confirmationNumber', v)} placeholder="UAXYZ789" />
          </Field>
        </div>
      );

    case 'hotel':
      return (
        <div className="space-y-3">
          <Field label="Hotel Name">
            <Input value={formData.hotelName} onChange={v => update('hotelName', v)} placeholder="Park Hyatt Tokyo" />
          </Field>
          <Field label="Neighborhood / Area">
            <Input value={formData.neighborhood} onChange={v => update('neighborhood', v)} placeholder="Shinjuku" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check-out Date">
              <input type="date" value={formData.checkOutDate ?? ''} onChange={e => update('checkOutDate', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </Field>
            <Field label="$ Per Night">
              <Input value={formData.pricePerNight} onChange={v => update('pricePerNight', v)} placeholder="320" type="number" />
            </Field>
          </div>
          <Field label="Confirmation #">
            <Input value={formData.confirmationNumber} onChange={v => update('confirmationNumber', v)} placeholder="PH-89234" />
          </Field>
        </div>
      );

    case 'restaurant':
      return (
        <div className="space-y-3">
          <Field label="Restaurant Name">
            <Input value={formData.restaurantName} onChange={v => update('restaurantName', v)} placeholder="Ichiran Ramen" />
          </Field>
          <Field label="Cuisine">
            <Input value={formData.cuisine} onChange={v => update('cuisine', v)} placeholder="Japanese" />
          </Field>
          <Field label="Reservation Status">
            <select
              value={formData.reservationStatus ?? 'none'}
              onChange={e => update('reservationStatus', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              <option value="none">No reservation</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed ✓</option>
            </select>
          </Field>
          <Field label="Address">
            <Input value={formData.address} onChange={v => update('address', v)} placeholder="Shinjuku, Tokyo" />
          </Field>
        </div>
      );

    case 'activity':
      return (
        <div className="space-y-3">
          <Field label="Activity Name">
            <Input value={formData.activityName} onChange={v => update('activityName', v)} placeholder="Senso-ji Temple" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location">
              <Input value={formData.location} onChange={v => update('location', v)} placeholder="Asakusa" />
            </Field>
            <Field label="Duration">
              <Input value={formData.duration} onChange={v => update('duration', v)} placeholder="2h" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price ($)">
              <Input value={formData.price} onChange={v => update('price', v)} placeholder="0" type="number" />
            </Field>
            <Field label="Category">
              <Input value={formData.category} onChange={v => update('category', v)} placeholder="Culture" />
            </Field>
          </div>
          <Field label="Booking Info">
            <Input value={formData.bookingInfo} onChange={v => update('bookingInfo', v)} placeholder="Ticket # or details" />
          </Field>
        </div>
      );

    case 'transport':
      return (
        <div className="space-y-3">
          <Field label="Type">
            <select
              value={formData.transportType ?? 'car'}
              onChange={e => update('transportType', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              <option value="car">🚗 Car</option>
              <option value="taxi">🚕 Taxi/Uber</option>
              <option value="bus">🚌 Bus</option>
              <option value="subway">🚇 Subway</option>
              <option value="ferry">⛴️ Ferry</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From">
              <Input value={formData.fromLocation} onChange={v => update('fromLocation', v)} placeholder="Airport" />
            </Field>
            <Field label="To">
              <Input value={formData.toLocation} onChange={v => update('toLocation', v)} placeholder="Hotel" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duration">
              <Input value={formData.duration} onChange={v => update('duration', v)} placeholder="30 min" />
            </Field>
            <Field label="Cost ($)">
              <Input value={formData.cost} onChange={v => update('cost', v)} placeholder="15" type="number" />
            </Field>
          </div>
        </div>
      );

    case 'train':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Train Name">
              <Input value={formData.trainName} onChange={v => update('trainName', v)} placeholder="Narita Express" />
            </Field>
            <Field label="Train #">
              <Input value={formData.trainNumber} onChange={v => update('trainNumber', v)} placeholder="N'EX" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From Station">
              <Input value={formData.fromStation} onChange={v => update('fromStation', v)} placeholder="Narita Airport" />
            </Field>
            <Field label="To Station">
              <Input value={formData.toStation} onChange={v => update('toStation', v)} placeholder="Shinjuku" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Departs">
              <input type="time" value={formData.departureTime ?? ''} onChange={e => update('departureTime', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </Field>
            <Field label="Arrives">
              <input type="time" value={formData.arrivalTime ?? ''} onChange={e => update('arrivalTime', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
            </Field>
          </div>
        </div>
      );

    case 'note':
      return (
        <div className="space-y-3">
          <Field label="Title">
            <Input value={formData.title} onChange={v => update('title', v)} placeholder="Packing reminder..." />
          </Field>
          <Field label="Content">
            <textarea
              value={formData.content ?? ''}
              onChange={e => update('content', e.target.value)}
              placeholder="Write your note..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
            />
          </Field>
        </div>
      );

    default:
      return null;
  }
}
