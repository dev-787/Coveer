import './SectionPill.css';

export function SectionPill({ label }) {
  return (
    <div className="sp-pill">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="sp-pill-icon">
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <circle cx="12" cy="4"  r="1.5" fill="currentColor" opacity="0.5"/>
        <circle cx="12" cy="20" r="1.5" fill="currentColor" opacity="0.5"/>
        <circle cx="4"  cy="12" r="1.5" fill="currentColor" opacity="0.5"/>
        <circle cx="20" cy="12" r="1.5" fill="currentColor" opacity="0.5"/>
        <circle cx="6.3"  cy="6.3"  r="1.2" fill="currentColor" opacity="0.3"/>
        <circle cx="17.7" cy="6.3"  r="1.2" fill="currentColor" opacity="0.3"/>
        <circle cx="6.3"  cy="17.7" r="1.2" fill="currentColor" opacity="0.3"/>
        <circle cx="17.7" cy="17.7" r="1.2" fill="currentColor" opacity="0.3"/>
      </svg>
      <span>{label}</span>
    </div>
  );
}
