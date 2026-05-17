import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [focused, setFocused]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate  = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('https://coveer-backend.onrender.com/auth/login', {
        email:    formData.email,
        password: formData.password,
      }, { withCredentials: true });

      if (res.status === 200) {
        // Fetch full user profile and update context so ProtectedRoute sees the user
        const meRes = await axios.get('https://coveer-backend.onrender.com/auth/me', { withCredentials: true });
        setUser(meRes.data);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-glow" />

      <div className="auth-card">

        <div className="auth-brand">
          <p className="auth-brand-sub">Log in to</p>
          <h1 className="auth-brand-name">Coveer</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className={`auth-input-wrap ${focused === 'email' ? 'focused' : ''}`}>
            <Mail className="auth-input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="auth-input"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className={`auth-input-wrap ${focused === 'password' ? 'focused' : ''}`}>
            <Lock className="auth-input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="auth-input"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            <span className="auth-btn-arrow-enter">
              <ArrowRight className="auth-btn-icon" />
            </span>
            <span className="auth-btn-arrow-wrap">
              <span className="auth-btn-arrow-exit">
                <ArrowRight className="auth-btn-icon" />
              </span>
              {loading ? 'Logging in…' : 'Log in'}
            </span>
          </button>
        </form>

        <div className="auth-separator" />

        <button className="auth-link-btn" onClick={() => navigate('/auth/start')}>
          Create Account
        </button>

        <p className="auth-footnote">Forgotten your password?</p>
      </div>
    </div>
  );
}

export default Login;
