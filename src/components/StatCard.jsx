export default function StatCard({ title, value, icon, note }) {
  return (
    <div className="card stat-card h-100">
      <div className="card-body d-flex align-items-center gap-3">
        <div className="stat-icon"><i className={`bi ${icon}`}></i></div>
        <div>
          <p className="text-muted mb-1">{title}</p>
          <h3 className="mb-0">{value}</h3>
          {note && <small className="text-muted">{note}</small>}
        </div>
      </div>
    </div>
  );
}
