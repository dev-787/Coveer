import { useState } from 'react';
import './Dashboard.css';
import {
  LayoutDashboard, Wallet, Shield, User, Settings,
  TrendingUp, CloudRain, Wind, Thermometer, ChevronRight,
  ArrowUpRight, ArrowDownLeft, Bell, LogOut, Menu, X,
  CheckCircle2, Clock, AlertTriangle, IndianRupee,
  Calendar, MapPin, Zap, BarChart2, RefreshCw
} from 'lucide-react';

// ── Mock Data ─────────────────────────────────────────────────────────────────
const USER = {
  name: 'Rahul Sharma',
  firstName: 'Rahul',
  platform: 'Swiggy',
  city: 'Mumbai',
  plan: 'premium',
  dailyEarnings: 1200,
  trustScore: 94,
  isVerified: true,
  walletBalance: 2340,
  memberSince: 'Jan 2024',
};

const RECENT_TRANSACTIONS = [
  { id: 1, type: 'payout',    amount: 600,  label: 'Heavy Rain Payout',    date: 'Today',      icon: CloudRain,    status: 'credited' },
  { id: 2, type: 'premium',   amount: -40,  label: 'Premium Plan · Week 14', date: 'Yesterday',  icon: Shield,       status: 'debited'  },
  { id: 3, type: 'payout',    amount: 225,  label: 'AQI High Payout',       date: 'Mon',        icon: Wind,         status: 'credited' },
  { id: 4, type: 'payout',    amount: 450,  label: 'Storm Payout',          date: 'Sat',        icon: CloudRain,    status: 'credited' },
  { id: 5, type: 'withdrawal', amount: -800, label: 'UPI Withdrawal',        date: 'Fri',        icon: ArrowUpRight, status: 'debited'  },
  { id: 6, type: 'payout',    amount: 300,  label: 'Heatwave Payout',       date: 'Thu',        icon: Thermometer,  status: 'credited' },
];

const WEEK_DATA = [
  { day: 'Mon', hours: 0,   payout: 0   },
  { day: 'Tue', hours: 2.5, payout: 375 },
  { day: 'Wed', hours: 1.8, payout: 270 },
  { day: 'Thu', hours: 0,   payout: 0   },
  { day: 'Fri', hours: 3.2, payout: 480 },
  { day: 'Sat', hours: 4,   payout: 600 },
  { day: 'Sun', hours: 1.5, payout: 225 },
];

const ALL_TRANSACTIONS = [
  ...RECENT_TRANSACTIONS,
  { id: 7,  type: 'payout',    amount: 180,  label: 'Light Rain Payout',    date: 'Mar 22', icon: CloudRain,    status: 'credited' },
  { id: 8,  type: 'premium',   amount: -40,  label: 'Premium Plan · Week 13', date: 'Mar 21', icon: Shield,       status: 'debited'  },
  { id: 9,  type: 'payout',    amount: 420,  label: 'Heavy Rain Payout',    date: 'Mar 19', icon: CloudRain,    status: 'credited' },
  { id: 10, type: 'withdrawal', amount: -500, label: 'UPI Withdrawal',        date: 'Mar 18', icon: ArrowUpRight, status: 'debited'  },
];

const COVERAGE_TRIGGERS = [
  { label: 'Rainfall > 2.5mm/hr',   impact: '30%', type: 'Light Rain'      },
  { label: 'Rainfall > 7.5mm/hr',   impact: '60%', type: 'Heavy Rain'      },
  { label: 'Rainfall > 15mm/hr',    impact: '100%', type: 'Extreme Rain'   },
  { label: 'AQI 201–300',           impact: '30%', type: 'Unhealthy Air'   },
  { label: 'AQI > 300',             impact: '60%', type: 'Hazardous Air'   },
  { label: 'Temperature > 42°C',    impact: '50%', type: 'Heatwave'        },
  { label: 'Local Curfew',          impact: '100%', type: 'Disruption'     },
];

// ── Sidebar Nav Items ─────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wallet',    label: 'Wallet',    icon: Wallet           },
  { id: 'coverage',  label: 'My Coverage', icon: Shield         },
  { id: 'profile',   label: 'Profile',   icon: User             },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.abs(n));
