import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import adminApi from '../api/adminApi';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'];

function Toast({ toasts }) {
  return (
    <div className="admin-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`admin-toast admin-toast--${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}

export default function UserEditModal({ userId, onClose, onSaved }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toasts, setToasts]   = useState([]);
  const [form, setForm]       = useState({
    city: '', plan: 'basic', planStatus: 'inactive',
    dailyEarnings: 0, autoRenew: true, trustScore: 100,
    verificationStatus: 'pending',
  });

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };

  useEffect(() => {
    adminApi.get(`/users/${userId}`)
      .then(r => {
        setUser(r.data);
        setForm({
          city:               r.data.city               || '',
          plan:               r.data.plan               || 'basic',
          planStatus:         r.data.planStatus         || 'inactive',
          dailyEarnings:      r.data.dailyEarnings      || 0,
          autoRenew:          r.data.autoRenew          ?? true,
          trustScore:         r.data.trustScore         ?? 100,
          verificationStatus: r.data.verificationStatus || 'pending',
        });
      })
      .catch(() => addToast('Failed to load user', 'error'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.patch(`/users/${userId}`, form);
      addToast('User updated successfully');
      onSaved();
    } catch {
      addToast('Failed to update user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const logs = user?.adminLogs?.slice(-5).reverse() || [];

  return (
    <>
      <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="admin-modal">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div className="admin-modal-title">
              Edit User
              {user && <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400, fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                {user.fullName?.firstName} {user.fullName?.lastName}
              </span>}
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
              <X size={18} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* City */}
              <div className="admin-form-row">
                <label className="admin-form-label">City</label>
                <select
                  className="admin-select"
                  style={{ width: '100%' }}
                  value={form.city}
                  onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                >
                  {CITIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                </select>
              </div>

              {/* Plan */}
              <div className="admin-form-row">
                <label className="admin-form-label">Plan</label>
                <div className="admin-radio-group">
                  {['basic', 'premium'].map(p => (
                    <div
                      key={p}
                      className={`admin-radio-option${form.plan === p ? ' selected' : ''}`}
                      onClick={() => setForm(prev => ({ ...prev, plan: p }))}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan Status */}
              <div className="admin-form-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="admin-form-label" style={{ marginBottom: 0 }}>Plan Active</label>
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={form.planStatus === 'active'}
                    onChange={e => setForm(p => ({ ...p, planStatus: e.target.checked ? 'active' : 'inactive' }))}
                  />
                  <span className="admin-toggle-slider" />
                </label>
              </div>

              {/* Verification Status */}
              <div className="admin-form-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <label className="admin-form-label" style={{ marginBottom: 0 }}>Identity Verified</label>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>
                    {form.verificationStatus === 'verified' ? 'User can access wallet & payouts' : 'Wallet & payouts locked'}
                  </div>
                </div>
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={form.verificationStatus === 'verified'}
                    onChange={e => setForm(p => ({ ...p, verificationStatus: e.target.checked ? 'verified' : 'pending' }))}
                  />
                  <span className="admin-toggle-slider" />
                </label>
              </div>

              {/* Rejection reason */}
              {form.verificationStatus === 'rejected' && (
                <div className="admin-form-row">
                  <label className="admin-form-label">Rejection Reason</label>
                  <input type="text" className="admin-input" style={{ width: '100%' }}
                    placeholder="e.g. Document unclear, name mismatch..."
                    value={form.verificationRejectionReason || ''}
                    onChange={e => setForm(p => ({ ...p, verificationRejectionReason: e.target.value }))} />
                </div>
              )}

              {/* Uploaded documents */}
              <div className="admin-form-row">
                <label className="admin-form-label">Uploaded Documents</label>
                {user?.verificationDocuments?.identityProof || user?.verificationDocuments?.platformProof ? (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {user.verificationDocuments.identityProof && (
                      <a href={user.verificationDocuments.identityProof} target="_blank" rel="noreferrer"
                        style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <img src={user.verificationDocuments.identityProof} alt="Identity"
                          style={{ width: 140, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                        <span style={{ fontSize: '0.68rem', color: 'rgba(123,121,196,0.8)', textAlign: 'center' }}>Identity Proof ↗</span>
                      </a>
                    )}
                    {user.verificationDocuments.platformProof && (
                      <a href={user.verificationDocuments.platformProof} target="_blank" rel="noreferrer"
                        style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <img src={user.verificationDocuments.platformProof} alt="Platform"
                          style={{ width: 140, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                        <span style={{ fontSize: '0.68rem', color: 'rgba(123,121,196,0.8)', textAlign: 'center' }}>Platform Proof ↗</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)', margin: '0.25rem 0 0' }}>No documents submitted yet.</p>
                )}
              </div>

              {/* Daily Earnings */}
              <div className="admin-form-row">
                <label className="admin-form-label">Daily Earnings (₹)</label>
                <input
                  type="number"
                  className="admin-input"
                  style={{ width: '100%' }}
                  value={form.dailyEarnings}
                  min={100}
                  onChange={e => setForm(p => ({ ...p, dailyEarnings: Number(e.target.value) }))}
                />
              </div>

              {/* Auto Renew */}
              <div className="admin-form-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="admin-form-label" style={{ marginBottom: 0 }}>Auto Renew</label>
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={form.autoRenew}
                    onChange={e => setForm(p => ({ ...p, autoRenew: e.target.checked }))}
                  />
                  <span className="admin-toggle-slider" />
                </label>
              </div>

              {/* Trust Score */}
              <div className="admin-form-row">
                <label className="admin-form-label">Trust Score: {form.trustScore}</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.trustScore}
                  onChange={e => setForm(p => ({ ...p, trustScore: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#7b79c4' }}
                />
              </div>

              <div className="admin-form-actions">
                <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Admin Logs */}
          {logs.length > 0 && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
              <div className="admin-section-title">Recent Changes</div>
              {logs.map((log, i) => (
                <div key={i} className="admin-log-entry">
                  <span className="admin-log-field">{log.field}</span>
                  {' '}changed from{' '}
                  <span style={{ color: 'rgba(220,70,70,0.8)' }}>{String(log.oldValue)}</span>
                  {' '}to{' '}
                  <span style={{ color: 'rgba(80,200,120,0.8)' }}>{String(log.newValue)}</span>
                  <span style={{ float: 'right', fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)' }}>
                    {new Date(log.changedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Toast toasts={toasts} />
    </>
  );
}
