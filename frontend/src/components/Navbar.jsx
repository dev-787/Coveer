import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import './Navbar.css';

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function smoothScrollTo(targetY, duration = 700) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * easeOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function handleNavClick(e, id) {
  e.preventDefault();
  const target = document.getElementById(id);
  if (!target) return;
  const targetY = target.getBoundingClientRect().top + window.scrollY - 80;
  const distance = Math.abs(targetY - window.scrollY);
  // Scale duration: 500ms nearby, up to 900ms far away
  const duration = Math.min(500 + distance * 0.12, 900);
  smoothScrollTo(targetY, duration);
}

export function Navbar() {
  const { user } = useAuth();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 80);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar-wrapper ${hidden ? 'navbar-wrapper--hidden' : ''}`}>
      <div className="navbar">

        <div className="navbar-logo">
          <span className="navbar-logo-text">Coveer</span>
        </div>

        <ul className="navbar-links">
          {['Features', 'Pricing', 'Support'].map((label) => (
            <li key={label}>
              <a
                href={`#${label.toLowerCase()}`}
                className="navbar-link"
                onClick={(e) => handleNavClick(e, label.toLowerCase())}
              >
                <span className="navbar-link-inner">
                  <span className="navbar-link-top">{label}</span>
                  <span className="navbar-link-bottom">{label}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <Link to={user ? '/dashboard' : '/auth'} className="navbar-cta-link">
          <button className="navbar-cta">
            <span className="navbar-cta-arrow-enter">
              <ArrowRight className="navbar-cta-icon" />
            </span>
            <span className="navbar-cta-arrow-wrap">
              <span className="navbar-cta-arrow-exit">
                <ArrowRight className="navbar-cta-icon" />
              </span>
              {user ? 'Dashboard' : 'Get Started'}
            </span>
          </button>
        </Link>

      </div>
    </nav>
  );
}