export default function StatCard({ icon: Icon, value, label, trend, accent }) {
  return (
    <div className={`admin-stat-card${accent ? ' admin-stat-card--accent' : ''}`}>
      {trend !== undefined && (
        <span className={`admin-stat-trend admin-stat-trend--${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
      {Icon && (
        <div className="admin-stat-icon">
          <Icon size={18} />
        </div>
      )}
      <div className="admin-stat-value">{value ?? '—'}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  );
}
