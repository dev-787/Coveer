import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { WhySection } from './components/WhySection'
import { Pricing } from './components/Pricing'
import { Navbar } from './components/Navbar'
import Login     from './pages/Login'
import Start     from './pages/Start'
import Verify    from './pages/Verify'
import Dashboard from './pages/Dashboard'

const NAV_HIDDEN = ['/auth', '/auth/start', '/dashboard', '/verify'];

function Layout() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const hideNav = NAV_HIDDEN.includes(location.pathname);

  if (loading) return (
    <div className="db-loading-screen">
      <div className="db-loading-spinner" />
    </div>
  );

  return (
    <>
      {!hideNav && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<><Hero /><HowItWorks /><WhySection /><Pricing /></>} />
        <Route path="/auth"       element={!user ? <Login />  : <Navigate to="/dashboard" replace />} />
        <Route path="/auth/start" element={!user ? <Start />  : <Navigate to="/dashboard" replace />} />
        <Route path="/verify"     element={<Verify />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return <Layout />;
}
