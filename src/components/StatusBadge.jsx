export default function StatusBadge({ value }) {
  const normalized = String(value || "").toUpperCase();
  const style =
    ["ACTIVE", "COMPLETED", "RESOLVED"].includes(normalized) ? "success" :
    ["PENDING", "UPCOMING", "SERVICE_DUE", "OPEN"].includes(normalized) ? "warning" :
    ["INACTIVE", "CANCELLED", "HIGH"].includes(normalized) ? "danger" : "secondary";

  return <span className={`badge text-bg-${style}`}>{normalized.replaceAll("_", " ")}</span>;
}
