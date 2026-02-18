import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plane, Search, MapPin, Calendar, Users, ArrowRight,
  Compass, Bookmark, TrendingUp, Star,
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { sampleTrip } from '../data/sampleTrip';
import { nycTemplate, euroTemplate, baliTemplate, amalfiTemplate, patagoniaTemplate, moroccoTemplate, icelandTemplate, thailandTemplate } from '../data/templates';
import type { Trip } from '../types';

// ─── Seeded community trips (the "discover" feed) ─────────────────────────────

interface CommunityTrip {
  trip: Trip;
  author: string;
  authorColor: string;
  views: number;
  saves: number;
  featured?: boolean;
  tags: string[];
}

const COMMUNITY_TRIPS: CommunityTrip[] = [
  {
    trip: sampleTrip,
    author: 'Alex & friends',
    authorColor: '#3B82F6',
    views: 3241,
    saves: 187,
    featured: true,
    tags: ['Asia', 'Culture', 'Foodie', 'First-timer'],
  },
  {
    trip: nycTemplate,
    author: 'Jordan K.',
    authorColor: '#F97316',
    views: 2108,
    saves: 134,
    tags: ['USA', 'City break', 'Weekend', 'Culture'],
  },
  {
    trip: euroTemplate,
    author: 'Sam & Taylor',
    authorColor: '#10B981',
    views: 4872,
    saves: 312,
    featured: true,
    tags: ['Europe', 'Budget', 'Backpacking', 'Multi-city'],
  },
  {
    trip: baliTemplate,
    author: 'Priya T.',
    authorColor: '#8B5CF6',
    views: 1934,
    saves: 98,
    tags: ['Asia', 'Wellness', 'Nature', 'Couples'],
  },
  {
    trip: amalfiTemplate,
    author: 'Marco & Lucia',
    authorColor: '#56ab2f',
    views: 2190,
    saves: 147,
    featured: true,
    tags: ['Europe', 'Couples', 'Road trip', 'Food'],
  },
  {
    trip: patagoniaTemplate,
    author: 'Mike R.',
    authorColor: '#2980b9',
    views: 1843,
    saves: 122,
    tags: ['South America', 'Adventure', 'Trekking', 'Nature'],
  },
  {
    trip: moroccoTemplate,
    author: 'Sofia L.',
    authorColor: '#e96c2b',
    views: 1543,
    saves: 89,
    tags: ['Africa', 'Culture', 'Solo', 'Budget'],
  },
  {
    trip: icelandTemplate,
    author: 'Emma & Chris',
    authorColor: '#43cea2',
    views: 2671,
    saves: 203,
    featured: true,
    tags: ['Europe', 'Road trip', 'Adventure', 'Nature'],
  },
  {
    trip: thailandTemplate,
    author: 'Dan & crew',
    authorColor: '#f7971e',
    views: 3318,
    saves: 241,
    tags: ['Asia', 'Beach', 'Party', 'Budget'],
  },
];

const ALL_TAGS = ['All', 'Asia', 'Europe', 'USA', 'Budget', 'Adventure', 'Culture', 'Beach', 'City break', 'Solo', 'Couples'];

const SORT_OPTIONS = [
  { value: 'trending', label: '🔥 Trending' },
  { value: 'saves', label: '🔖 Most saved' },
  { value: 'newest', label: '✨ Newest' },
];

// ─── Trip Card ────────────────────────────────────────────────────────────────

