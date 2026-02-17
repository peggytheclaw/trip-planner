import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import TripList from './pages/TripList';
import Itinerary from './pages/Itinerary';
import Expenses from './pages/Expenses';
import TripSettings from './pages/TripSettings';
import EventDetail from './pages/EventDetail';
import ShareView from './pages/ShareView';
import Discover from './pages/Discover';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing */}
        <Route path="/" element={<Landing />} />
        <Route path="/discover" element={<Discover />} />

        {/* App */}
        <Route path="/app" element={<TripList />} />
        <Route path="/trip/:tripId" element={<Itinerary />} />
        <Route path="/trip/:tripId/share" element={<ShareView />} />
        <Route path="/trip/:tripId/event/:eventId" element={<EventDetail />} />
        <Route path="/trip/:tripId/expenses" element={<Expenses />} />
        <Route path="/trip/:tripId/settings" element={<TripSettings />} />

        {/* Legacy redirect */}
        <Route path="/trips" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
