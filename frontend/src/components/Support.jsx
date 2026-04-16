import { useRef, useEffect, useState } from 'react';
import { MessageSquare, Mail, Phone } from 'lucide-react';
import './Support.css';

const CARDS = [
  {
    icon: MessageSquare,
    label: 'Live Chat',
    desc: 'Instant help via live chat, with faster responses for Premium members.',
    btn: 'Chat with us',
    contacts: [
      { type: 'chat', value: 'Start chat' },
    ],
    href: null,
  },
  {
    icon: Mail,
    label: 'Email Support',
    desc: "Reach out for more detailed inquiries, and we'll get back to you within 24 hours.",
    btn: 'Write us',
    contacts: [
      { type: 'email', value: 'support@coveer.in' },
    ],
    href: 'mailto:support@coveer.in',
  },
  {
    icon: Phone,
    label: 'Phone Support',
    desc: 'For Premium users, available Mon–Fri, 9 AM – 6 PM for urgent assistance.',
    btn: 'Call us',
    contacts: [
      { type: 'phone', value: '+91 98765 43210' },
    ],
    href: 'tel:+919876543210',
  },
];

function SupportCard({ card }) {
  const [active, setActive] = useState(false);
  const Icon = card.icon;

  return (
    <div
      className={`sp-card-stack ${active ? 'sp-active' : ''}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      {/* Bottom accent — revealed on hover */}
      <div className="sp-card-bottom">
        <div className="sp-card-bottom-content">
          {card.contacts.map((c, i) => (
            <div key={i} className="sp-contact-item">
              {c.type === 'email' && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(168,170,204,0.8)" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              )}
              {c.type === 'phone' && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(168,170,204,0.8)" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 10a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 7.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 15.92z"/>
                </svg>
              )}
              {c.type === 'chat' && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(168,170,204,0.8)" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              )}
              <span>{c.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main card */}
      <div className="sp-card-top">
        <div className="sp-icon-box">
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <p className="sp-card-label">{card.label}</p>
        <p className="sp-card-desc">{card.desc}</p>
        {card.href ? (
          <a href={card.href} className="sp-card-btn">{card.btn}</a>
        ) : (
          <button className="sp-card-btn">{card.btn}</button>
        )}
      </div>
    </div>
  );
}

export function Support() {
  const sectionRef = useRef(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="sp-section" ref={sectionRef} id="support">

      <h2 className="sp-headline">
        We're here when<br />you need <span className="sp-gradient">help</span>.
      </h2>
      <p className="sp-sub">
        No forms. No waiting. Just real support when things go wrong.
      </p>

      <div className={`sp-grid ${animated ? 'sp-visible' : ''}`}>
        {CARDS.map((card, i) => (
          <SupportCard key={i} card={card} />
        ))}
      </div>

    </section>
  );
}
