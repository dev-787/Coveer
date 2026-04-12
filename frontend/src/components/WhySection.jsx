import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import './WhySection.css';

const COVEER_FEATURES = [
  'Zero claims — ever',
  'Hourly disruption tracking',
  'Automatic 10 PM payout',
  'AI-verified identity system',
  'Fraud-protected wallet',
  '₹25/week — less than a chai a day',
];

const OTHERS_FEATURES = [
  'File a claim and wait weeks',
  'Prove your loss with documents',
  'Office visits and phone calls',
  'No hourly tracking exists',
  'Rain? Not covered. Heat? Not covered.',
  'Expensive premiums, limited payout',
];

export const WhySection = () => {
  const sectionRef = useRef(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="ws-section" ref={sectionRef}>

      {/* Ambient glow behind left card */}
      <div className="ws-glow" />

      {/* Headline */}
      <h2 className="ws-headline">
        Why gig workers<br />
        choose <span className="ws-gradient">Coveer</span>.
      </h2>
      <p className="ws-sub">
        No forms. No calls. No waiting. Just automatic protection.
      </p>

      {/* Cards wrapper */}
      <div className={`ws-wrapper ${animated ? 'ws-visible' : ''}`}>

        {/* ── LEFT CARD — Coveer ── */}
        <div className="ws-card ws-card--left">

          {/* Header */}
          <div className="ws-card-header ws-card-header--center">
            <span className="ws-brand">Coveer</span>
          </div>

          {/* Divider */}
          <div className="ws-divider" />

          {/* Features list */}
          <ul className="ws-list">
            {COVEER_FEATURES.map((f, i) => (
              <li key={i} className="ws-item" style={{ '--i': i }}>
                <span className="ws-check">
                  <Check size={13} strokeWidth={2.5} />
                </span>
                <span className="ws-item-text">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── V/S connector ── */}
        <div className="ws-vs">
          <div className="ws-vs-badge">V/S</div>
          <svg className="ws-vs-svg" viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* short stem down */}
            <line x1="40" y1="0" x2="40" y2="16" stroke="url(#vsGrad)" strokeWidth="1.5"/>
            {/* left branch */}
            <path d="M40 16 Q40 48 16 48 L4 48" stroke="url(#vsGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            {/* right branch */}
            <path d="M40 16 Q40 48 64 48 L76 48" stroke="url(#vsGradDim)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            {/* left dot — hollow */}
            <circle cx="4" cy="48" r="4" stroke="url(#vsGrad)" strokeWidth="1.5" fill="transparent"/>
            {/* right dot — filled */}
            <circle cx="76" cy="48" r="4" fill="rgba(90,87,176,0.55)"/>
            <defs>
              <linearGradient id="vsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7b79c4" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#7b79c4" stopOpacity="0.5"/>
              </linearGradient>
              <linearGradient id="vsGradDim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7b79c4" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#7b79c4" stopOpacity="0.15"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ── RIGHT CARD — Others ── */}
        <div className="ws-card ws-card--right">

          <div className="ws-card-header ws-card-header--center">
            <span className="ws-others">Others</span>
          </div>

          <div className="ws-divider" />

          <ul className="ws-list">
            {OTHERS_FEATURES.map((f, i) => (
              <li key={i} className="ws-item ws-item--dim">
                <span className="ws-circle" />
                <span className="ws-item-text">{f}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
};