import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function AdminTopbar({ title, onMenuToggle }) {
  const { admin } = useAdminAuth();
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh  = String(now.getHours()).padStart(2, '0');
      const mm  = String(now.getMinutes()).padStart(2, '0');
      const ss  = String(now.getSeconds()).padStart(2, '0');
      setClock(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="admin-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}
          >
            <Menu size={18} />
          </button>
        )}
        <span className="admin-topbar-title">{title}</span>
      </div>

      <div className="admin-topbar-right">
        <span className="admin-clock">{clock}</span>
        <div className="admin-avatar">{initials(admin?.name)}</div>
        <span className="admin-admin-name">{admin?.name}</span>
      </div>
    </header>
  );
}
