import { useEffect, useRef, useState } from 'react';
import { Search, Pencil, Trash2, Users } from 'lucide-react';
import adminApi from '../api/adminApi';
import SkeletonRow from '../components/SkeletonRow';
import EmptyState from '../components/EmptyState';
import UserEditModal from '../components/UserEditModal';

const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function initials(u) {
  return `${u.fullName?.firstName?.[0] || ''}${u.fullName?.lastName?.[0] || ''}`.toUpperCase();
}

function planBadge(plan) {
  return <span className={`admin-badge admin-badge--${plan === 'premium' ? 'purple' : 'gray'}`}>{plan}</span>;
}

function statusBadge(status) {
  const map = { active: 'green', inactive: 'gray', expired: 'red' };
  return <span className={`admin-badge admin-badge--${map[status] || 'gray'}`}>{status}</span>;
}

function verifyBadge(status) {
  const map = { verified: 'green', pending: 'amber', under_review: 'amber', rejected: 'red' };
  return <span className={`admin-badge admin-badge--${map[status] || 'gray'}`}>{status?.replace('_', ' ')}</span>;
}

export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [filters, setFilters]   = useState({ plan: '', planStatus: '', city: '', verificationStatus: '' });
  const [editId, setEditId]     = useState(null);
  const debounceRef             = useRef(null);
  const LIMIT = 20;

  const fetchUsers = (p = page, s = search, f = filters) => {
    setLoading(true);
    const params = { page: p, limit: LIMIT, search: s, ...f };
    adminApi.get('/users', { params })
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, val, filters);
    }, 300);
  };

  const handleFilter = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    setPage(1);
    fetchUsers(1, search, next);
  };

  const handleDelete = async (id) => {
    if (!confirm('Soft-delete this user?')) return;
    await adminApi.delete(`/users/${id}`).catch(console.error);
    fetchUsers();
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      {/* Filters */}
      <div className="admin-filters">
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            className="admin-input"
            style={{ paddingLeft: '2rem', width: '100%' }}
            placeholder="Search name or email…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        {[
          { key: 'plan', opts: ['', 'basic', 'premium'], label: 'Plan' },
          { key: 'planStatus', opts: ['', 'active', 'inactive', 'expired'], label: 'Status' },
          { key: 'verificationStatus', opts: ['', 'pending', 'under_review', 'verified', 'rejected'], label: 'Verification' },
        ].map(({ key, opts, label }) => (
          <select
            key={key}
            className="admin-select"
            value={filters[key]}
            onChange={e => handleFilter(key, e.target.value)}
          >
            <option value="">{label}</option>
            {opts.filter(Boolean).map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="admin-panel" style={{ padding: 0 }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>City</th>
                <th>Platform</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Balance</th>
                <th>Trust</th>
                <th>Verification</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} cols={10} />)
              ) : users.length === 0 ? (
                <tr><td colSpan={10}><EmptyState icon={Users} title="No users found" message="Try adjusting your filters" /></td></tr>
              ) : (
                users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">{initials(u)}</div>
                        <div>
                          <div className="admin-user-name">{u.fullName?.firstName} {u.fullName?.lastName}</div>
                          <div className="admin-user-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{u.city}</td>
                    <td style={{ textTransform: 'capitalize' }}>{u.platform}</td>
                    <td>{planBadge(u.plan)}</td>
                    <td>{statusBadge(u.planStatus)}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(u.wallet?.balance || 0)}</td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: u.trustScore >= 70 ? 'rgba(80,200,120,0.9)' : u.trustScore >= 40 ? 'rgba(220,160,40,0.9)' : 'rgba(220,70,70,0.9)' }}>
                        {u.trustScore}
                      </span>
                    </td>
                    <td>{verifyBadge(u.verificationStatus)}</td>
                    <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{fmtDate(u.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="admin-btn admin-btn--ghost" style={{ padding: '0.35rem 0.6rem' }} onClick={() => setEditId(u._id)}>
                          <Pencil size={13} />
                        </button>
                        <button className="admin-btn admin-btn--danger" style={{ padding: '0.35rem 0.6rem' }} onClick={() => handleDelete(u._id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <span className="admin-pagination-info">{total} users total</span>
          <button className="admin-btn admin-btn--ghost" disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchUsers(page - 1); }}>
            Prev
          </button>
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{page} / {totalPages}</span>
          <button className="admin-btn admin-btn--ghost" disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); fetchUsers(page + 1); }}>
            Next
          </button>
        </div>
      )}

      {editId && (
        <UserEditModal
          userId={editId}
          onClose={() => setEditId(null)}
          onSaved={() => { setEditId(null); fetchUsers(); }}
        />
      )}
    </div>
  );
}
