import { LayoutDashboard, Users, Cloud, IndianRupee, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const NAV = [
  {
    section: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    ],
  },
  {
    section: 'Data',
    items: [
      { id: 'users',   label: 'Users',   icon: Users,        path: '/admin/users' },
      { id: 'weather', label: 'Weather', icon: Cloud,        path: '/admin/weather' },
      { id: 'payouts', label: 'Payouts', icon: IndianRupee,  path: '/admin/payouts' },
    ],
  },
  {
    section: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings, path: null },
    ],
  },
];

export default function AdminSidebar({ activePage, onNavigate }) {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const handleNav = (item) => {
    if (item.path) {
      onNavigate(item.id);
      navigate(item.path);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <span className="admin-logo-text">Coveer</span>
        <span className="admin-logo-badge">Admin</span>
      </div>

      <nav style={{ flex: 1, paddingTop: '0.5rem' }}>
        {NAV.map(({ section, items }) => (
          <div key={section} className="admin-nav-section">
            <div className="admin-nav-section-label">{section}</div>
            {items.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`admin-nav-item${activePage === item.id ? ' active' : ''}`}
                  onClick={() => handleNav(item)}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-bottom">
        <button className="admin-nav-item" onClick={handleLogout}>
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}
