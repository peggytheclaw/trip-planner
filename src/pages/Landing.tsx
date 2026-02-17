import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Plane, Users, DollarSign, Share2, Zap, MapPin, Clock, Star,
  ArrowRight, Check, ChevronDown, Globe, Sparkles, Shield,
} from 'lucide-react';
import { useWaitlistStore } from '../store/waitlistStore';
import { useTripStore } from '../store/tripStore';
import { sampleTrip } from '../data/sampleTrip';

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCount({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useState(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 50;
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 30);
    return () => clearInterval(id);
  });

  return <span ref={ref}>{inView ? target : 0}{suffix}</span>;
}

// ─── Mock phone screen showing the Tokyo itinerary cards ─────────────────────
function MockPhone() {
  const cards = [
    {
      type: 'flight', icon: '✈️', color: '#3B82F6', bg: '#EFF6FF',
      title: 'SFO → NRT', sub: 'United UA837 · 10h 45m', time: '11:30 AM',
    },
    {
      type: 'hotel', icon: '🏨', color: '#8B5CF6', bg: '#F5F3FF',
      title: 'Park Hyatt Tokyo', sub: 'Check-in 3:00pm · Shinjuku', time: 'MAR 16',
    },
    {
      type: 'activity', icon: '🎯', color: '#10B981', bg: '#ECFDF5',
      title: 'teamLab Planets', sub: 'Toyosu · $32 per person', time: '11:00 AM',
    },
    {
      type: 'restaurant', icon: '🍜', color: '#F97316', bg: '#FFF7ED',
      title: 'Ichiran Ramen', sub: 'Shinjuku · Reservation ✓', time: '7:30 PM',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: -8 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto"
      style={{ perspective: 1200, width: 280 }}
    >
      {/* Phone shell */}
      <div className="bg-gray-900 rounded-[44px] p-3 shadow-2xl shadow-black/40">
        <div className="bg-gray-50 rounded-[36px] overflow-hidden" style={{ height: 560 }}>
          {/* Status bar */}
          <div className="bg-white px-5 pt-3 pb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-900">9:41</span>
            <div className="w-20 h-4 bg-gray-900 rounded-full" /> {/* notch */}
            <div className="flex gap-1 items-center">
              <div className="w-3 h-2 rounded-sm border border-gray-400" />
            </div>
          </div>

          {/* Trip header */}
          <div
            className="px-4 py-3 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-semibold uppercase tracking-widest mb-1">
                <Plane size={9} />WANDERPLAN
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇯🇵</span>
                <div>
                  <div className="font-black text-base leading-tight">Tokyo Adventure</div>
                  <div className="text-white/70 text-[11px]">Mar 15–22 · 4 people</div>
                </div>
              </div>
            </div>
          </div>

          {/* Day divider */}
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] font-bold text-white bg-gray-800 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
              DAY 2 — Saturday
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Event cards */}
          <div className="px-3 space-y-2 overflow-hidden" style={{ maxHeight: 400 }}>
            {cards.map((card, i) => (
              <motion.div
                key={card.type}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                style={{ borderLeft: `3px solid ${card.color}` }}
              >
                <div className="p-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: card.bg }}>
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-xs leading-tight truncate">{card.title}</div>
                    <div className="text-gray-400 text-[10px] truncate">{card.sub}</div>
                  </div>
                  <div className="text-[10px] font-semibold text-gray-400 flex-shrink-0">{card.time}</div>
                </div>
              </motion.div>
            ))}

            {/* Expense preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl p-2.5 flex items-center justify-between"
            >
              <div>
                <div className="text-white/50 text-[9px] uppercase tracking-wider">Trip total</div>
                <div className="text-white font-black text-sm">$2,340</div>
              </div>
              <div className="text-right">
                <div className="text-white/50 text-[9px]">Your share</div>
                <div className="text-green-400 font-bold text-xs">$585</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating collaboration avatars */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute -right-4 top-16 bg-white rounded-2xl shadow-xl border border-gray-100 px-3 py-2"
      >
        <div className="flex -space-x-1.5 mb-1">
          {['#3B82F6','#10B981','#F97316','#8B5CF6'].map((c, i) => (
            <div key={i} className="w-5 h-5 rounded-full border-2 border-white"
              style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="text-[10px] font-semibold text-gray-600">4 planning</div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] text-green-600 font-medium">Live</span>
        </div>
      </motion.div>

      {/* Floating expense badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute -left-6 bottom-24 bg-white rounded-2xl shadow-xl border border-gray-100 px-3 py-2"
      >
        <div className="text-[10px] text-gray-400 mb-0.5">Alex owes</div>
        <div className="font-black text-gray-900 text-sm">Jordan $45</div>
        <div className="text-[9px] text-emerald-500 font-semibold mt-0.5">✓ Mark settled</div>
      </motion.div>
    </motion.div>
  );
}

// ─── Waitlist Form ────────────────────────────────────────────────────────────
function WaitlistForm({ size = 'hero' }: { size?: 'hero' | 'compact' }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'success' | 'duplicate'>('idle');
  const { addEmail, getCount, hasEmail } = useWaitlistStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    const added = addEmail(email);
    setState(added ? 'success' : 'duplicate');
    if (added) setEmail('');
  };

  if (state === 'success') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl text-green-700
          ${size === 'hero' ? 'px-5 py-4' : 'px-4 py-3'}`}
      >
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Check size={16} className="text-green-600" />
        </div>
        <div>
          <div className="font-bold text-sm">You're on the list! 🎉</div>
          <div className="text-xs text-green-600 mt-0.5">
            You're #{getCount().toLocaleString()} — we'll email you at launch.
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${size === 'hero' ? '' : 'max-w-sm'}`}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className={`flex-1 border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white text-gray-900
          ${size === 'hero'
            ? 'py-3.5 text-base border-gray-200 shadow-sm'
            : 'py-2.5 text-sm border-gray-200'
          }
          ${state === 'duplicate' ? 'border-amber-300 bg-amber-50' : ''}
        `}
      />
      <button
        type="submit"
        className={`bg-gray-900 text-white rounded-xl font-bold whitespace-nowrap
          hover:bg-gray-800 active:bg-black transition-colors
          ${size === 'hero' ? 'px-6 py-3.5 text-base' : 'px-4 py-2.5 text-sm'}`}
      >
        Join waitlist
      </button>
    </form>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon, color, title, description, delay = 0
}: {
  icon: React.ReactNode; color: string; title: string; description: string; delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: color + '18', color }}
      >
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ─── Testimonial ─────────────────────────────────────────────────────────────
function Testimonial({ text, name, role, color }: {
  text: string; name: string; role: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex gap-0.5 mb-3">
        {[1,2,3,4,5].map(i => (
          <Star key={i} size={13} className="text-amber-400" fill="currentColor" />
        ))}
      </div>
      <p className="text-sm text-gray-700 leading-relaxed mb-4">"{text}"</p>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: color }}>
          {name.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-gray-800 text-sm">{name}</div>
          <div className="text-xs text-gray-400">{role}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ eyebrow, title, subtitle }: {
  eyebrow: string; title: string; subtitle?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center mb-10"
    >
      <div className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-3">
        {eyebrow}
      </div>
      <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">{title}</h2>
      {subtitle && <p className="text-gray-500 mt-3 text-base max-w-xl mx-auto leading-relaxed">{subtitle}</p>}
    </motion.div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();
  const { trips } = useTripStore();
  const { getCount, joinedAt } = useWaitlistStore();
  const hasTrips = trips.length > 0;

  const handleTryDemo = () => {
    navigate(`/trip/${sampleTrip.id}`);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
              <Plane size={14} className="text-white" />
            </div>
            <span className="font-black text-gray-900 text-lg tracking-tight">Wanderplan</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/discover')}
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Globe size={14} />
              Discover
            </button>
            {hasTrips && (
              <button
                onClick={() => navigate('/app')}
                className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                My Trips
              </button>
            )}
            <button
              onClick={() => navigate('/app')}
              className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
            >
              {hasTrips ? 'Continue planning' : 'Start free'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.04]"
            style={{
              background: 'radial-gradient(circle, #667eea 0%, transparent 70%)',
              transform: 'translate(20%, -20%)',
            }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.04]"
            style={{
              background: 'radial-gradient(circle, #764ba2 0%, transparent 70%)',
              transform: 'translate(-20%, 20%)',
            }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
        </div>

        <div className="max-w-6xl mx-auto px-5 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left: copy + waitlist */}
            <div className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
              {/* Social proof pill */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 mb-6"
              >
                <div className="flex -space-x-1">
                  {['#3B82F6','#10B981','#F97316'].map((c,i) => (
                    <div key={i} className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-xs font-semibold text-amber-800">
                  {getCount().toLocaleString()}+ travelers on waitlist
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl sm:text-6xl font-black text-gray-900 leading-[1.05] tracking-tight mb-5"
              >
                Trip planning<br />
                <span className="relative inline-block">
                  your friends
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.5, ease: 'easeOut' }}
                    className="absolute -bottom-1 left-0 right-0 h-1 rounded-full origin-left"
                    style={{ background: 'linear-gradient(90deg, #667eea, #764ba2)' }}
                  />
                </span>
                <br />will love.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg"
              >
                Create beautiful itineraries together in real-time,
                split expenses automatically, and share a stunning travel story
                — all in one link. No accounts, no friction.
              </motion.p>

              {/* Waitlist form */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <WaitlistForm size="hero" />
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Check size={12} className="text-green-500" />Free forever plan</span>
                  <span className="flex items-center gap-1"><Check size={12} className="text-green-500" />No credit card</span>
                  <span className="flex items-center gap-1"><Check size={12} className="text-green-500" />Works on mobile</span>
                </div>
              </motion.div>

              {/* Or try demo */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-5"
              >
                <button
                  onClick={handleTryDemo}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  or explore the Tokyo demo
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            </div>

            {/* Right: phone mockup */}
            <div className="flex-shrink-0">
              <MockPhone />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-300 animate-bounce">
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section className="bg-gray-950 text-white py-12">
        <div className="max-w-4xl mx-auto px-5">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { n: 2400, suffix: '+', label: 'Trips created' },
              { n: 94, suffix: '%', label: 'Would recommend' },
              { n: 0, suffix: '$', label: 'Cost to start' },
            ].map(({ n, suffix, label }) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true });
              return (
                <div key={label} ref={ref}>
                  <div className="text-4xl font-black mb-1">
                    {suffix === '$' ? (
                      <span>Free</span>
                    ) : (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                      >
                        {inView ? n : 0}{suffix}
                      </motion.span>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-5">
          <SectionHeading
            eyebrow="How it works"
            title="Three steps to your dream trip"
            subtitle="From blank page to beautiful itinerary in minutes. No signup required."
          />

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '✈️',
                title: 'Pick a destination',
                body: 'Start from scratch or fork a community template. Tokyo, NYC, Bali — we have starter trips for the most popular destinations.',
              },
              {
                step: '02',
                icon: '👥',
                title: 'Invite your crew',
                body: 'Share one link. Everyone can add events, vote on restaurants, and see each other\'s ideas — live, in real-time.',
              },
              {
                step: '03',
                icon: '🎉',
                title: 'Travel & settle up',
                body: 'Track expenses as you go. When you get home, one tap shows exactly who owes what. No spreadsheets. No drama.',
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-4 right-5 text-6xl font-black text-gray-50 leading-none select-none">
                  {step.step}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5">
          <SectionHeading
            eyebrow="Features"
            title="Everything your trip needs"
            subtitle="Built for the way real friend groups actually plan trips."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Zap size={20} />}
              color="#3B82F6"
              title="Real-time collaboration"
              description="Powered by Yjs + WebRTC. Changes sync instantly across all devices with zero servers. Works offline too."
              delay={0}
            />
            <FeatureCard
              icon={<DollarSign size={20} />}
              color="#10B981"
              title="Smart expense splitting"
              description="Track who paid what. Our debt-minimization algorithm calculates the fewest transactions to settle up."
              delay={0.05}
            />
            <FeatureCard
              icon={<Share2 size={20} />}
              color="#8B5CF6"
              title="Shareable travel stories"
              description="One click turns your itinerary into a beautiful travel magazine page. Share with family, post on Instagram."
              delay={0.1}
            />
            <FeatureCard
              icon={<MapPin size={20} />}
              color="#F97316"
              title="7 event types"
              description="Flights, hotels, restaurants, activities, trains, transport, notes. Each with the right details and beautiful cards."
              delay={0.15}
            />
            <FeatureCard
              icon={<Sparkles size={20} />}
              color="#EAB308"
              title="Trip templates"
              description="Fork a community-built starter trip. Fully customizable. Skip the blank-page problem and get planning faster."
              delay={0.2}
            />
            <FeatureCard
              icon={<Shield size={20} />}
              color="#EF4444"
              title="Privacy first"
              description="P2P sync means your trip data never touches our servers. It stays between you and your travel companions."
              delay={0.25}
            />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-5">
          <SectionHeading
            eyebrow="What people say"
            title="Loved by trip planners"
          />
          <div className="grid sm:grid-cols-3 gap-4">
            <Testimonial
              text="We planned our Japan trip with 6 friends. Zero group chat arguments. The expense tracker alone was worth it."
              name="Sarah M."
              role="Group travel organizer"
              color="#3B82F6"
            />
            <Testimonial
              text="Sent the share link to my parents so they could follow along. They kept saying how beautiful it looked."
              name="Priya T."
              role="Solo traveler"
              color="#8B5CF6"
            />
            <Testimonial
              text="Finally deleted that mess of a Google Sheets expense tracker we were using. This just works."
              name="James K."
              role="Budget backpacker"
              color="#10B981"
            />
          </div>
        </div>
      </section>

      {/* ── DISCOVER PREVIEW ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-3 inline-block">
                Discover
              </div>
              <h2 className="text-3xl font-black text-gray-900">Trip inspiration from the community</h2>
              <p className="text-gray-500 mt-2">Real itineraries, shared by real travelers.</p>
            </div>
            <button
              onClick={() => navigate('/discover')}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:opacity-70 transition-opacity"
            >
              Browse all
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Preview cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { emoji: '🇯🇵', name: 'Tokyo Adventure', dest: 'Tokyo, Japan', days: 8, events: 17, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
              { emoji: '🗽', name: 'NYC Weekend', dest: 'New York City', days: 3, events: 8, gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)' },
              { emoji: '🎒', name: 'Euro Backpacking', dest: 'Paris → Berlin', days: 10, events: 14, gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
            ].map((trip, i) => (
              <motion.div
                key={trip.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate('/discover')}
                className="rounded-2xl overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-28 flex items-end px-4 pb-3 relative"
                  style={{ background: trip.gradient }}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="relative z-10 flex items-center gap-2">
                    <span className="text-3xl">{trip.emoji}</span>
                    <div>
                      <div className="text-white font-bold text-base leading-tight">{trip.name}</div>
                      <div className="text-white/70 text-xs">{trip.dest}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-t-0 border-gray-100 px-4 py-2.5 flex items-center gap-3 text-xs text-gray-400">
                  <span>{trip.days} days</span>
                  <span>·</span>
                  <span>{trip.events} events</span>
                  <span className="ml-auto text-blue-500 font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
                    View <ArrowRight size={11} />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/discover')}
              className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-600 font-semibold px-5 py-2.5 rounded-xl hover:border-gray-400 transition-colors"
            >
              Browse all community trips
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #111827 0%, #1e1b4b 100%)' }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        <div className="max-w-2xl mx-auto px-5 text-center relative z-10">
          <div className="text-5xl mb-5">✈️</div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Your next adventure<br />starts here.
          </h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Join the waitlist or start planning right now — no account needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6 max-w-md mx-auto">
            <WaitlistForm size="compact" />
          </div>
          <button
            onClick={() => navigate('/app')}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Skip the waitlist — try it now
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
              <Plane size={12} className="text-white" />
            </div>
            <span className="font-black text-white">Wanderplan</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <button onClick={() => navigate('/discover')} className="hover:text-white transition-colors">Discover</button>
            <button onClick={() => navigate('/app')} className="hover:text-white transition-colors">App</button>
            <span>Built with ❤️ by travelers, for travelers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
