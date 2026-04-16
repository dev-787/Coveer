import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import {
  LayoutDashboard, Wallet, Shield, User, Settings,
  CloudRain, Wind, Thermometer,
  ArrowUpRight, Bell, LogOut, Menu, X,
  CheckCircle2, Clock, IndianRupee,
  Calendar, MapPin, Zap, BarChart2, RefreshCw
} from 'lucide-react';

// ── Product-defined parametric thresholds (not from API) ──────────────────────
const COVERAGE_TRIGGERS = [
  { label: 'Rainfall > 2.5mm/hr',  impact: '30%',  type: 'Light Rain'    },
  { label: 'Rainfall > 7.5mm/hr',  impact: '60%',  type: 'Heavy Rain'    },
  { label: 'Rainfall > 15mm/hr',   impact: '100%', type: 'Extreme Rain'  },
  { label: 'AQI 201–300',          impact: '30%',  type: 'Unhealthy Air' },
  { label: 'AQI > 300',            impact: '60%',  type: 'Hazardous Air' },
  { label: 'Temperature > 42°C',   impact: '50%',  type: 'Heatwave'      },
  { label: 'Local Curfew',         impact: '100%', type: 'Disruption'    },
];

const NAV = [
  { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'wallet',    label: 'Wallet',      icon: Wallet          },
  { id: 'coverage',  label: 'My Coverage', icon: Shield          },
  { id: 'profile',   label: 'Profile',     icon: User            },
  { id: 'settings',  label: 'Settings',    icon: Settings        },
];