const maxPayout = USER.plan === 'premium' ? 1000 : 600;
const hourlyIncome = Math.round(USER.dailyEarnings / 8);

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function PageDashboard() {
  const todayAffected = 3.2;
  const todayPayout = Math.min(Math.round(todayAffected * hourlyIncome), maxPayout);
  const weekTotal = WEEK_DATA.reduce((s, d) => s + d.payout, 0);
  const maxBar = Math.max(...WEEK_DATA.map(d => d.payout), 1);

  return (
    <div className="db-page">

      {/* Top greeting */}
      <div className="db-greeting">
        <div>
          <p className="db-greeting-sub">Good evening,</p>
          <h1 className="db-greeting-name">{USER.firstName} 👋</h1>
        </div>
        <div className="db-status-pill db-status-affected">
          <span className="db-status-dot" />
          Affected — Mumbai
        </div>
      </div>

      {/* Stat cards row */}
      <div className="db-cards-row">
        <div className="db-card db-card--accent">
          <div className="db-card-label">Today's Estimated Payout</div>
          <div className="db-card-value">₹{fmt(todayPayout)}</div>
          <div className="db-card-sub">
            <CloudRain size={13} /> {todayAffected} hrs affected · credits at 10 PM
          </div>
          <div className="db-card-glow" />
        </div>

        <div className="db-card">
          <div className="db-card-label">Wallet Balance</div>
          <div className="db-card-value">₹{fmt(USER.walletBalance)}</div>
          <div className="db-card-sub">
            <ArrowUpRight size={13} /> Available to withdraw
          </div>
        </div>

        <div className="db-card">
          <div className="db-card-label">This Week's Payouts</div>
          <div className="db-card-value">₹{fmt(weekTotal)}</div>
          <div className="db-card-sub">
            <TrendingUp size={13} /> Across 5 disruption events
          </div>
        </div>
      </div>

      {/* Weekly bar chart + recent transactions */}
      <div className="db-two-col">

        {/* Bar chart */}
        <div className="db-panel db-panel--chart">
          <div className="db-panel-header">
            <span className="db-panel-title">Weekly Impact</span>
            <span className="db-panel-sub">This week</span>
          </div>
          <div className="db-bar-chart">
            {WEEK_DATA.map((d, i) => (
              <div key={i} className="db-bar-col">
                {d.payout > 0 && (
                  <span className="db-bar-amount">₹{d.payout}</span>
                )}
                <div className="db-bar-track">
                  <div
                    className={`db-bar-fill ${d.payout > 0 ? 'db-bar-fill--active' : ''}`}
                    style={{ height: `${(d.payout / maxBar) * 100}%` }}
                  />
                </div>
                <span className="db-bar-label">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="db-panel db-panel--activity">
          <div className="db-panel-header">
            <span className="db-panel-title">Recent Activity</span>
          </div>
          <div className="db-txn-list">
            {RECENT_TRANSACTIONS.map(txn => (
              <div key={txn.id} className="db-txn-row">
                <div className={`db-txn-icon ${txn.type === 'payout' ? 'db-txn-icon--green' : 'db-txn-icon--dim'}`}>
                  <txn.icon size={14} />
                </div>
                <div className="db-txn-info">
                  <span className="db-txn-label">{txn.label}</span>
                  <span className="db-txn-date">{txn.date}</span>
                </div>
                <span className={`db-txn-amount ${txn.amount > 0 ? 'db-txn-amount--pos' : 'db-txn-amount--neg'}`}>
                  {txn.amount > 0 ? '+' : ''}₹{fmt(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live disruption + trust score */}
      <div className="db-two-col">
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">Live Conditions · Mumbai</span>
            <span className="db-panel-badge">Updated 5 min ago</span>
          </div>
          <div className="db-conditions">
            {[
              { icon: CloudRain,   label: 'Rainfall',    value: '8.2 mm/hr', status: 'affected',  impact: '60%' },
              { icon: Wind,        label: 'AQI',         value: '142',       status: 'normal',    impact: '0%'  },
              { icon: Thermometer, label: 'Temperature', value: '31°C',      status: 'normal',    impact: '0%'  },
            ].map((c, i) => (
              <div key={i} className="db-condition-row">
                <div className="db-condition-icon"><c.icon size={15} /></div>
                <span className="db-condition-label">{c.label}</span>
                <span className="db-condition-value">{c.value}</span>
                <span className={`db-condition-badge ${c.status === 'affected' ? 'db-badge--red' : 'db-badge--green'}`}>
                  {c.status === 'affected' ? `Affected · ${c.impact}` : 'Normal'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">Your Trust Score</span>
          </div>
          <div className="db-trust">
            <div className="db-trust-ring">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <circle cx="40" cy="40" r="32" fill="none"
                  stroke="url(#trustGrad)" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32 * USER.trustScore / 100} ${2 * Math.PI * 32}`}
                  strokeDashoffset={2 * Math.PI * 32 * 0.25}
                />
                <defs>
                  <linearGradient id="trustGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#5a57b0" />
                    <stop offset="100%" stopColor="#a8aacc" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="db-trust-score">{USER.trustScore}</span>
            </div>
            <div className="db-trust-info">
              <span className="db-trust-label">High Trust</span>
              <span className="db-trust-sub">Instant payouts enabled</span>
              <div className="db-trust-perks">
                <span><CheckCircle2 size={11} /> Instant payout</span>
                <span><CheckCircle2 size={11} /> No verification delays</span>
                <span><CheckCircle2 size={11} /> Priority support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: WALLET
// ─────────────────────────────────────────────────────────────────────────────
function PageWallet() {
  const [withdrawMode, setWithdrawMode] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [success, setSuccess] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleWithdraw = () => {
    if (!withdrawAmount || Number(withdrawAmount) < 1) return;
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setWithdrawMode(false); setWithdrawAmount(''); }, 3000);
  };

  const filtered = filter === 'all' ? ALL_TRANSACTIONS
    : ALL_TRANSACTIONS.filter(t => t.type === filter);

  return (
    <div className="db-page">

      {/* Balance hero */}
      <div className="db-wallet-hero">
        <div className="db-wallet-hero-left">
          <p className="db-wallet-hero-label">Total Balance</p>
          <h2 className="db-wallet-hero-amount">₹{fmt(USER.walletBalance)}</h2>
          <p className="db-wallet-hero-sub">Available for withdrawal</p>
        </div>
        <div className="db-wallet-actions">
          <button className="db-btn-primary" onClick={() => setWithdrawMode(true)}>
            <ArrowUpRight size={15} /> Withdraw
          </button>
          <div className="db-wallet-mini-stats">
            <div className="db-mini-stat">
              <span className="db-mini-stat-label">This Month</span>
              <span className="db-mini-stat-value db-pos">+₹2,730</span>
            </div>
            <div className="db-mini-stat">
              <span className="db-mini-stat-label">Premiums</span>
              <span className="db-mini-stat-value db-neg">-₹160</span>
            </div>
          </div>
        </div>
        <div className="db-wallet-glow" />
      </div>

      {/* Withdraw modal */}
      {withdrawMode && (
        <div className="db-modal-overlay" onClick={() => setWithdrawMode(false)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            {success ? (
              <div className="db-modal-success">
                <CheckCircle2 size={40} color="#7b79c4" />
                <h3>Withdrawal Initiated</h3>
                <p>₹{withdrawAmount} will reach your account in minutes.</p>
              </div>
            ) : (
              <>
                <div className="db-modal-header">
                  <h3>Withdraw Funds</h3>
                  <button onClick={() => setWithdrawMode(false)}><X size={18} /></button>
                </div>
                <p className="db-modal-balance">Available: ₹{fmt(USER.walletBalance)}</p>
                <div className="db-modal-field">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="Enter amount..."
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    max={USER.walletBalance}
                    className="db-input"
                  />
                </div>
                <div className="db-modal-field">
                  <label>Withdrawal Method</label>
                  <div className="db-method-tabs">
                    {['upi', 'bank'].map(m => (
                      <button
                        key={m}
                        className={`db-method-tab ${withdrawMethod === m ? 'active' : ''}`}
                        onClick={() => setWithdrawMethod(m)}
                      >
                        {m === 'upi' ? '⚡ UPI' : '🏦 Bank Transfer'}
                      </button>
                    ))}
                  </div>
                </div>
                {withdrawMethod === 'upi' && (
                  <div className="db-modal-field">
                    <label>UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      className="db-input"
                    />
                  </div>
                )}
                <button className="db-btn-primary db-btn-full" onClick={handleWithdraw}>
                  Withdraw ₹{withdrawAmount || '0'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div className="db-panel db-panel--hist">
        <div className="db-panel-header">
          <span className="db-panel-title">Transaction History</span>
          <div className="db-filter-tabs">
            {['all', 'payout', 'premium', 'withdrawal'].map(f => (
              <button
                key={f}
                className={`db-filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="db-txn-list db-txn-list--full">
          {filtered.map(txn => (
            <div key={txn.id} className="db-txn-row db-txn-row--lg">
              <div className={`db-txn-icon ${txn.type === 'payout' ? 'db-txn-icon--green' : 'db-txn-icon--dim'}`}>
                <txn.icon size={15} />
              </div>
              <div className="db-txn-info">
                <span className="db-txn-label">{txn.label}</span>
                <span className="db-txn-date">{txn.date}</span>
              </div>
              <div className="db-txn-right">
                <span className={`db-txn-amount ${txn.amount > 0 ? 'db-txn-amount--pos' : 'db-txn-amount--neg'}`}>
                  {txn.amount > 0 ? '+' : '−'}₹{fmt(txn.amount)}
                </span>
                <span className={`db-txn-status ${txn.status}`}>{txn.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: COVERAGE
// ─────────────────────────────────────────────────────────────────────────────
function PageCoverage() {
  const [autoRenew, setAutoRenew] = useState(true);

  return (
    <div className="db-page">

      {/* Plan card */}
      <div className="db-plan-hero">
        <div>
          <div className="db-plan-badge">
            <Zap size={12} /> Premium Plan — Active
          </div>
          <h2 className="db-plan-name">Premium Coverage</h2>
          <p className="db-plan-price">₹40 <span>/week</span></p>
          <p className="db-plan-renew">Renews in 4 days · Auto-renew {autoRenew ? 'on' : 'off'}</p>
        </div>
        <div className="db-plan-stat">
          <div>
            <span className="db-plan-stat-label">Max Daily Payout</span>
            <span className="db-plan-stat-value">₹1,000</span>
          </div>
          <div>
            <span className="db-plan-stat-label">Coverage Since</span>
            <span className="db-plan-stat-value">{USER.memberSince}</span>
          </div>
          <div>
            <span className="db-plan-stat-label">Total Paid Out</span>
            <span className="db-plan-stat-value">₹14,820</span>
          </div>
        </div>
      </div>

      <div className="db-two-col">

        {/* Triggers */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">Coverage Triggers</span>
            <span className="db-panel-sub">What activates your payout</span>
          </div>
          <div className="db-trigger-list">
            {COVERAGE_TRIGGERS.map((t, i) => (
              <div key={i} className="db-trigger-row">
                <div className="db-trigger-info">
                  <span className="db-trigger-type">{t.type}</span>
                  <span className="db-trigger-label">{t.label}</span>
                </div>
                <span className="db-trigger-impact">{t.impact} impact</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings + upgrade */}
        <div className="db-col-stack">
          <div className="db-panel">
            <div className="db-panel-header">
              <span className="db-panel-title">Plan Settings</span>
            </div>
            <div className="db-setting-row">
              <div>
                <span className="db-setting-label">Auto-renew weekly</span>
                <span className="db-setting-sub">Premium renews every Monday</span>
              </div>
              <div
                className={`db-toggle ${autoRenew ? 'on' : ''}`}
                onClick={() => setAutoRenew(r => !r)}
              >
                <div className="db-toggle-knob" />
              </div>
            </div>
            <div className="db-setting-row">
              <div>
                <span className="db-setting-label">Coverage city</span>
                <span className="db-setting-sub">{USER.city}</span>
              </div>
              <span className="db-setting-tag"><MapPin size={11} /> Active</span>
            </div>
            <div className="db-setting-row">
              <div>
                <span className="db-setting-label">Platform</span>
                <span className="db-setting-sub">{USER.platform}</span>
              </div>
              <span className="db-setting-tag"><CheckCircle2 size={11} /> Verified</span>
            </div>
          </div>

          {/* Exclusions */}
          <div className="db-panel">
            <div className="db-panel-header">
              <span className="db-panel-title">Exclusions</span>
            </div>
            <ul className="db-exclusion-list">
              {[
                'First 2 hours each day (deductible)',
                'Voluntary offline — not disruption related',
                'Platform scheduled maintenance',
                'Operating outside registered city',
              ].map((e, i) => (
                <li key={i} className="db-exclusion-item">
                  <X size={12} className="db-exclusion-x" /> {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: PROFILE
// ─────────────────────────────────────────────────────────────────────────────
function PageProfile() {
  const [editing, setEditing] = useState(false);
  const [earnings, setEarnings] = useState(USER.dailyEarnings);

  return (
    <div className="db-page">

      {/* Profile header */}
      <div className="db-profile-hero">
        <div className="db-avatar">
          {USER.firstName[0]}{USER.name.split(' ')[1][0]}
        </div>
        <div className="db-profile-info">
          <h2 className="db-profile-name">{USER.name}</h2>
          <p className="db-profile-sub">{USER.platform} · {USER.city}</p>
          <div className="db-profile-badges">
            <span className="db-badge-verified"><CheckCircle2 size={11} /> Verified</span>
            <span className="db-badge-plan"><Zap size={11} /> Premium</span>
            <span className="db-badge-member"><Calendar size={11} /> Since {USER.memberSince}</span>
          </div>
        </div>
      </div>

      <div className="db-two-col">

        {/* Personal info */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">Personal Information</span>
            <button className="db-btn-ghost" onClick={() => setEditing(e => !e)}>
              {editing ? 'Save' : 'Edit'}
            </button>
          </div>
          <div className="db-profile-fields">
            {[
              { label: 'Full Name', value: USER.name },
              { label: 'Platform', value: USER.platform },
              { label: 'Primary City', value: USER.city },
              { label: 'Member Since', value: USER.memberSince },
            ].map((f, i) => (
              <div key={i} className="db-profile-field">
                <span className="db-field-label">{f.label}</span>
                <span className="db-field-value">{f.value}</span>
              </div>
            ))}
            <div className="db-profile-field">
              <span className="db-field-label">Avg. Daily Earnings</span>
              {editing ? (
                <input
                  type="number"
                  value={earnings}
                  onChange={e => setEarnings(e.target.value)}
                  className="db-input db-input--inline"
                />
              ) : (
                <span className="db-field-value">₹{fmt(earnings)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Verification + security */}
        <div className="db-col-stack">
          <div className="db-panel">
            <div className="db-panel-header">
              <span className="db-panel-title">Verification Status</span>
            </div>
            <div className="db-verification-list">
              {[
                { label: 'Identity Document', status: 'verified', sub: 'Aadhaar verified'           },
                { label: 'Platform Proof',    status: 'verified', sub: 'Swiggy partner confirmed'   },
                { label: 'GPS Location',      status: 'verified', sub: 'Mumbai zone active'          },
                { label: 'Trust Score',       status: 'verified', sub: `${USER.trustScore}/100 — High` },
              ].map((v, i) => (
                <div key={i} className="db-verify-row">
                  <div className={`db-verify-dot ${v.status}`} />
                  <div>
                    <span className="db-verify-label">{v.label}</span>
                    <span className="db-verify-sub">{v.sub}</span>
                  </div>
                  <CheckCircle2 size={14} className="db-verify-check" />
                </div>
              ))}
            </div>
          </div>

          <div className="db-panel">
            <div className="db-panel-header">
              <span className="db-panel-title">Account Actions</span>
            </div>
            <div className="db-action-list">
              <button className="db-action-btn">
                <RefreshCw size={14} /> Change Password
              </button>
              <button className="db-action-btn">
                <Bell size={14} /> Notification Settings
              </button>
              <button className="db-action-btn db-action-btn--danger">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [active, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pages = {
    dashboard: <PageDashboard />,
    wallet:    <PageWallet />,
    coverage:  <PageCoverage />,
    profile:   <PageProfile />,
  };

  const pageTitle = {
    dashboard: 'Dashboard',
    wallet:    'Wallet',
    coverage:  'My Coverage',
    profile:   'Profile',
  };

  return (
    <div className="db-root">

      {/* Sidebar */}
      <aside className={`db-sidebar ${sidebarOpen ? 'db-sidebar--open' : ''}`}>
        <div className="db-sidebar-logo">
          <span className="db-logo-text">Coveer</span>
          <button className="db-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <nav className="db-nav">
          <div className="db-nav-section-label">MAIN</div>
          {NAV.map(item => (
            <button
              key={item.id}
              className={`db-nav-item ${active === item.id ? 'db-nav-item--active' : ''}`}
              onClick={() => { setActive(item.id); setSidebarOpen(false); }}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
              {active === item.id && <div className="db-nav-indicator" />}
            </button>
          ))}

          <div className="db-nav-section-label" style={{ marginTop: '1.5rem' }}>OTHER</div>
          <button className="db-nav-item">
            <Settings size={17} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-sidebar-user">
            <div className="db-sidebar-avatar">{USER.firstName[0]}{USER.name.split(' ')[1][0]}</div>
            <div className="db-sidebar-user-info">
              <span className="db-sidebar-user-name">{USER.firstName}</span>
              <span className="db-sidebar-user-plan">Premium · {USER.city}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="db-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="db-main">

        {/* Top bar */}
        <header className="db-topbar">
          <div className="db-topbar-left">
            <button className="db-hamburger" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <h2 className="db-topbar-title">{pageTitle[active]}</h2>
            </div>
          </div>
          <div className="db-topbar-right">
            <div className="db-topbar-disruption">
              <span className="db-disruption-dot" />
              Heavy Rain · Mumbai
            </div>
            <button className="db-topbar-bell">
              <Bell size={17} />
              <span className="db-bell-badge" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="db-content">
          {pages[active]}
        </div>
      </main>
    </div>
  );
}