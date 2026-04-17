export default function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="admin-empty-state">
      {Icon && (
        <div className="admin-empty-icon">
          <Icon size={36} />
        </div>
      )}
      <div className="admin-empty-title">{title}</div>
      {message && <div className="admin-empty-message">{message}</div>}
    </div>
  );
}