const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.abs(n));

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: DASHBOARD HOME
// ─────────────────────────────────────────────────────────────────────────────
function PageDashboard({ user, weather, weatherLoading }) {
  const { t } = useLanguage();
  const firstName     = user?.fullName?.firstName ?? '';
  const city          = user?.city ?? '';
  const plan          = user?.plan ?? 'basic';
  const dailyEarnings = user?.dailyEarnings ?? 0;
  const walletBalance = user?.wallet?.balance ?? 0;
  const trustScore    = user?.trustScore ?? 100;
  const maxPayout     = plan === 'premium' ? 1000 : 600;
  const hourlyIncome  = Math.round(dailyEarnings / 8);

  const isAffected   = weather?.impact?.isAffected ?? false;
  const impactReason = weather?.impact?.reason ?? 'Normal';
  const estPayout    = Math.min(weather?.impact?.estimatedHourlyPayout ?? 0, maxPayout);

  // Fetch last 7 days of transactions
  const [recentTxns, setRecentTxns] = useState([]);
  const [txnLoading, setTxnLoading] = useState(true);

  useEffect(() => {
    axios.get('https://coveer-backend.onrender.com/payments/wallet', { withCredentials: true })
      .then(res => {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const filtered = (res.data.transactions ?? [])
          .filter(t => new Date(t.createdAt).getTime() >= sevenDaysAgo)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentTxns(filtered);
      })
      .catch(() => setRecentTxns([]))
      .finally(() => setTxnLoading(false));
  }, []);

  const txnIcon = (type) => {
    if (type === 'payout')     return CloudRain;
    if (type === 'premium')    return Shield;
    if (type === 'withdrawal') return ArrowUpRight;
    return IndianRupee;
  };

  return (
    <div className="db-page">
      <div className="db-greeting">
        <div>
          <p className="db-greeting-sub">{t('goodDay')}</p>
          <h1 className="db-greeting-name">{firstName} 👋</h1>
        </div>
        <div className={`db-status-pill ${isAffected ? 'db-status-affected' : 'db-status-normal'}`}>
          <span className="db-status-dot" />
          {isAffected ? `Affected — ${city}` : `Normal — ${city}`}
        </div>
      </div>

      <div className="db-cards-row">
        <div className="db-card db-card--accent">
          <div className="db-card-label">{t('thisHourPayout')}</div>
          <div className="db-card-value">₹{fmt(estPayout)}</div>
          <div className="db-card-sub">
            {isAffected
              ? <><CloudRain size={13} /> {impactReason} · {t('willBeCredited')}</>
              : <><Shield size={13} /> {t('noDisruption')}</>
            }
          </div>
          <div className="db-card-glow" />
        </div>
        <div className="db-card">
          <div className="db-card-label">{t('walletBalance')}</div>
          <div className="db-card-value">₹{fmt(walletBalance)}</div>
          <div className="db-card-sub"><ArrowUpRight size={13} /> Available to withdraw</div>
        </div>
        <div className="db-card">
          <div className="db-card-label">{t('maxDailyPayout')}</div>
          <div className="db-card-value">₹{fmt(maxPayout)}</div>
          <div className="db-card-sub"><Shield size={13} /> {plan} plan</div>
        </div>
      </div>

      <div className="db-two-col">
        {/* Weekly Impact placeholder */}
        <div className="db-panel db-panel--chart">
          <div className="db-panel-header">
            <span className="db-panel-title">{t('weeklyImpact')}</span>
          </div>
          <div className="db-empty-state">
            <BarChart2 size={28} color="rgba(123,121,196,0.25)" />
            <p>Payout history will appear after your first week of coverage.</p>
          </div>
        </div>

        {/* Recent Activity — last 7 days */}
        <div className="db-panel db-panel--activity">
          <div className="db-panel-header">
            <span className="db-panel-title">{t('recentActivity')}</span>
            <span className="db-panel-sub">{t('last7Days')}</span>
          </div>
          {txnLoading ? (
            <div className="db-txn-list">
              {[1,2,3].map(i => <div key={i} className="db-skeleton" style={{ height: '44px', borderRadius: '8px' }} />)}
            </div>
          ) : recentTxns.length === 0 ? (
            <div className="db-empty-state">
              <Clock size={28} color="rgba(123,121,196,0.25)" />
              <p>No transactions in the last 7 days.</p>
            </div>
          ) : (
            <div className="db-txn-list">
              {recentTxns.map((txn, i) => {
                const Icon     = txnIcon(txn.type);
                const isCredit = txn.type === 'payout' || txn.type === 'credit';
                return (
                  <div key={i} className="db-txn-row">
                    <div className={`db-txn-icon ${isCredit ? 'db-txn-icon--green' : 'db-txn-icon--dim'}`}>
                      <Icon size={14} />
                    </div>
                    <div className="db-txn-info">
                      <span className="db-txn-label">{txn.reason}</span>
                      <span className="db-txn-date">
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <span className={`db-txn-amount ${isCredit ? 'db-txn-amount--pos' : 'db-txn-amount--neg'}`}>
                      {isCredit ? '+' : '−'}₹{fmt(txn.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="db-two-col">
        {/* Live conditions */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">{t('liveConditions')} · {city}</span>
            {weather && (
              <span className="db-panel-badge">
                {new Date(weather.weather.fetchedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="db-conditions">
            {weatherLoading ? (
              [1,2,3].map(i => <div key={i} className="db-condition-row db-skeleton" style={{ height: '48px' }} />)
            ) : weather ? (
              <>
                <div className="db-condition-row">
                  <div className="db-condition-icon"><CloudRain size={15} /></div>
                  <span className="db-condition-label">Rainfall</span>
                  <span className="db-condition-value">{weather.weather.rainfall} mm/hr</span>
                  <span className={`db-condition-badge ${weather.weather.rainfall > 2.5 ? 'db-badge--red' : 'db-badge--green'}`}>
                    {weather.weather.rainfall > 2.5 ? 'Affected' : 'Normal'}
                  </span>
                </div>
                <div className="db-condition-row">
                  <div className="db-condition-icon"><Wind size={15} /></div>
                  <span className="db-condition-label">AQI</span>
                  <span className="db-condition-value">{weather.weather.aqi}</span>
                  <span className={`db-condition-badge ${weather.weather.aqi > 200 ? 'db-badge--red' : 'db-badge--green'}`}>
                    {weather.weather.aqiCategory}
                  </span>
                </div>
                <div className="db-condition-row">
                  <div className="db-condition-icon"><Thermometer size={15} /></div>
                  <span className="db-condition-label">Temperature</span>
                  <span className="db-condition-value">{weather.weather.temperature}°C</span>
                  <span className={`db-condition-badge ${weather.weather.temperature > 42 ? 'db-badge--red' : 'db-badge--green'}`}>
                    {weather.weather.temperature > 42 ? 'Heatwave' : 'Normal'}
                  </span>
                </div>
              </>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.25)' }}>Weather data unavailable</p>
            )}
          </div>
        </div>

        {/* Trust score */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">{t('trustScore')}</span>
          </div>
          <div className="db-trust">
            <div className="db-trust-ring">
              <svg viewBox="0 0 80 80" className="db-trust-svg">
                {/* Track */}
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                {/* Filled arc — strokeDasharray drives fill %, CSS animates it in */}
                <circle cx="40" cy="40" r="32" fill="none"
                  stroke="url(#trustGrad)" strokeWidth="6" strokeLinecap="round"
                  className="db-trust-arc"
                  style={{
                    '--trust-fill': `${2 * Math.PI * 32 * trustScore / 100}`,
                    '--trust-total': `${2 * Math.PI * 32}`,
                  }}
                />
                <defs>
                  <linearGradient id="trustGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#5a57b0" />
                    <stop offset="100%" stopColor="#a8aacc" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="db-trust-score">{trustScore}</span>
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
function PageWallet({ user }) {
  const navigate = useNavigate();
  const isVerified = user?.verificationStatus === 'verified';

  // Gate — show locked state for unverified users
  if (!isVerified) {
    return (
      <div className="db-page">
        <div className="db-panel" style={{ alignItems: 'center', padding: '3rem 2rem', textAlign: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🔒</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em' }}>Verification Required</h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.38)', maxWidth: '300px', lineHeight: 1.6 }}>
            Complete your identity verification to unlock wallet features — adding funds, activating your plan, and withdrawals.
          </p>
          <button className="db-btn-primary" style={{ marginTop: '0.5rem' }} onClick={() => navigate('/verify')}>
            Verify Now
          </button>
        </div>
      </div>
    );
  }

  const [walletData, setWalletData]       = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [planStatus, setPlanStatus]       = useState('inactive');

  // Add funds state
  const [addFundsMode, setAddFundsMode]   = useState(false);
  const [addAmount, setAddAmount]         = useState('');
  const [addSuccess, setAddSuccess]       = useState(false);

  // Withdraw state
  const [withdrawMode, setWithdrawMode]   = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId]                 = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    axios.get('https://coveer-backend.onrender.com/payments/wallet', { withCredentials: true })
      .then(res => {
        setWalletData(res.data);
        setWalletBalance(res.data.balance);
        setPlanStatus(res.data.planStatus);
      })
      .catch(console.error)
      .finally(() => setWalletLoading(false));
  }, []);

  // ── Add funds via Razorpay ──────────────────────────────────────────────────
  const handleAddFunds = async () => {
    if (!addAmount || Number(addAmount) < 25) return;
    try {
      const orderRes = await axios.post(
        'https://coveer-backend.onrender.com/payments/add-funds/order',
        { amount: Number(addAmount) },
        { withCredentials: true }
      );
      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key:         keyId,
        amount,
        currency,
        name:        'Coveer',
        description: 'Wallet Top-up',
        order_id:    orderId,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              'https://coveer-backend.onrender.com/payments/add-funds/verify',
              {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                amount,
              },
              { withCredentials: true }
            );
            setWalletBalance(verifyRes.data.newBalance);
            setWalletData(prev => prev ? { ...prev, balance: verifyRes.data.newBalance } : prev);
            setAddFundsMode(false);
            setAddAmount('');
            setAddSuccess(true);
            setTimeout(() => setAddSuccess(false), 4000);
          } catch {
            alert('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name:  `${user?.fullName?.firstName} ${user?.fullName?.lastName}`,
          email: user?.email,
        },
        config: {
          display: {
            blocks: {
              upi:  { name: 'Pay via UPI', instruments: [{ method: 'upi' }] },
              card: { name: 'Pay via Card', instruments: [{ method: 'card' }] },
            },
            sequence: ['block.upi', 'block.card'],
            preferences: { show_default_blocks: false },
          },
        },
        theme: { color: '#7b79c4' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Add funds error:', err);
    }
  };

  // ── Activate plan ───────────────────────────────────────────────────────────
  const handleActivatePlan = async () => {
    try {
      const res = await axios.post('https://coveer-backend.onrender.com/payments/activate-plan', {}, { withCredentials: true });
      setPlanStatus('active');
      setWalletBalance(res.data.newBalance);
      setWalletData(prev => prev ? { ...prev, planStatus: 'active', balance: res.data.newBalance } : prev);
    } catch (err) {
      alert(err.response?.data?.message || 'Plan activation failed');
    }
  };

  // ── Withdraw ────────────────────────────────────────────────────────────────
  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) < 10 || !upiId) return;
    try {
      const res = await axios.post(
        'https://coveer-backend.onrender.com/payments/withdraw',
        { amount: Number(withdrawAmount), upiId },
        { withCredentials: true }
      );
      setWalletBalance(res.data.newBalance);
      setWithdrawSuccess(true);
      setTimeout(() => { setWithdrawSuccess(false); setWithdrawMode(false); setWithdrawAmount(''); }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  const plan        = walletData?.plan ?? user?.plan ?? 'basic';
  const planCost    = plan === 'premium' ? 40 : 25;
  const planExpiry  = walletData?.planExpiresAt
    ? new Date(walletData.planExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : null;
  const txns        = walletData?.transactions ?? [];

  const txnIcon = (type) => {
    if (type === 'payout')     return CloudRain;
    if (type === 'premium')    return Shield;
    if (type === 'withdrawal') return ArrowUpRight;
    if (type === 'credit')     return ArrowUpRight;
    return IndianRupee;
  };

  return (
    <div className="db-page">

      {/* Balance hero */}
      <div className="db-wallet-hero">
        <div className="db-wallet-hero-left">
          <p className="db-wallet-hero-label">Total Balance</p>
          <h2 className="db-wallet-hero-amount">₹{fmt(walletBalance)}</h2>
          <p className="db-wallet-hero-sub">Available for withdrawal</p>
        </div>
        <div className="db-wallet-actions">
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="db-btn-primary" onClick={() => setAddFundsMode(true)}>
              + Add Funds
            </button>
            <button className="db-btn-primary" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={() => setWithdrawMode(true)}>
              <ArrowUpRight size={15} /> Withdraw
            </button>
          </div>

          {/* Plan status badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <span className={`db-condition-badge ${planStatus === 'active' ? 'db-badge--green' : 'db-badge--red'}`}
              style={{ fontSize: '0.72rem' }}>
              {planStatus === 'active' ? `Plan Active${planExpiry ? ` · expires ${planExpiry}` : ''}` : 'Plan Inactive'}
            </span>
            {planStatus !== 'active' && (
              <button className="db-btn-ghost" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                onClick={handleActivatePlan}>
                {walletBalance >= planCost ? 'Activate Plan' : `Add ₹${planCost - walletBalance} to activate`}
              </button>
            )}
          </div>
        </div>
        <div className="db-wallet-glow" />
      </div>

      {/* Add funds success toast */}
      {addSuccess && (
        <div style={{ background: 'rgba(80,200,120,0.1)', border: '1px solid rgba(80,200,120,0.25)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'rgba(80,200,120,0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={15} /> Wallet credited successfully!
        </div>
      )}

      {/* Add funds modal */}
      {addFundsMode && (
        <div className="db-modal-overlay" onClick={() => setAddFundsMode(false)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>Add Funds</h3>
              <button onClick={() => setAddFundsMode(false)}><X size={18} /></button>
            </div>
            <p className="db-modal-balance">Current balance: ₹{fmt(walletBalance)}</p>
            <div className="db-modal-field">
              <label>Amount (₹) — minimum ₹25</label>
              <input type="number" placeholder="Enter amount..." value={addAmount}
                onChange={e => setAddAmount(e.target.value)} min={25} className="db-input" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[50, 100, 200, 500].map(q => (
                <button key={q} className="db-method-tab" onClick={() => setAddAmount(String(q))}>₹{q}</button>
              ))}
            </div>
            <button className="db-btn-primary db-btn-full" onClick={handleAddFunds}>
              Pay ₹{addAmount || '0'} via Razorpay
            </button>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
              Test UPI: success@razorpay · Test card: 5267 3181 8797 5449 · CVV: 123 · OTP: 1234
            </p>
          </div>
        </div>
      )}

      {/* Withdraw modal */}
      {withdrawMode && (
        <div className="db-modal-overlay" onClick={() => setWithdrawMode(false)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            {withdrawSuccess ? (
              <div className="db-modal-success">
                <CheckCircle2 size={40} color="#7b79c4" />
                <h3>Withdrawal Initiated</h3>
                <p>₹{withdrawAmount} will reach your UPI in minutes.</p>
              </div>
            ) : (
              <>
                <div className="db-modal-header">
                  <h3>Withdraw Funds</h3>
                  <button onClick={() => setWithdrawMode(false)}><X size={18} /></button>
                </div>
                <p className="db-modal-balance">Available: ₹{fmt(walletBalance)}</p>
                <div className="db-modal-field">
                  <label>Amount (₹) — minimum ₹10</label>
                  <input type="number" placeholder="Enter amount..." value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)} max={walletBalance} className="db-input" />
                </div>
                <div className="db-modal-field">
                  <label>UPI ID</label>
                  <input type="text" placeholder="yourname@upi" value={upiId}
                    onChange={e => setUpiId(e.target.value)} className="db-input" />
                </div>
                <button className="db-btn-primary db-btn-full" onClick={handleWithdraw}>
                  Withdraw ₹{withdrawAmount || '0'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div className="db-panel">
        <div className="db-panel-header">
          <span className="db-panel-title">Transaction History</span>
          {txns.length > 0 && <span className="db-panel-sub">{txns.length} transactions</span>}
        </div>
        {walletLoading ? (
          [1,2,3].map(i => <div key={i} className="db-skeleton" style={{ height: '52px', borderRadius: '8px' }} />)
        ) : txns.length === 0 ? (
          <div className="db-empty-state" style={{ padding: '3rem 1rem' }}>
            <IndianRupee size={28} color="rgba(123,121,196,0.25)" />
            <p style={{ maxWidth: '260px' }}>Transaction history will appear here once your first payout is processed.</p>
          </div>
        ) : (
          <div className="db-txn-list db-txn-list--full">
            {txns.map((txn, i) => {
              const Icon = txnIcon(txn.type);
              const isCredit = txn.type === 'payout' || txn.type === 'credit';
              return (
                <div key={i} className="db-txn-row db-txn-row--lg">
                  <div className={`db-txn-icon ${isCredit ? 'db-txn-icon--green' : 'db-txn-icon--dim'}`}>
                    <Icon size={15} />
                  </div>
                  <div className="db-txn-info">
                    <span className="db-txn-label">{txn.reason}</span>
                    <span className="db-txn-date">{new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="db-txn-right">
                    <span className={`db-txn-amount ${isCredit ? 'db-txn-amount--pos' : 'db-txn-amount--neg'}`}>
                      {isCredit ? '+' : '−'}₹{fmt(txn.amount)}
                    </span>
                    <span className="db-txn-status">{txn.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: COVERAGE
// ─────────────────────────────────────────────────────────────────────────────
function PageCoverage({ user }) {
  const [autoRenew, setAutoRenew] = useState(user?.autoRenew ?? true);
  const plan        = user?.plan ?? 'basic';
  const city        = user?.city ?? '';
  const platform    = user?.platform ?? '';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '';
  const maxPayout   = plan === 'premium' ? 1000 : 600;
  const weeklyPrice = plan === 'premium' ? 40 : 25;

  return (
    <div className="db-page">
      <div className="db-plan-hero">
        <div>
          <div className="db-plan-badge"><Zap size={12} /> {plan} Plan — Active</div>
          <h2 className="db-plan-name">{plan.charAt(0).toUpperCase() + plan.slice(1)} Coverage</h2>
          <p className="db-plan-price">₹{weeklyPrice} <span>/week</span></p>
          <p className="db-plan-renew">Auto-renew {autoRenew ? 'on' : 'off'}</p>
        </div>
        <div className="db-plan-stat">
          <div>
            <span className="db-plan-stat-label">Max Daily Payout</span>
            <span className="db-plan-stat-value">₹{fmt(maxPayout)}</span>
          </div>
          <div>
            <span className="db-plan-stat-label">Coverage Since</span>
            <span className="db-plan-stat-value">{memberSince}</span>
          </div>
        </div>
      </div>

      <div className="db-two-col">
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

        <div className="db-col-stack">
          <div className="db-panel">
            <div className="db-panel-header"><span className="db-panel-title">Plan Settings</span></div>
            <div className="db-setting-row">
              <div>
                <span className="db-setting-label">Auto-renew weekly</span>
                <span className="db-setting-sub">{plan} renews every Monday</span>
              </div>
              <div className={`db-toggle ${autoRenew ? 'on' : ''}`} onClick={() => setAutoRenew(r => !r)}>
                <div className="db-toggle-knob" />
              </div>
            </div>
            <div className="db-setting-row">
              <div>
                <span className="db-setting-label">Coverage city</span>
                <span className="db-setting-sub">{city}</span>
              </div>
              <span className="db-setting-tag"><MapPin size={11} /> Active</span>
            </div>
            <div className="db-setting-row">
              <div>
                <span className="db-setting-label">Platform</span>
                <span className="db-setting-sub">{platform}</span>
              </div>
              <span className="db-setting-tag"><CheckCircle2 size={11} /> Verified</span>
            </div>
          </div>

          <div className="db-panel">
            <div className="db-panel-header"><span className="db-panel-title">Exclusions</span></div>
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
function PageProfile({ user }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [editing, setEditing] = useState(false);
  const [earnings, setEarnings] = useState(user?.dailyEarnings ?? 0);

  const firstName   = user?.fullName?.firstName ?? '';
  const lastName    = user?.fullName?.lastName ?? '';
  const fullName    = `${firstName} ${lastName}`.trim();
  const platform    = user?.platform ?? '';
  const city        = user?.city ?? '';
  const plan        = user?.plan ?? 'basic';
  const trustScore  = user?.trustScore ?? 100;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '';

  const isVerified      = user?.verificationStatus === 'verified';
  const verifStatus     = user?.verificationStatus ?? 'pending'; // pending | under_review | verified | rejected
  const docsSubmitted   = verifStatus === 'under_review' || verifStatus === 'verified' || verifStatus === 'rejected';

  return (
    <div className="db-page">
      <div className="db-profile-hero">
        <div className="db-avatar">
          {firstName[0]}{lastName[0]}
        </div>
        <div className="db-profile-info">
          <h2 className="db-profile-name">{fullName}</h2>
          <p className="db-profile-sub">{platform} · {city}</p>
          <div className="db-profile-badges">
            {isVerified
              ? <span className="db-badge-verified"><CheckCircle2 size={11} /> Verified</span>
              : <span className="db-badge-unverified"><Clock size={11} /> {verifStatus === 'under_review' ? 'Under Review' : 'Unverified'}</span>
            }
            <span className="db-badge-plan"><Zap size={11} /> {plan}</span>
            <span className="db-badge-member"><Calendar size={11} /> Since {memberSince}</span>
          </div>
        </div>
      </div>

      <div className="db-two-col">
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">Personal Information</span>
            <button className="db-btn-ghost" onClick={() => setEditing(e => !e)}>
              {editing ? 'Save' : 'Edit'}
            </button>
          </div>
          <div className="db-profile-fields">
            {[
              { label: 'Full Name',    value: fullName    },
              { label: 'Platform',     value: platform    },
              { label: 'Primary City', value: city        },
              { label: 'Member Since', value: memberSince },
            ].map((f, i) => (
              <div key={i} className="db-profile-field">
                <span className="db-field-label">{f.label}</span>
                <span className="db-field-value">{f.value}</span>
              </div>
            ))}
            <div className="db-profile-field">
              <span className="db-field-label">Avg. Daily Earnings</span>
              {editing ? (
                <input type="number" value={earnings} onChange={e => setEarnings(e.target.value)}
                  className="db-input db-input--inline" />
              ) : (
                <span className="db-field-value">₹{fmt(earnings)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="db-col-stack">
          <div className="db-panel">
            <div className="db-panel-header"><span className="db-panel-title">Verification Status</span></div>
            <div className="db-verification-list">
              {/* Documents — only shown as verified if verificationStatus is 'verified' */}
              <div className="db-verify-row">
                <div className={`db-verify-dot ${isVerified ? 'verified' : docsSubmitted ? 'pending' : 'unverified'}`} />
                <div>
                  <span className="db-verify-label">Identity Document</span>
                  <span className="db-verify-sub">
                    {isVerified ? 'Aadhaar verified' : docsSubmitted ? 'Under review' : 'Not submitted'}
                  </span>
                </div>
                {isVerified && <CheckCircle2 size={14} className="db-verify-check" />}
              </div>
              <div className="db-verify-row">
                <div className={`db-verify-dot ${isVerified ? 'verified' : docsSubmitted ? 'pending' : 'unverified'}`} />
                <div>
                  <span className="db-verify-label">Platform Proof</span>
                  <span className="db-verify-sub">
                    {isVerified ? `${platform} partner confirmed` : docsSubmitted ? 'Under review' : 'Not submitted'}
                  </span>
                </div>
                {isVerified && <CheckCircle2 size={14} className="db-verify-check" />}
              </div>
              <div className="db-verify-row">
                <div className="db-verify-dot verified" />
                <div>
                  <span className="db-verify-label">Trust Score</span>
                  <span className="db-verify-sub">{trustScore}/100 — High</span>
                </div>
                <CheckCircle2 size={14} className="db-verify-check" />
              </div>
            </div>
            {!isVerified && (
              <button className="db-btn-primary" style={{ marginTop: '0.5rem', borderRadius: '10px', padding: '0.6rem 1.2rem', fontSize: '0.82rem' }}
                onClick={() => navigate('/verify')}>
                Verify Now
              </button>
            )}
          </div>

          <div className="db-panel">
            <div className="db-panel-header"><span className="db-panel-title">Account Actions</span></div>
            <div className="db-action-list">
              <button className="db-action-btn"><RefreshCw size={14} /> Change Password</button>
              <button className="db-action-btn"><Bell size={14} /> Notification Settings</button>
              <button className="db-action-btn db-action-btn--danger"
                onClick={async () => { await logout(); navigate('/auth'); }}>
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
// PAGE: SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
const PLAN_OPTIONS = [
  { id: 'basic',   name: 'Basic',   price: '₹25/week', maxPayout: '₹600/day',   features: ['Weather protection', 'AQI alerts', 'Hourly payouts'] },
  { id: 'premium', name: 'Premium', price: '₹40/week', maxPayout: '₹1,000/day', features: ['Everything in Basic', 'Priority payouts', 'Curfew & disruption cover'], recommended: true },
];

function PageSettings({ user }) {
  const { lang, setLanguage } = useLanguage();
  const { setUser } = useAuth();
  const [planLoading, setPlanLoading] = useState(false);
  const [planMsg, setPlanMsg]         = useState('');
  const [planMsgType, setPlanMsgType] = useState('info');

  const currentPlan = user?.plan ?? 'basic';
  const planStatus  = user?.planStatus ?? 'inactive';

  const handleChangePlan = async (planId) => {
    if (planId === currentPlan) return;
    setPlanLoading(true);
    setPlanMsg('');
    try {
      await axios.patch('https://coveer-backend.onrender.com/auth/update-plan', { plan: planId }, { withCredentials: true });
      // Update AuthContext so the whole app reflects the new plan immediately
      setUser(prev => prev ? { ...prev, plan: planId } : prev);
      setPlanMsgType('success');
      setPlanMsg(`Switched to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan. Takes effect on next renewal.`);
    } catch (err) {
      setPlanMsgType('error');
      setPlanMsg(err.response?.data?.message || 'Failed to change plan.');
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="db-page">

      {/* Language */}
      <div className="db-panel">
        <div className="db-panel-header">
          <span className="db-panel-title">Language</span>
          <span className="db-panel-sub">App display language</span>
        </div>
        <div className="db-settings-grid">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              className={`db-settings-option ${lang === l.code ? 'db-settings-option--active' : ''}`}
              onClick={() => setLanguage(l.code)}
            >
              {lang === l.code && <CheckCircle2 size={13} />}
              {l.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.25rem' }}>
          Full translation coming soon. Currently affects date/number formatting.
        </p>
      </div>

      {/* Plan */}
      <div className="db-panel">
        <div className="db-panel-header">
          <span className="db-panel-title">Change Plan</span>
          <span className={`db-condition-badge ${planStatus === 'active' ? 'db-badge--green' : 'db-badge--red'}`}>
            {planStatus === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="db-plan-options">
          {PLAN_OPTIONS.map(plan => (
            <div
              key={plan.id}
              className={`db-plan-option ${currentPlan === plan.id ? 'db-plan-option--current' : ''} ${plan.recommended ? 'db-plan-option--recommended' : ''}`}
            >
              {plan.recommended && <span className="db-plan-option-badge">Recommended</span>}
              <div className="db-plan-option-header">
                <span className="db-plan-option-name">{plan.name}</span>
                <span className="db-plan-option-price">{plan.price}</span>
              </div>
              <p className="db-plan-option-max">Max payout: {plan.maxPayout}</p>
              <ul className="db-plan-option-features">
                {plan.features.map(f => <li key={f}><CheckCircle2 size={11} /> {f}</li>)}
              </ul>
              {currentPlan === plan.id ? (
                <span className="db-plan-option-current-tag">Current Plan</span>
              ) : (
                <button
                  className="db-btn-ghost"
                  style={{ marginTop: '0.75rem', width: '100%', textAlign: 'center' }}
                  onClick={() => handleChangePlan(plan.id)}
                  disabled={planLoading}
                >
                  Switch to {plan.name}
                </button>
              )}
            </div>
          ))}
        </div>
        {planMsg && (
          <p style={{ fontSize: '0.82rem', color: planMsgType === 'success' ? 'rgba(80,200,120,0.85)' : '#f87171', marginTop: '0.5rem' }}>{planMsg}</p>
        )}
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.25rem' }}>
          Plan changes take effect on your next weekly renewal.
        </p>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive]               = useState('dashboard');
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [weather, setWeather]             = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [bellOpen, setBellOpen]           = useState(false);

  useEffect(() => {
    axios.get('https://coveer-backend.onrender.com/weather/current', { withCredentials: true })
      .then(res => setWeather(res.data))
      .catch(err => console.error('Weather fetch failed:', err))
      .finally(() => setWeatherLoading(false));
  }, []);

  // Fetch notifications on mount and poll every 60s
  useEffect(() => {
    const fetchNotifs = () => {
      axios.get('https://coveer-backend.onrender.com/notifications', { withCredentials: true })
        .then(res => {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.unreadCount);
        })
        .catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleBellOpen = async () => {
    setBellOpen(v => !v);
    if (!bellOpen && unreadCount > 0) {
      // Mark all read
      await axios.patch('https://coveer-backend.onrender.com/notifications/read-all', {}, { withCredentials: true }).catch(() => {});
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const notifIcon = (type) => {
    if (type === 'weather') return '🌦️';
    if (type === 'payout')  return '💰';
    if (type === 'debit')   return '💸';
    if (type === 'plan')    return '🛡️';
    return 'ℹ️';
  };

  const firstName    = user?.fullName?.firstName ?? '';
  const lastName     = user?.fullName?.lastName  ?? '';
  const city         = user?.city  ?? '';
  const plan         = user?.plan  ?? 'basic';
  const isAffected   = weather?.impact?.isAffected ?? false;
  const impactReason = weather?.impact?.reason ?? 'Normal';

  const { t } = useLanguage();
  const pageTitle = {
    dashboard: t('dashboard'), wallet: t('wallet'),
    coverage: t('coverage'), profile: t('profile'), settings: t('settings'),
  };

  const pages = {
    dashboard: <PageDashboard user={user} weather={weather} weatherLoading={weatherLoading} />,
    wallet:    <PageWallet    user={user} />,
    coverage:  <PageCoverage  user={user} />,
    profile:   <PageProfile   user={user} />,
    settings:  <PageSettings  user={user} />,
  };

  return (
    <div className="db-root">
      <aside className={`db-sidebar ${sidebarOpen ? 'db-sidebar--open' : ''}`}>
        <div className="db-sidebar-logo">
          <span className="db-logo-text">Coveer</span>
          <button className="db-sidebar-close" onClick={() => setSidebarOpen(false)}><X size={16} /></button>
        </div>
        <nav className="db-nav">
          <div className="db-nav-section-label">MAIN</div>
          {NAV.map(item => (
            <button key={item.id}
              className={`db-nav-item ${active === item.id ? 'db-nav-item--active' : ''}`}
              onClick={() => { setActive(item.id); setSidebarOpen(false); }}>
              <item.icon size={17} />
              <span>{item.label}</span>
              {active === item.id && <div className="db-nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="db-sidebar-footer">
          <div className="db-sidebar-user">
            <div className="db-sidebar-avatar">{firstName[0]}{lastName[0]}</div>
            <div className="db-sidebar-user-info">
              <span className="db-sidebar-user-name">{firstName}</span>
              <span className="db-sidebar-user-plan">{plan} · {city}</span>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="db-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="db-main">
        <header className="db-topbar">
          <div className="db-topbar-left">
            <button className="db-hamburger" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <h2 className="db-topbar-title">{pageTitle[active]}</h2>
          </div>
          <div className="db-topbar-right">
            <div className={`db-topbar-disruption ${isAffected ? '' : 'db-topbar-disruption--normal'}`}>
              <span className="db-disruption-dot" />
              {isAffected ? `${impactReason} · ${city}` : `Normal · ${city}`}
            </div>

            {/* Bell with dropdown */}
            <div className="db-bell-wrap">
              <button className="db-topbar-bell" onClick={handleBellOpen}>
                <Bell size={17} />
                {unreadCount > 0 && <span className="db-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>

              {bellOpen && (
                <>
                  <div className="db-bell-overlay" onClick={() => setBellOpen(false)} />
                  <div className="db-notif-dropdown">
                    <div className="db-notif-header">
                      <span>Notifications</span>
                      <button onClick={() => setBellOpen(false)}><X size={14} /></button>
                    </div>
                    <div className="db-notif-list">
                      {notifications.length === 0 ? (
                        <div className="db-notif-empty">No notifications yet</div>
                      ) : notifications.map((n, i) => (
                        <div key={i} className={`db-notif-item ${!n.read ? 'db-notif-item--unread' : ''}`}>
                          <span className="db-notif-emoji">{notifIcon(n.type)}</span>
                          <div className="db-notif-body">
                            <span className="db-notif-title">{n.title}</span>
                            <span className="db-notif-msg">{n.message}</span>
                            <span className="db-notif-time">
                              {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout */}
            <button
              className="db-topbar-logout"
              onClick={async () => { await logout(); navigate('/auth'); }}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <div className="db-content">{pages[active]}</div>
      </main>
    </div>
  );
}