function DiscoverCard({ community, index, onOpen, onFork }: {
  community: CommunityTrip;
  index: number;
  onOpen: () => void;
  onFork: () => void;
}) {
  const { trip, author, authorColor, views, saves, featured, tags } = community;
  const nights = Math.max(1,
    Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
    >
      {/* Cover */}
      <div
        className="h-36 relative flex items-end px-4 pb-3"
        style={{ background: trip.coverGradient ?? '#667eea' }}
        onClick={onOpen}
      >
        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />
        {featured && (
          <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full z-10">
            ⭐ Featured
          </div>
        )}
        <div className="relative z-10 flex items-end gap-2.5 w-full">
          <span className="text-3xl flex-shrink-0">{trip.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="text-white font-black text-lg leading-tight truncate">{trip.name}</div>
            <div className="flex items-center gap-1 text-white/75 text-xs truncate">
              <MapPin size={10} />
              {trip.destination}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {nights} night{nights !== 1 ? 's' : ''}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            {trip.events.length} events
          </span>
          <span>·</span>
          <span>{views.toLocaleString()} views</span>
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Author + actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: authorColor }}
          >
            {author.charAt(0)}
          </div>
          <span className="text-xs text-gray-500 flex-1">by {author}</span>
          <div className="flex gap-2">
            <button
              onClick={onOpen}
              className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              View <ArrowRight size={11} />
            </button>
            <button
              onClick={onFork}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Use template
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Discover Page ───────────────────────────────────────────────────────

export default function Discover() {
  const navigate = useNavigate();
  const { createTrip, setCurrentTrip } = useTripStore();
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [sort, setSort] = useState('trending');

  const filtered = COMMUNITY_TRIPS.filter(c => {
    const matchesQuery = !query ||
      c.trip.name.toLowerCase().includes(query.toLowerCase()) ||
      c.trip.destination.toLowerCase().includes(query.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    const matchesTag = activeTag === 'All' || c.tags.includes(activeTag);
    return matchesQuery && matchesTag;
  }).sort((a, b) => {
    if (sort === 'saves') return b.saves - a.saves;
    if (sort === 'newest') return new Date(b.trip.startDate).getTime() - new Date(a.trip.startDate).getTime();
    return b.views - a.views; // trending
  });

  const featured = filtered.filter(c => c.featured);
  const rest = filtered.filter(c => !c.featured);

  const handleOpen = (community: CommunityTrip) => {
    // Navigate to share view — for seeded trips without real data, go to tokyo demo
    const realIds = [
      sampleTrip.id,
      nycTemplate.id,
      euroTemplate.id,
      baliTemplate.id,
      amalfiTemplate.id,
      patagoniaTemplate.id,
      moroccoTemplate.id,
      icelandTemplate.id,
      thailandTemplate.id,
    ];
    if (realIds.includes(community.trip.id)) {
      navigate(`/trip/${community.trip.id}/share`);
    } else {
      navigate(`/trip/${sampleTrip.id}/share`);
    }
  };

  const handleFork = async (community: CommunityTrip) => {
    const realIds: Record<string, Trip> = {
      [sampleTrip.id]: sampleTrip,
      [nycTemplate.id]: nycTemplate,
      [euroTemplate.id]: euroTemplate,
      [baliTemplate.id]: baliTemplate,
      [amalfiTemplate.id]: amalfiTemplate,
      [patagoniaTemplate.id]: patagoniaTemplate,
      [moroccoTemplate.id]: moroccoTemplate,
      [icelandTemplate.id]: icelandTemplate,
      [thailandTemplate.id]: thailandTemplate,
    };
    const sourceTrip = realIds[community.trip.id] ?? sampleTrip;
    const newTrip = await createTrip({
      name: sourceTrip.name + ' (copy)',
      destination: sourceTrip.destination,
      emoji: sourceTrip.emoji,
      startDate: sourceTrip.startDate,
      endDate: sourceTrip.endDate,
      coverGradient: sourceTrip.coverGradient,
      travelers: [],
      events: sourceTrip.events.map(e => ({
        ...e,
        id: e.id + '-fork-' + Date.now(),
      })) as typeof sourceTrip.events,
    });
    setCurrentTrip(newTrip.id);
    navigate(`/trip/${newTrip.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4">
          {/* Top nav */}
          <div className="flex items-center gap-3 py-3 border-b border-gray-50">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group"
            >
              <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                <Plane size={13} className="text-white" />
              </div>
              <span className="font-black text-gray-900 text-base tracking-tight hidden sm:block">Roteiro</span>
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <div className="flex items-center gap-1.5 text-gray-500">
              <Compass size={15} />
              <span className="font-semibold text-gray-900 text-sm">Discover</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => navigate('/app')}
                className="bg-gray-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl"
              >
                + New trip
              </button>
            </div>
          </div>

          {/* Search + filters */}
          <div className="py-3 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search destinations, activities, travel styles..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:bg-white"
              />
            </div>

            {/* Tags + sort */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
              <div className="flex gap-1.5 flex-1">
                {ALL_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                      activeTag === tag
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex-shrink-0">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="text-xs bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-600 focus:outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 pb-16">
        {/* Hero stat bar */}
        <div className="flex items-center gap-4 mb-6 text-sm text-gray-400">
          <TrendingUp size={14} className="text-blue-400" />
          <span>{COMMUNITY_TRIPS.length} trips from the community</span>
          <span className="ml-auto text-xs">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Featured section */}
        {featured.length > 0 && activeTag === 'All' && !query && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Star size={13} className="text-amber-400" fill="currentColor" />
              Featured trips
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((c, i) => (
                <DiscoverCard
                  key={c.trip.id}
                  community={c}
                  index={i}
                  onOpen={() => handleOpen(c)}
                  onFork={() => handleFork(c)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All results */}
        {(query || activeTag !== 'All') ? (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c, i) => (
                <DiscoverCard
                  key={c.trip.id}
                  community={c}
                  index={i}
                  onOpen={() => handleOpen(c)}
                  onFork={() => handleFork(c)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              All community trips
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((c, i) => (
                <DiscoverCard
                  key={c.trip.id}
                  community={c}
                  index={i}
                  onOpen={() => handleOpen(c)}
                  onFork={() => handleFork(c)}
                />
              ))}
              {COMMUNITY_TRIPS.filter(c => !c.featured).map((c, i) => (
                <DiscoverCard
                  key={c.trip.id + '-r'}
                  community={c}
                  index={rest.length + i}
                  onOpen={() => handleOpen(c)}
                  onFork={() => handleFork(c)}
                />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔭</div>
            <h3 className="font-bold text-gray-700 mb-1">No trips found</h3>
            <p className="text-sm text-gray-400">Try a different search or filter</p>
            <button
              onClick={() => { setQuery(''); setActiveTag('All'); }}
              className="mt-4 text-sm text-blue-500 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Share your trip CTA */}
        <div className="mt-12 bg-gradient-to-br from-gray-900 to-indigo-950 rounded-3xl p-8 text-center">
          <div className="text-4xl mb-3">🌍</div>
          <h3 className="text-white font-black text-2xl mb-2">Share your trip with the world</h3>
          <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto">
            Create an itinerary and hit "Share" — it instantly becomes a beautiful
            public page that inspires others to travel.
          </p>
          <button
            onClick={() => navigate('/app')}
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-2xl hover:bg-gray-100 transition-colors"
          >
            <Plane size={15} />
            Start planning
          </button>
        </div>
      </div>
    </div>
  );
}
