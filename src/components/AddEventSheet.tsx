import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { EventType, TripEvent, Traveler } from '../types';
import { EVENT_ICONS, EVENT_LABELS } from '../utils/itineraryUtils';
import { toast } from './Toast';
import ParticipantSelector from './ParticipantSelector';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
}

interface AddEventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<TripEvent, 'id' | 'createdAt'>) => void;
  defaultDate?: string;
  editEvent?: TripEvent | null;
  travelers: Traveler[];
}

const EVENT_TYPES: EventType[] = ['flight', 'hotel', 'restaurant', 'activity', 'transport', 'train', 'note'];

export default function AddEventSheet({
  isOpen, onClose, onSave, defaultDate, editEvent, travelers
}: AddEventSheetProps) {
  const [eventType, setEventType] = useState<EventType>('activity');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const isDesktop = useIsDesktop();

  // Reset form whenever sheet opens or editEvent changes
  useEffect(() => {
    if (isOpen) {
      setEventType(editEvent?.type ?? 'activity');
      setFormData(
        editEvent
          ? { ...editEvent }
          : {
              date: defaultDate ?? new Date().toISOString().split('T')[0],
              time: '09:00',
            }
      );
      // Auto-focus the first meaningful input after animation settles
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, editEvent, defaultDate]);

  const update = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const title =
      formData.title ??
      formData.restaurantName ??
      formData.hotelName ??
      formData.activityName ??
      formData.trainName ??
      'Event';
    const base = {
      type: eventType,
      date: formData.date ?? defaultDate ?? new Date().toISOString().split('T')[0],
      time: formData.time,
      title,
      ...formData,
    };
    onSave(base as Omit<TripEvent, 'id' | 'createdAt'>);
    toast.success(editEvent ? 'Event updated ✓' : 'Event added ✓');
    onClose();
  };

  // Shared inner content
  const sheetContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #242424' }}>
        <h2 className="text-lg font-bold text-white">
          {editEvent ? 'Edit Event' : 'Add Event'}
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1a1a1a', color: '#9ca3af' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Event Type Selector */}
        {!editEvent && (
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#6b7280' }}>
              Event Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {EVENT_TYPES.map(type => {
                const selected = eventType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setEventType(type)}
                    className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all"
                    style={{
                      border: `2px solid ${selected ? '#10b981' : '#242424'}`,
                      backgroundColor: selected ? '#10b98120' : '#1a1a1a',
                    }}
                  >
                    <span className="text-xl">{EVENT_ICONS[type]}</span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: selected ? '#10b981' : '#6b7280' }}
                    >
                      {EVENT_LABELS[type]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>Date</label>
            <input
              type="date"
              value={formData.date ?? ''}
              onChange={e => update('date', e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white"
              style={{ backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a', colorScheme: 'dark' }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>Time</label>
            <input
              type="time"
              value={formData.time ?? ''}
              onChange={e => update('time', e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white"
              style={{ backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a', colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Participants */}
        {travelers.length > 0 && (
          <ParticipantSelector
            travelers={travelers}
            selectedParticipants={formData.participants || []}
            onChange={(participants) => update('participants', participants)}
          />
        )}

        {/* Dynamic form fields */}
        <EventForm eventType={eventType} formData={formData} update={update} travelers={travelers} firstInputRef={firstInputRef} />

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>Notes</label>
          <textarea
            value={formData.notes ?? ''}
            onChange={e => update('notes', e.target.value)}
            placeholder="Any additional info..."
            rows={2}
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white resize-none"
            style={{ backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a' }}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid #242424' }}>
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#10b981' }}
        >
          <Save size={16} />
          Save to Itinerary
        </button>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: isDesktop ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.6)', backdropFilter: isDesktop ? 'blur(4px)' : 'none' }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {isDesktop ? (
            /* ── Desktop: centered modal ── */
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                className="pointer-events-auto w-full max-h-[85vh] flex flex-col rounded-3xl shadow-2xl"
                style={{
                  maxWidth: 640,
                  backgroundColor: '#141414',
                  border: '1px solid #2a2a2a',
                }}
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ type: 'spring', damping: 30, stiffness: 380 }}
              >
                {sheetContent}
              </motion.div>
            </div>
          ) : (
            /* ── Mobile: bottom sheet ── */
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col"
              style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#2a2a2a' }} />
              </div>
              {sheetContent}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: '#6b7280' }}>{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white";
const inputStyle = { backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a' };
const selectStyle = { backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a', color: '#f5f5f5' };

const Input = React.forwardRef<HTMLInputElement, {
  value: string | number | undefined; onChange: (v: string) => void; placeholder?: string; type?: string; autoFocus?: boolean;
}>(function Input({ value, onChange, placeholder, type = 'text', autoFocus }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={inputClass}
      style={inputStyle}
    />
  );
});

function EventForm({ eventType, formData, update, travelers, firstInputRef }: {
  eventType: EventType;
  formData: Record<string, any>;
  update: (key: string, value: any) => void;
  travelers: Traveler[];
  firstInputRef: React.Ref<HTMLInputElement>;
}) {
  switch (eventType) {
    case 'flight':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Airline">
              <Input ref={firstInputRef} value={formData.airline} onChange={v => update('airline', v)} placeholder="United Airlines" />
            </Field>
            <Field label="Flight #">
              <Input value={formData.flightNumber} onChange={v => update('flightNumber', v)} placeholder="UA837" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From (IATA)">
              <Input value={formData.fromAirport} onChange={v => update('fromAirport', v)} placeholder="SFO" />
            </Field>
            <Field label="From City">
              <Input value={formData.fromCity} onChange={v => update('fromCity', v)} placeholder="San Francisco" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="To (IATA)">
              <Input value={formData.toAirport} onChange={v => update('toAirport', v)} placeholder="NRT" />
            </Field>
            <Field label="To City">
              <Input value={formData.toCity} onChange={v => update('toCity', v)} placeholder="Tokyo" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Departure">
              <input type="time" value={formData.departureTime ?? ''} onChange={e => update('departureTime', e.target.value)}
                className={inputClass} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </Field>
            <Field label="Arrival">
              <input type="time" value={formData.arrivalTime ?? ''} onChange={e => update('arrivalTime', e.target.value)}
                className={inputClass} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Arrival Date">
              <input type="date" value={formData.arrivalDate ?? ''} onChange={e => update('arrivalDate', e.target.value)}
                className={inputClass} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </Field>
            <Field label="Duration">
              <Input value={formData.duration} onChange={v => update('duration', v)} placeholder="10h 45m" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cabin">
              <select value={formData.cabin ?? 'Economy'} onChange={e => update('cabin', e.target.value)}
                className={inputClass} style={selectStyle}>
                <option>Economy</option>
                <option>Premium Economy</option>
                <option>Business</option>
                <option>First</option>
              </select>
            </Field>
            <Field label="Confirmation #">
              <Input value={formData.confirmationNumber} onChange={v => update('confirmationNumber', v)} placeholder="ABC123" />
            </Field>
          </div>
        </div>
      );

    case 'hotel':
      return (
        <div className="space-y-3">
          <Field label="Hotel Name">
            <Input ref={firstInputRef} value={formData.hotelName} onChange={v => update('hotelName', v)} placeholder="Park Hyatt Tokyo" />
          </Field>
          <Field label="Neighborhood / Area">
            <Input value={formData.neighborhood} onChange={v => update('neighborhood', v)} placeholder="Shinjuku" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check-in Time">
              <input type="time" value={formData.checkInTime ?? ''} onChange={e => update('checkInTime', e.target.value)}
                className={inputClass} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </Field>
            <Field label="Check-out Date">
              <input type="date" value={formData.checkOutDate ?? ''} onChange={e => update('checkOutDate', e.target.value)}
                className={inputClass} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check-out Time">
              <input type="time" value={formData.checkOutTime ?? ''} onChange={e => update('checkOutTime', e.target.value)}
                className={inputClass} style={{ ...inputStyle, colorScheme: 'dark' }} />
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
            <Input ref={firstInputRef} value={formData.restaurantName} onChange={v => update('restaurantName', v)} placeholder="Ichiran Ramen" />
          </Field>
          <Field label="Cuisine">
            <Input value={formData.cuisine} onChange={v => update('cuisine', v)} placeholder="Japanese" />
          </Field>
          <Field label="Reservation Status">
            <select value={formData.reservationStatus ?? 'none'} onChange={e => update('reservationStatus', e.target.value)}
              className={inputClass} style={selectStyle}>
              <option value="none">No reservation</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed ✓</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Address">
              <Input value={formData.address} onChange={v => update('address', v)} placeholder="Shinjuku, Tokyo" />
            </Field>
            <Field label="Price range">
              <Input value={formData.price} onChange={v => update('price', v)} placeholder="$$" />
            </Field>
          </div>
        </div>
      );

    case 'activity':
      return (
        <div className="space-y-3">
          <Field label="Activity Name">
            <Input ref={firstInputRef} value={formData.activityName} onChange={v => update('activityName', v)} placeholder="Senso-ji Temple" />
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
            <select value={formData.transportType ?? 'car'} onChange={e => update('transportType', e.target.value)}
              className={inputClass} style={selectStyle}>
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
          <Field label="Provider">
            <Input value={formData.provider} onChange={v => update('provider', v)} placeholder="Uber, MTA, etc." />
          </Field>
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
                className={inputClass} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </Field>
            <Field label="Arrives">
              <input type="time" value={formData.arrivalTime ?? ''} onChange={e => update('arrivalTime', e.target.value)}
                className={inputClass} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ticket Class">
              <Input value={formData.ticketClass} onChange={v => update('ticketClass', v)} placeholder="2nd Class" />
            </Field>
            <Field label="Confirmation #">
              <Input value={formData.confirmationNumber} onChange={v => update('confirmationNumber', v)} placeholder="XYZ-123" />
            </Field>
          </div>
        </div>
      );

    case 'note':
      return (
        <div className="space-y-3">
          <Field label="Title">
            <Input ref={firstInputRef} value={formData.title} onChange={v => update('title', v)} placeholder="Packing reminder..." />
          </Field>
          <Field label="Content">
            <textarea
              value={formData.content ?? ''}
              onChange={e => update('content', e.target.value)}
              placeholder="Write your note..."
              rows={4}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white resize-none"
              style={{ backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a' }}
            />
          </Field>
        </div>
      );

    default:
      return null;
  }
}
