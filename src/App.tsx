import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Landing from './pages/Landing';
import TripList from './pages/TripList';
import Itinerary from './pages/Itinerary';
import Expenses from './pages/Expenses';
import TripSettings from './pages/TripSettings';
import EventDetail from './pages/EventDetail';
import ShareView from './pages/ShareView';
import Discover from './pages/Discover';
import ToastContainer from './components/Toast';

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0a0a0a' }}>
      <div className="text-6xl">🗺️</div>
      <h1 className="text-2xl font-black text-white">Page not found</h1>
      <p className="text-sm" style={{ color: '#6b7280' }}>The destination you're looking for doesn't exist.</p>
      <button onClick={() => navigate('/')}
        className="mt-2 px-6 py-3 rounded-xl font-semibold text-white"
        style={{ backgroundColor: '#10b981' }}>
        ← Back to Wanderplan
      </button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
