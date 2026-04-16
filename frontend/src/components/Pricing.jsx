import { useState, useRef, useEffect } from 'react';
import { Check, ArrowRight, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Pricing.css';

// ── Pricing logic ─────────────────────────────────────────────────────────────
// Earnings range we care about: ₹300/day (low) → ₹2000/day (high)
// Basic:   price ₹20–₹30,  maxPayout ₹300–₹600
// Premium: price ₹40–₹50,  maxPayout ₹600–₹1000
const EARN_MIN = 300;
const EARN_MAX = 2000;

function lerp(min, max, t) {
  return Math.round(min + (max - min) * Math.min(Math.max(t, 0), 1));
}

function calcPlan(earnings, type) {
  const e = Math.max(0, Number(earnings) || 0);
  const t = e === 0 ? 0 : (e - EARN_MIN) / (EARN_MAX - EARN_MIN);

  if (type === 'basic') {
    const price     = e === 0 ? 25 : lerp(20, 30, t);
    const maxPayout = e === 0 ? 600 : lerp(300, 600, t);
    return { price, maxPayout, hourly: Math.round(maxPayout / 8) };
  }

  const price     = e === 0 ? 40 : lerp(40, 50, t);
  const maxPayout = e === 0 ? 1000 : lerp(600, 1000, t);
  return { price, maxPayout, hourly: Math.round(maxPayout / 8) };
}

const BASIC_FEATURES = [
  'Weather & AQI protection',
  'Daily 10 PM automatic payout',
  'Hourly disruption tracking',
  'UPI withdrawal anytime',
];

const PREMIUM_FEATURES = [
  'Everything in Basic',
  'Priority payouts',
  'Curfew & disruption cover',
  'Higher payout cap',
  'Dedicated support',
];

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(n);
}

export function Pricing() {
  const [earnings, setEarnings] = useState('');
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef(null);
  const navigate   = useNavigate();

  const val      = Number(earnings);
  const hasInput = earnings !== '' && val > 0;
  const tooLow   = hasInput && val < EARN_MIN;
  const tooHigh  = hasInput && val > EARN_MAX;
  const outOfRange = tooLow || tooHigh;

  const basic   = calcPlan(earnings, 'basic');
  const premium = calcPlan(earnings, 'premium');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="pr-section" ref={sectionRef}>

      {/* Headline */}
      <h2 className="pr-headline">
        Simple, honest <span className="pr-gradient">pricing</span>.
      </h2>
      <p className="pr-sub">
        Enter your daily earnings to see your personalised plan and payout.
      </p>

      {/* Cards grid */}
      <div className={`pr-grid ${animated ? 'pr-visible' : ''}`}>

        {/* ── LEFT — info card with input ── */}
        <div className="pr-card pr-card--info">
          <div>
            <p className="pr-card-eyebrow">Calculate your plan</p>
            <h3 className="pr-card-title">Your earnings,<br />your payout.</h3>
            <p className="pr-card-body">
              Tell us what you earn daily. We calculate your maximum payout based on that — so you're always covered proportionally.
            </p>

            {/* Earnings input inside card */}
            <div className={`pr-input-wrap ${outOfRange ? 'pr-input-wrap--error' : ''}`}>
              <span className="pr-input-prefix">₹</span>
              <input
                className="pr-input"
                type="number"
                min="0"
                placeholder="e.g. 800"
                value={earnings}
                onChange={e => setEarnings(e.target.value)}
              />
              <span className="pr-input-suffix">/day</span>
            </div>
            {tooLow && (
              <p className="pr-input-error">
                We cover earnings from ₹{fmt(EARN_MIN)}/day and above.
              </p>
            )}
            {tooHigh && (
              <p className="pr-input-error">
                Our plans are designed for earnings up to ₹{fmt(EARN_MAX)}/day.
              </p>
            )}
            {hasInput && !outOfRange && (
              <p className="pr-input-hint">
                Based on ₹{fmt(val)}/day earnings
              </p>
            )}
          </div>

          <div className="pr-stat-row">
            <div className="pr-stat">
              <span className="pr-stat-value">0</span>
              <span className="pr-stat-label">Claims ever</span>
            </div>
            <div className="pr-stat-divider" />
            <div className="pr-stat">
              <span className="pr-stat-value">10 PM</span>
              <span className="pr-stat-label">Daily payout</span>
            </div>
            <div className="pr-stat-divider" />
            <div className="pr-stat">
              <span className="pr-stat-value">1hr</span>
              <span className="pr-stat-label">Tracking interval</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT column — Basic + Premium stacked ── */}
        <div className="pr-right-col">

          {/* Basic */}
          <div className="pr-card pr-card--basic">
            <div className="pr-card-top">
              <div className="pr-plan-meta">
                <Shield size={14} className="pr-plan-icon" />
                <span className="pr-plan-name">Basic</span>
              </div>
              <div className="pr-price-block">
                <span className="pr-price">₹{fmt(basic.price)}</span>
                <span className="pr-price-period">/week</span>
              </div>
            </div>
            <div className="pr-payout-inline">
              <div className="pr-payout-pill">
                <span className="pr-payout-label">Max/day</span>
                <span className={`pr-payout-value ${hasInput && !outOfRange ? 'pr-payout-value--live' : ''}`}>₹{fmt(basic.maxPayout)}</span>
              </div>
              <div className="pr-payout-sep" />
              <div className="pr-payout-pill">
                <span className="pr-payout-label">Per hour</span>
                <span className={`pr-payout-value ${hasInput && !outOfRange ? 'pr-payout-value--live' : ''}`}>₹{fmt(basic.hourly)}</span>
              </div>
            </div>
            <ul className="pr-features">
              {BASIC_FEATURES.map((f, i) => (
                <li key={i} className="pr-feature">
                  <span className="pr-check"><Check size={11} strokeWidth={2.5} /></span>
                  {f}
                </li>
              ))}
            </ul>
            <button className="pr-btn pr-btn--ghost" onClick={() => navigate('/auth/start')}>
              Get Basic <ArrowRight size={14} />
            </button>
          </div>

          {/* Premium */}
          <div className="pr-card pr-card--premium">
            <div className="pr-recommended">Recommended</div>
            <div className="pr-card-top">
              <div className="pr-plan-meta">
                <Zap size={14} className="pr-plan-icon" />
                <span className="pr-plan-name">Premium</span>
              </div>
              <div className="pr-price-block">
                <span className="pr-price">₹{fmt(premium.price)}</span>
                <span className="pr-price-period">/week</span>
              </div>
            </div>
            <div className="pr-payout-inline">
              <div className="pr-payout-pill">
                <span className="pr-payout-label">Max/day</span>
                <span className={`pr-payout-value ${hasInput && !outOfRange ? 'pr-payout-value--live' : ''}`}>₹{fmt(premium.maxPayout)}</span>
              </div>
              <div className="pr-payout-sep" />
              <div className="pr-payout-pill">
                <span className="pr-payout-label">Per hour</span>
                <span className={`pr-payout-value ${hasInput && !outOfRange ? 'pr-payout-value--live' : ''}`}>₹{fmt(premium.hourly)}</span>
              </div>
            </div>
            <ul className="pr-features">
              {PREMIUM_FEATURES.map((f, i) => (
                <li key={i} className="pr-feature">
                  <span className="pr-check pr-check--premium"><Check size={11} strokeWidth={2.5} /></span>
                  {f}
                </li>
              ))}
            </ul>
            <button className="pr-btn pr-btn--primary" onClick={() => navigate('/auth/start')}>
              Get Premium <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
