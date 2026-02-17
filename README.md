# ✈️ Wanderplan — Collaborative Trip Planning

> Plan trips together with friends. Real-time peer-to-peer sync, expense splitting, and beautiful itineraries.

![Wanderplan Screenshot](https://via.placeholder.com/800x400/667eea/ffffff?text=Wanderplan+%E2%9C%88%EF%B8%8F)

---

## ✨ Features

### 🗓️ Beautiful Itinerary Timeline
- Vertical timeline view with cards for every event type
- **7 event types:** Flights, Hotels, Restaurants, Activities, Transport, Trains, Notes
- Each type has a distinct color-coded card with a left border accent
- Day separator headers with smart contextual indicators:
  - 🍽️ Meal gap nudges (yellow banner when no lunch/dinner planned)
  - 🌙 Overnight hotel stay indicators between days
  - Travel time connectors between events
- Add events anywhere in the timeline with the `+` button
- Edit or delete any event inline

### 🤝 Real-Time Collaboration (Yjs + WebRTC)
- **Zero-server P2P sync** — peers connect directly via WebRTC signaling
- Share a link and friends join the same live Yjs document instantly
- Connected users shown as colored avatar dots (Notion/Figma-style)
- Each trip's ID is its Yjs room ID — no backend required
- Graceful offline fallback if WebRTC is unavailable

### 💰 Expense Splitting (Splitwise-style)
- Add expenses with payer, split between travelers, and category
- **Settle Up tab** uses a debt-minimization algorithm to find the fewest transactions
- **Summary tab** shows category breakdown with animated progress bars
- Per-person balance tracking (paid vs. fair share)
- Mark settlements as paid with one tap

### 📱 Mobile-First Design
- Designed for phones, works beautifully on desktop
- Bottom sheet modals for adding/editing (native mobile feel)
- Safe area insets for notched devices
- Touch-optimized tap targets throughout

### 🗺️ Sample Demo Trip
Pre-loaded with a full **Tokyo Adventure 🇯🇵** trip (8 days, 17+ events, 4 travelers, 8 expenses):
- Outbound + return United Airlines flights (SFO ↔ NRT)
- 5 nights at Park Hyatt Tokyo (check-in + checkout events)
- Narita Express train, Tokyo Metro subway
- Restaurants: Ichiran Ramen, Tsukiji Market, Sukiyabashi Jiro, Gonpachi
- Activities: Senso-ji, teamLab Planets, Shibuya Crossing, Tokyo Skytree, Akihabara
- Notes with tips and packing reminders
- ~$9,500 total expenses tracked and split between Alex, Jordan, Sam & Taylor

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/peggytheclaw/trip-planner.git
cd trip-planner

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

The app opens at `http://localhost:5173` — the Tokyo demo trip is pre-loaded.

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS v4 | Styling (mobile-first) |
| Zustand | State management |
| React Router v6 | Navigation |
| Framer Motion | Card animations |
| date-fns | Date formatting |
| Lucide React | Icons |
| **Yjs + y-webrtc** | **Real-time P2P collaboration** |
| localStorage | Persistence |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── EventCard.tsx         # Renders all 7 event card types
│   ├── DayDivider.tsx        # Day separator with hotel stay indicator
│   ├── BetweenIndicator.tsx  # Meal nudges, travel times, add button
│   ├── AddEventSheet.tsx     # Bottom sheet form (type-aware fields)
│   ├── CollabAvatars.tsx     # Connected peers display
│   └── ExpenseItem.tsx       # Single expense row
├── pages/
│   ├── TripList.tsx          # Home — trip card list
│   ├── Itinerary.tsx         # Main timeline view ⭐
│   ├── Expenses.tsx          # Expenses, settle up, summary
│   └── TripSettings.tsx      # Travelers, trip details, share link
├── store/
│   ├── tripStore.ts          # Zustand store — trips + events
│   ├── expenseStore.ts       # Zustand store — expenses + settlements
│   └── collaborationStore.ts # Collab connection state
├── data/
│   └── sampleTrip.ts         # Tokyo demo trip + expenses
├── utils/
│   ├── itineraryUtils.ts     # Day grouping, meal gap detection, colors
│   ├── expenseCalculator.ts  # Debt minimization algorithm
│   └── collaboration.ts      # Yjs + y-webrtc setup
└── types/
    └── index.ts              # All TypeScript types
```

---

## 🤝 Collaboration — How It Works

Wanderplan uses **Yjs** (a CRDT library) with **y-webrtc** for peer-to-peer real-time sync:

1. **Each trip has a UUID** that doubles as the Yjs room ID
2. When you click "Share" and someone opens your link, they connect to the same Yjs document
3. **WebRTC signaling** via `wss://signaling.yjs.dev` brokers the initial handshake
4. After connecting, all data flows **directly peer-to-peer** — no server stores your trip data
5. **CRDTs** ensure conflict-free merging when multiple people edit simultaneously
6. If WebRTC is unavailable (firewall, etc.), the app degrades gracefully to offline mode

```
Alice's Browser ←──── WebRTC P2P ────→ Bob's Browser
        ↕                                      ↕
   Yjs Doc                                Yjs Doc
  (CRDT)                                  (CRDT)
        ↕                                      ↕
 localStorage                          localStorage
```

---

## 💡 Expense Settle-Up Algorithm

The debt minimization uses a **greedy algorithm** to minimize the number of transactions:

1. Calculate each person's net balance (total paid − fair share)
2. Split into creditors (net positive) and debtors (net negative)
3. Greedily match largest creditor with largest debtor
4. One transaction eliminates at least one person's debt
5. Repeat until all balanced

For 4 people, this reduces up to 6 potential transactions to as few as 3.

---

## 🎨 Design System

| Event Type | Color | Border |
|---|---|---|
| ✈️ Flight | `#3B82F6` | Blue |
| 🏨 Hotel | `#8B5CF6` | Purple |
| 🍽️ Restaurant | `#F97316` | Orange |
| 🎯 Activity | `#10B981` | Green |
| 🚗/🚂 Transport | `#EAB308` | Yellow |
| 📝 Note | `#6B7280` | Gray |

---

## 📄 License

MIT — built as a portfolio project.
