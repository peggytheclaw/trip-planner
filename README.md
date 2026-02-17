# ✈️ Wanderplan — Collaborative Trip Planning

> Plan trips together with friends. Real-time peer-to-peer sync, expense splitting, beautiful sharing, and a community discovery feed.

**Built to launch.** Not just a portfolio demo — a real product ready for Product Hunt.

---

## 🌐 Routes

| Route | Description |
|---|---|
| `/` | **Landing page** — marketing, waitlist, social proof |
| `/app` | **Trip list** — your trips + templates |
| `/discover` | **Community feed** — browse & fork shared itineraries |
| `/trip/:id` | **Itinerary** — live timeline editor |
| `/trip/:id/share` | **Public view** — shareable travel magazine page |
| `/trip/:id/expenses` | **Expenses** — splitwise-style tracking |
| `/trip/:id/settings` | **Settings** — travelers, pack list, share link |

---

## ✨ Features

### 🏠 Landing Page
- Animated phone mockup showing the app in action
- Email waitlist capture (localStorage-backed, seeds at 847 for social proof)
- "How it works" 3-step explainer
- Feature grid, testimonials, discover preview
- Final CTA with "skip the waitlist — try it now" escape hatch

### 🗓️ Itinerary Timeline
- Vertical timeline with 7 event types: Flights, Hotels, Restaurants, Activities, Transport, Trains, Notes
- Color-coded cards with left border accents
- Day separators, meal gap nudges (🍽️ yellow banner), hotel overnight indicators (🌙)
- Add events anywhere with inline + buttons
- Full-screen Share modal with public-view vs. collab-link

### 🌍 Discover Feed
- 8 seeded community trips spanning Tokyo, NYC, Europe, Bali, Patagonia, Morocco, Iceland, Thailand
- Search, tag filter (Asia / Europe / Budget / Adventure / etc.), sort by Trending / Most Saved / Newest
- One-tap **fork** — instantly creates a copy in your trip list

### ⚡ Trip Templates
- 4 fully-built starter trips: Tokyo 8d, NYC Weekend 3d, Euro Backpacking 10d, Bali Retreat 7d
- Each template has real events with booking tips, prices, and timing
- "Use template" forks a copy you can customize

### 🤝 Real-Time Collaboration (Yjs + WebRTC)
- Zero-server P2P sync via `y-webrtc`
- Share one link — friends join the same live Yjs document
- Connected users shown as colored avatar dots
- Graceful offline fallback

### 💰 Expense Splitting
- Track expenses with payer + split between travelers
- Debt-minimization algorithm (greedy, minimizes transaction count)
- Settle Up tab, category breakdown, per-person totals

### 🎒 Pack List
- Checklist per trip with quick-add essentials (passport, charger, etc.)
- Progress bar, "clear packed" button
- Lives on the Trip Settings page

### 📖 Public Share View
- Magazine/editorial layout: full-bleed hero, day sections, reading progress bar
- 7 editorial card designs (flights with big IATA codes, etc.)
- Growth-hack footer: "Made with Wanderplan" + "Start Planning Free" CTA

---

## 🚀 Quick Start

```bash
git clone https://github.com/peggytheclaw/trip-planner.git
cd trip-planner
npm install
npm run dev          # → http://localhost:5173
npm run build        # Production build
```

The app loads with a full Tokyo demo trip. Hit `/` for the landing page.

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite + manual chunking | Build tool, optimized bundle |
| Tailwind CSS v4 | Mobile-first styling |
| Zustand + persist | State + localStorage |
| React Router v6 | 8-route navigation |
| Framer Motion | Animations, whileInView |
| date-fns | Date formatting |
| Lucide React | Icons |
| **Yjs + y-webrtc** | **P2P real-time collaboration** |

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── Landing.tsx        ← Marketing page + waitlist
│   ├── TripList.tsx       ← /app — trips + templates tabs
│   ├── Discover.tsx       ← Community feed + search
│   ├── Itinerary.tsx      ← Main timeline editor ⭐
│   ├── ShareView.tsx      ← Public travel magazine view
│   ├── Expenses.tsx       ← Splitwise-style tracker
│   ├── TripSettings.tsx   ← Travelers, pack list, share
│   └── EventDetail.tsx    ← Single event deep-dive
├── components/
│   ├── EventCard.tsx      ← 7 event card types
│   ├── AddEventSheet.tsx  ← Bottom sheet event form
│   ├── PackList.tsx       ← Trip checklist
│   ├── CollabAvatars.tsx  ← Live presence indicator
│   ├── DayDivider.tsx     ← Timeline day separators
│   ├── BetweenIndicator.tsx ← Meal nudges
│   └── ExpenseItem.tsx    ← Expense row
├── data/
│   ├── sampleTrip.ts      ← Tokyo demo (17 events, 8 expenses)
│   └── templates.ts       ← NYC, Euro, Bali templates
├── store/
│   ├── tripStore.ts       ← Trips + events
│   ├── expenseStore.ts    ← Expenses + settlements
│   ├── collaborationStore.ts
│   └── waitlistStore.ts   ← Email waitlist
├── utils/
│   ├── itineraryUtils.ts  ← Grouping, meal gaps, colors
│   ├── expenseCalculator.ts ← Debt minimization
│   └── collaboration.ts   ← Yjs setup
└── types/index.ts         ← All TypeScript types
```

---

## 🔮 What's next (post-launch)

- [ ] Deploy to Vercel/Netlify with a real domain
- [ ] Supabase backend for persistent trips (upgrade from localStorage)
- [ ] Real-time signaling server for better WebRTC reliability
- [ ] Google Calendar export
- [ ] PDF export of itinerary
- [ ] AI trip suggestions ("fill in my Tokyo week")
- [ ] Mobile app (Capacitor or React Native)

---

## 📄 License

MIT
