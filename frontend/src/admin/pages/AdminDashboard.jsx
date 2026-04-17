import { useEffect, useState } from 'react';
import { Users, TrendingUp, IndianRupee, Cloud } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import adminApi from '../api/adminApi';
import StatCard from '../components/StatCard';
import SkeletonRow from '../components/SkeletonRow';

const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const fmtTime = d => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="recharts-custom-tooltip">
      <div className="label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [overview, setOverview]       = useState(null);
  const [userGrowth, setUserGrowth]   = useState([]);
  const [payoutTrend, setPayoutTrend] = useState([]);
  const [weatherTrend, setWeatherTrend] = useState([]);
  const [todayPayouts, setTodayPayouts] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.get('/stats/overview'),
      adminApi.get('/stats/user-growth'),
      adminApi.get('/stats/payout-trend'),
      adminApi.get('/stats/weather-trend'),
      adminApi.get('/payouts/today'),
    ])
      .then(([ov, ug, pt, wt, tp]) => {
        setOverview(ov.data);
        setUserGrowth(ug.data.map(d => ({ date: fmtDate(d.date), count: d.count })));
        setPayoutTrend(pt.data.map(d => ({ date: fmtDate(d.date), amount: d.amount })));
        setWeatherTrend(wt.data.map(d => ({ hour: `${d.hour}h`, impact: d.avgImpact })));
        setTodayPayouts(tp.data.list.slice(0, 10));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="admin-grid-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="admin-stat-card">
              <div className="admin-skeleton" style={{ width: 36, height: 36, marginBottom: '1rem' }} />
              <div className="admin-skeleton" style={{ width: '60%', height: 28, marginBottom: '0.5rem' }} />
              <div className="admin-skeleton" style={{ width: '40%', height: 14 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="admin-grid-4">
        <StatCard icon={Users} value={overview?.users?.total} label="Total Users" accent />
        <StatCard icon={TrendingUp} value={overview?.users?.active} label="Active Plans" />
        <StatCard icon={IndianRupee} value={fmt(overview?.payouts?.today || 0)} label="Payouts Today" />
        <StatCard icon={Cloud} value={overview?.weather?.citiesAffected} label="Cities Affected" />
      </div>

      {/* Charts */}
      <div className="admin-grid-2">
        <div className="admin-panel">
          <div className="admin-panel-title">User Growth (30 days)</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7b79c4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7b79c4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" style={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" style={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#7b79c4" fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-title">Payout Trend (30 days)</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={payoutTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" style={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" style={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#7b79c4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weather Impact */}
      <div className="admin-panel">
        <div className="admin-panel-title">Weather Impact (24 hours)</div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={weatherTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" style={{ fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" style={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="impact" stroke="#7b79c4" strokeWidth={2} dot={{ fill: '#7b79c4', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Today's Payouts */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title">Today's Payouts</div>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
            {todayPayouts.length} transactions
          </span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Platform</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {todayPayouts.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '2rem' }}>
                  No payouts today
                </td></tr>
              ) : (
                todayPayouts.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.city}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.platform}</td>
                    <td><span className={`admin-badge admin-badge--${p.plan === 'premium' ? 'purple' : 'gray'}`}>{p.plan}</span></td>
                    <td style={{ fontWeight: 600, color: 'rgba(80,200,120,0.9)' }}>{fmt(p.amount)}</td>
                    <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{p.reason || '—'}</td>
                    <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{fmtTime(p.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
