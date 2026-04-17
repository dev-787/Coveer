import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import adminApi from '../api/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../styles/admin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAdmin } = useAdminAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminApi.post('/auth/login', { email, password });
      setAdmin(res.data);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Bricolage Grotesque', sans-serif",
      position: 'relative',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(123,121,196,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: '#111116',
        border: '1px solid rgba(123,121,196,0.2)',
        borderRadius: 20,
        padding: '2.5rem',
        width: 400,
        maxWidth: '90vw',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #fff 0%, #a8aacc 50%, #7b79c4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em',
            }}>
              Coveer
            </span>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '-0.03em',
            }}>
              Admin
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            Restricted access — authorised personnel only
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: '0.4rem',
            }}>
              Email
            </label>
            <input
              type="email"
              className="admin-input"
              style={{ width: '100%' }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: '0.4rem',
            }}>
              Password
            </label>
            <input
              type="password"
              className="admin-input"
              style={{ width: '100%' }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(220,70,70,0.1)',
              border: '1px solid rgba(220,70,70,0.2)',
              borderRadius: 8,
              padding: '0.6rem 0.9rem',
              fontSize: '0.78rem',
              color: 'rgba(220,70,70,0.9)',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 10,
              border: 'none',
              background: '#fff',
              color: '#0a0a0a',
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Lock size={16} />
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
