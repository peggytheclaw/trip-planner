import { useState } from 'react';
import { Lightbulb, Plus, ArrowRight, Calendar } from 'lucide-react';
import { TripEvent, Traveler } from '../types';
import EventCard from './EventCard';
import { motion } from 'framer-motion';

interface IdeaBankPanelProps {
  ideas: TripEvent[];
  travelers: Traveler[];
  onAddIdea: () => void;
  onAddToItinerary: (ideaId: string, date: string) => void;
  onEditIdea: (idea: TripEvent) => void;
  onDeleteIdea: (ideaId: string) => void;
}

/**
 * IdeaBankPanel — Research phase before arranging into timeline.
 * Shows unscheduled event ideas that can be promoted to the itinerary.
 */
export default function IdeaBankPanel({
  ideas,
  travelers,
  onAddIdea,
  onAddToItinerary,
  onEditIdea,
  onDeleteIdea,
}: IdeaBankPanelProps) {
  const [addingToItinerary, setAddingToItinerary] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handlePromoteIdea = (ideaId: string) => {
    if (selectedDate) {
      onAddToItinerary(ideaId, selectedDate);
      setAddingToItinerary(null);
      setSelectedDate('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' }}
          >
            <Lightbulb size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black" style={{ color: 'var(--text)' }}>
              Idea Bank
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>
              Research & collect ideas — add them to your itinerary when ready
            </p>
          </div>
        </div>
        <button
          onClick={onAddIdea}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: '#f59e0b', color: 'white' }}
        >
          <Plus size={16} />
          Add Idea
        </button>
      </div>

      {/* Ideas Grid */}
      {ideas.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">💡</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-2)' }}>
            No ideas yet
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-3)' }}>
            Start collecting restaurants, activities, and places you want to visit
          </p>
          <button
            onClick={onAddIdea}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm"
            style={{ backgroundColor: '#f59e0b', color: 'white' }}
          >
            <Plus size={16} />
            Add Your First Idea
          </button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {ideas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <EventCard
                event={idea}
                travelers={travelers}
                onEdit={onEditIdea}
                onDelete={onDeleteIdea}
                index={index}
              />

              {/* Add to Itinerary overlay */}
              <div className="mt-2">
                {addingToItinerary === idea.id ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <Calendar size={14} style={{ color: 'var(--text-3)' }} />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: 'var(--text)', colorScheme: 'dark' }}
                      autoFocus
                    />
                    <button
                      onClick={() => handlePromoteIdea(idea.id)}
                      disabled={!selectedDate}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      style={{ backgroundColor: '#10b981', color: 'white' }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAddingToItinerary(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ backgroundColor: 'var(--bg)', color: 'var(--text-3)' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingToItinerary(idea.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                  >
                    <ArrowRight size={14} />
                    Add to Itinerary
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
