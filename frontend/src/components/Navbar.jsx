import { ArrowRight } from 'lucide-react';
import './Navbar.css';

export function Navbar() {
  return (
    <nav className="navbar-wrapper">
      <div className="navbar">

        {/* Logo */}
        <div className="navbar-logo">
          <span className="navbar-logo-text">Coveer</span>
        </div>

        {/* Nav links */}
        <ul className="navbar-links">
          {['Features', 'Pricing', 'Support'].map((label) => (
            <li key={label}>
              <a href={`#${label.toLowerCase()}`} className="navbar-link">
                <span className="navbar-link-inner">
                  <span className="navbar-link-top">{label}</span>
                  <span className="navbar-link-bottom">{label}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button className="navbar-cta">
          {/* Arrow entering from left */}
          <span className="navbar-cta-arrow-enter">
            <ArrowRight className="navbar-cta-icon" />
          </span>

          {/* Text + arrow exiting right */}
          <span className="navbar-cta-arrow-wrap">
            <span className="navbar-cta-arrow-exit">
              <ArrowRight className="navbar-cta-icon" />
            </span>
            Get Started
          </span>
        </button>

      </div>
    </nav>
  );
}