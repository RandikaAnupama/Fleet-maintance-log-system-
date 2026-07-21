export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h2 className="mb-1">{title}</h2>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
