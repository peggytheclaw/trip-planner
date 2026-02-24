# Roteiro Tasks & Feature Requests

## 🚀 Backlog

### Homepage Map Background - Real Trip Paths
**Priority:** Medium  
**Status:** Not Started  
**Requested:** 2026-02-23

**Current State:**
- Landing page has an animated map background with a path
- Path "jumps around a lot" (not smooth/realistic)

**Desired State:**
- Use real trip paths from sample itineraries
- Cycle through multiple iconic trips (e.g., Tokyo, Amalfi Coast, Iceland Ring Road)
- Smooth, natural path following that looks like a real journey
- Each path should trace the actual route for 10-15 seconds before fading to the next

**Implementation Ideas:**
- Extract lat/lng coordinates from sample trips (Tokyo, Amalfi, etc.)
- Create smooth interpolated paths between waypoints
- Use Leaflet polyline animation
- Fade between different trips every 15-20 seconds
- Add subtle labels (e.g., "Tokyo → Kyoto" as the path draws)

**Files to modify:**
- `src/pages/Landing.tsx` - map background component
- Possibly extract to `src/components/AnimatedMapBackground.tsx`

**References:**
- Sample trips in `src/data/sampleTrip.ts` and `src/data/templates.ts`
- EVENT_COORDS in `src/utils/eventCoordinates.ts` (has lat/lng for many events)

---

## ✅ Completed

### Idea Bank
**Completed:** 2026-02-23  
Research → Arrange workflow for trip planning. Users can add unscheduled event ideas and promote them to the itinerary later.

### Participant Tracking
**Completed:** 2026-02-23  
Track which travelers are participating in each event. Shows stacked avatars on event cards.

### Basic Trip Sharing
**Completed:** 2026-02-23  
Anyone with the trip link can view and edit. No real-time sync yet (refresh to see changes).

### Sample Itineraries
**Completed:** 2026-02-23  
Added 5 new rich sample trips: Amalfi Coast, Patagonia, Morocco, Iceland, Thailand.
