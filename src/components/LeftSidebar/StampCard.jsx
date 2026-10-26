export default function StampCard({ thumb, label, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      className="stamp-card"
      onClick={onClick}
      aria-label={ariaLabel || `Apply ${label} stamp`}
    >
      <span className="stamp-card-art">
        {thumb ? (
          <img src={thumb} alt="" />
        ) : (
          <span className="h-3 w-3 animate-pulse" style={{ background: "var(--border)" }} />
        )}
      </span>
      <span className="stamp-card-name">{label}</span>
    </button>
  );
}
