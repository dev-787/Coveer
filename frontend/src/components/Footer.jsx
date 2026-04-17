import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const NAV_LINKS = ['Home', 'Features', 'Pricing', 'Support'];

const LEGAL_CONTENT = {
  'Terms & Conditions': {
    title: 'Terms & Conditions',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: 'By accessing or using Coveer, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the platform.',
      },
      {
        heading: '2. Eligibility',
        body: 'Coveer is available to gig workers aged 18 and above who are actively working on supported delivery platforms (Swiggy, Zomato, Blinkit, Zepto, Flipkart, Amazon). You must complete identity verification before accessing wallet and payout features.',
      },
      {
        heading: '3. Coverage & Payouts',
        body: 'Payouts are triggered automatically based on real-time weather and disruption data for your registered city. Payout amounts depend on your active plan and the severity of the disruption. Coveer does not guarantee earnings — payouts are subject to verified disruption conditions.',
      },
      {
        heading: '4. Wallet & Payments',
        body: 'Funds added to your Coveer wallet are used to activate and renew your coverage plan. Withdrawals are processed to your registered UPI ID. Coveer is not responsible for delays caused by third-party payment processors.',
      },
      {
        heading: '5. Fair Use',
        body: 'Any attempt to manipulate disruption data, submit false claims, or abuse the payout system will result in immediate account suspension and forfeiture of wallet balance.',
      },
      {
        heading: '6. Changes to Terms',
        body: 'Coveer reserves the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms.',
      },
    ],
  },
  'Privacy Policy': {
    title: 'Privacy Policy',
    sections: [
      {
        heading: '1. Data We Collect',
        body: 'We collect your name, phone number, city, platform affiliation, and identity documents (for KYC). We also collect usage data such as login activity and payout history.',
      },
      {
        heading: '2. How We Use Your Data',
        body: 'Your data is used to verify your identity, calculate payout eligibility, process payments, and improve the Coveer platform. We do not sell your personal data to third parties.',
      },
      {
        heading: '3. Data Storage',
        body: 'Your data is stored securely on encrypted servers. Identity documents are processed for verification and are not stored beyond what is legally required.',
      },
      {
        heading: '4. Third-Party Services',
        body: 'Coveer uses Razorpay for payment processing and ImageKit for document handling. These services have their own privacy policies and data practices.',
      },
      {
        heading: '5. Your Rights',
        body: 'You may request access to, correction of, or deletion of your personal data by contacting our support team. Account deletion will remove your data within 30 days, subject to legal retention requirements.',
      },
      {
        heading: '6. Contact',
        body: 'For any privacy-related queries, reach us at support@coveer.in.',
      },
    ],
  },
};

function LegalModal({ title, sections, onClose }) {
  return (
    <div className="ft-modal-overlay" onClick={onClose}>
      <div className="ft-modal" onClick={e => e.stopPropagation()}>
        <div className="ft-modal-header">
          <h2 className="ft-modal-title">{title}</h2>
          <button className="ft-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="ft-modal-body">
          {sections.map(s => (
            <div key={s.heading} className="ft-modal-section">
              <h3 className="ft-modal-section-heading">{s.heading}</h3>
              <p className="ft-modal-section-body">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <footer className="ft-footer">

      {/* Legal modal */}
      {activeModal && (
        <LegalModal
          title={LEGAL_CONTENT[activeModal].title}
          sections={LEGAL_CONTENT[activeModal].sections}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Headline */}
      <h2 className="ft-headline">
        Protect your income —<br />
        <span className="ft-gradient">automatically</span>.
      </h2>

      {/* Nav links */}
      <nav className="ft-nav">
        {NAV_LINKS.map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} className="ft-nav-link">{l}</a>
        ))}
        <Link to="/auth/start" className="ft-nav-link">Get Started</Link>
      </nav>

      {/* Legal + social row */}
      <div className="ft-bottom-row">
        {Object.keys(LEGAL_CONTENT).map(l => (
          <button key={l} className="ft-legal-link" onClick={() => setActiveModal(l)}>{l}</button>
        ))}

        {/* Social icons */}
        <div className="ft-socials">
          <a href="#" className="ft-social" aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
            </svg>
          </a>
          <a href="#" className="ft-social" aria-label="Twitter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="#" className="ft-social" aria-label="LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        </div>
      </div>

      {/* Watermark brand name */}
      <div className="ft-watermark" aria-hidden="true">Coveer</div>

      {/* Copyright */}
      <p className="ft-copy">© {new Date().getFullYear()} Coveer. All rights reserved.</p>

    </footer>
  );
}
