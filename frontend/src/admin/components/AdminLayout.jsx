import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AdminWeather from '../pages/AdminWeather';
import AdminPayouts from '../pages/AdminPayouts';
import '../styles/admin.css';

const TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users':     'Users',
  '/admin/weather':   'Weather',
  '/admin/payouts':   'Payouts',
};

export default function AdminLayout() {
  const location = useLocation();
  const [activePage, setActivePage] = useState('dashboard');

  const title = TITLES[location.pathname] || 'Admin';

  return (
    <div className="admin-root">
      <AdminSidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="admin-main">
        <AdminTopbar title={title} />
        <main className="admin-content">
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users"     element={<AdminUsers />} />
            <Route path="weather"   element={<AdminWeather />} />
            <Route path="payouts"   element={<AdminPayouts />} />
            <Route path="*"         element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
