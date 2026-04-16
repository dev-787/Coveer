import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import './Navbar.css';

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
              <a href={`#${label.toLowerCase()}`} className="navbar-link">
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