import { useEffect, useState } from 'react';
import { IndianRupee } from 'lucide-react';
import adminApi from '../api/adminApi';
import StatCard from '../components/StatCard';
import SkeletonRow from '../components/SkeletonRow';
import EmptyState from '../components/EmptyState';

const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = d => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

function statusBadge(s) {
  const map = { success: 'green', pending: 'amber', failed: 'red' };
  return <span className={`admin-badge admin-badge--${map[s] || 'gray'}`}>{s}</span>;
}

export default function AdminPayouts() {
  const [stats, setStats]         = useState(null);
  const [today, setToday]         = useState(null);
  const [payouts, setPayouts]     = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [page, setPage]           = useState(1);
  const [cityFilter, setCityFilter] = useState('');
  const [fromDate, setFromDate]   = useState('');
  const [toDate, setToDate]       = useState('');
  const LIMIT = 20;

  useEffect(() => {
    Promise.all([
      adminApi.get('/payouts/stats'),
      adminApi.get('/payouts/today'),
    ])
      .then(([s, t]) => { setStats(s.data); setToday(t.data); })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchPayouts(1);
  }, []);

  const fetchPayouts = (p = 1, city = cityFilter, from = fromDate, to = toDate) => {
    setListLoading(true);
    const params = { page: p, limit: LIMIT };
    if (city) params.city = city;
    if (from) params.from = from;
    if (to)   params.to   = to;

    adminApi.get('/payouts', { params })
      .then(r => { setPayouts(r.data.payouts); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setListLoading(false));
  };

  const applyFilters = () => {
    setPage(1);
    fetchPayouts(1, cityFilter, fromDate, toDate);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      {/* Stats */}
      <div className="admin-grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard icon={IndianRupee} value={loading ? '…' : fmt(stats?.allTime?.amount || 0)} label="All Time Payouts" accent />
        <StatCard icon={IndianRupee} value={loading ? '…' : fmt(stats?.thisMonth?.amount || 0)} label="This Month" />
        <StatCard icon={IndianRupee} value={loading ? '…' : fmt(stats?.thisWeek?.amount || 0)} label="This Week" />
        <StatCard icon={IndianRupee} value={loading ? '…' : fmt(today?.totalAmount || 0)} label="Today" />
      </div>

      {/* Today's Payouts */}
      {today && today.list?.length > 0 && (
        <div className="admin-panel" style={{ marginBottom: '1.5rem' }}>
          <div className="admin-panel-header">
            <div className="admin-panel-title">Today's Payouts</div>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
              {today.count} transactions · {fmt(today.totalAmount)}
            </span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>City</th><th>Platform</th><th>Plan</th><th>Amount</th><th>Status</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                {today.list.slice(0, 5).map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.city}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.platform}</td>
                    <td><span className={`admin-badge admin-badge--${p.plan === 'premium' ? 'purple' : 'gray'}`}>{p.plan}</span></td>
                    <td style={{ fontWeight: 600, color: 'rgba(80,200,120,0.9)' }}>{fmt(p.amount)}</td>
                    <td>{statusBadge(p.status)}</td>
                    <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{fmtTime(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Payouts */}
      <div className="admin-panel" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="admin-panel-title" style={{ marginBottom: '1rem' }}>All Payouts</div>
          <div className="admin-filters" style={{ marginBottom: 0 }}>
            <input
              type="text"
              className="admin-input"
              placeholder="Filter by city…"
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
            />
            <input
              type="date"
              className="admin-input"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
            <input
              type="date"
              className="admin-input"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
            <button className="admin-btn admin-btn--primary" onClick={applyFilters}>Apply</button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>City</th><th>Platform</th><th>Plan</th>
                <th>Amount</th><th>Status</th><th>Reason</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} cols={9} />)
              ) : payouts.length === 0 ? (
                <tr><td colSpan={9}><EmptyState icon={IndianRupee} title="No payouts found" message="Try adjusting your filters" /></td></tr>
              ) : (
                payouts.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{p.email}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.city}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.platform}</td>
                    <td><span className={`admin-badge admin-badge--${p.plan === 'premium' ? 'purple' : 'gray'}`}>{p.plan}</span></td>
                    <td style={{ fontWeight: 600, color: 'rgba(80,200,120,0.9)' }}>{fmt(p.amount)}</td>
                    <td>{statusBadge(p.status)}</td>
                    <td style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{p.reason || '—'}</td>
                    <td style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                      {fmtDate(p.createdAt)}
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
          <span className="admin-pagination-info">{total} payouts total</span>
          <button className="admin-btn admin-btn--ghost" disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchPayouts(page - 1); }}>
            Prev
          </button>
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{page} / {totalPages}</span>
          <button className="admin-btn admin-btn--ghost" disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); fetchPayouts(page + 1); }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
