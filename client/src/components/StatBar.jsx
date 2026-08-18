export default function StatBar({ label, value }) {
  const display = value === null || value === undefined ? "—" : `${value}%`;
  const width = value === null || value === undefined ? 0 : value;
  return (
    <div className="stat-row">
      <div className="stat-label">{label}</div>
      <div className="stat-track">
        <div className="stat-fill" style={{ width: `${width}%` }} />
      </div>
      <div className="stat-value mono">{display}</div>
    </div>
  );
}
