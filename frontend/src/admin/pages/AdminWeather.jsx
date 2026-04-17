import { useEffect, useState } from 'react';
import { Cloud } from 'lucide-react';
import adminApi from '../api/adminApi';
import EmptyState from '../components/EmptyState';

const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = d => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

function impactBadge(pct, isAffected) {
  if (!isAffected) return <span className="admin-badge admin-badge--green">Normal</span>;
  if (pct >= 60)   return <span className="admin-badge admin-badge--red">High</span>;
  if (pct >= 30)   return <span className="admin-badge admin-badge--amber">Medium</span>;
  return <span className="admin-badge admin-badge--amber">Low</span>;
}

export default function AdminWeather() {
  const [data, setData]       = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.get('/weather'),
      adminApi.get('/weather/summary'),
    ])
      .then(([w, s]) => { setData(w.data); setSummary(s.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Summary */}
      {summary && (
        <div className="admin-grid-4" style={{ marginBottom: '1.5rem' }}>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{summary.citiesAffected}</div>
            <div className="admin-stat-label">Cities Affected</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{summary.avgImpact}%</div>
            <div className="admin-stat-label">Avg Impact</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{summary.totalToday}</div>
            <div className="admin-stat-label">Fetched Today</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{data.length}</div>
            <div className="admin-stat-label">Total Cities</div>
          </div>
        </div>
      )}

      {/* City Cards */}
      <div className="admin-section-title">City Snapshots</div>
      <div className="admin-grid-5" style={{ marginBottom: '1.5rem' }}>
        {loading ? (
          [...Array(10)].map((_, i) => (
            <div key={i} className="admin-city-card">
              <div className="admin-skeleton" style={{ width: '60%', height: 16, marginBottom: '0.5rem' }} />
              <div className="admin-skeleton" style={{ width: '80%', height: 12, marginBottom: '0.3rem' }} />
              <div className="admin-skeleton" style={{ width: '70%', height: 12 }} />
            </div>
          ))
        ) : data.length === 0 ? (
          <div style={{ gridColumn: '1/-1' }}>
            <EmptyState icon={Cloud} title="No weather data" message="Weather data will appear here once fetched" />
          </div>
        ) : (
          data.map(w => (
            <div key={w._id} className={`admin-city-card${w.isAffected ? ' admin-city-card--affected' : ''}`}>
              <div className="admin-city-name">{w.city}</div>
              <div style={{ marginBottom: '0.5rem' }}>{impactBadge(w.impactPercentage, w.isAffected)}</div>
              <div className="admin-city-stats">
                <div className="admin-city-stat">🌡 <span>{w.temperature}°C</span></div>
                <div className="admin-city-stat">🌧 <span>{w.rainfall} mm</span></div>
                <div className="admin-city-stat">💨 <span>AQI {w.aqi}</span></div>
                <div className="admin-city-stat" style={{ marginTop: '0.3rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>
                  {fmtTime(w.fetchedAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full Table */}
      <div className="admin-panel" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="admin-panel-title">All Weather Data</div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>City</th>
                <th>Temp</th>
                <th>Rainfall</th>
                <th>Wind</th>
                <th>Humidity</th>
                <th>AQI</th>
                <th>Impact %</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Fetched</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(10)].map((_, j) => (
                      <td key={j}><span className="admin-skeleton" style={{ width: '70%', height: 14, display: 'block' }} /></td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr><td colSpan={10}><EmptyState icon={Cloud} title="No data" /></td></tr>
              ) : (
                [...data].sort((a, b) => new Date(b.fetchedAt) - new Date(a.fetchedAt)).map(w => (
                  <tr key={w._id}>
                    <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{w.city}</td>
                    <td>{w.temperature}°C</td>
                    <td>{w.rainfall} mm</td>
                    <td>{w.windSpeed} m/s</td>
                    <td>{w.humidity}%</td>
                    <td>{w.aqi} <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>({w.aqiCategory})</span></td>
                    <td>{w.impactPercentage}%</td>
                    <td>{impactBadge(w.impactPercentage, w.isAffected)}</td>
                    <td style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', maxWidth: 180 }}>{w.impactReason || '—'}</td>
                    <td style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                      {fmtDate(w.fetchedAt)} {fmtTime(w.fetchedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
