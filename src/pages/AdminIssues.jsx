import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { useIssues } from "../context/IssueContext";

export default function AdminIssues() {
  const { issues, updateIssueStatus } = useIssues();
  const [filter, setFilter] = useState("ALL");

  const rows = useMemo(() => {
    if (filter === "ALL") return issues;
    return issues.filter((issue) => issue.status === filter);
  }, [issues, filter]);

  const columns = [
    { key: "vehicle", label: "Vehicle" },
    { key: "title", label: "Issue" },
    { key: "description", label: "Description" },
    { key: "reportedBy", label: "Reported By", render: (row) => row.reportedBy || "Kamal Perera" },
    { key: "date", label: "Reported Date" },
    { key: "priority", label: "Priority", render: (row) => <StatusBadge value={row.priority} /> },
    { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
    {
      key: "actions",
      label: "Update Status",
      render: (row) => (
        <select
          className="form-select form-select-sm"
          value={row.status}
          onChange={(event) => updateIssueStatus(row.id, event.target.value)}
          aria-label={`Update ${row.title} status`}
        >
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Reported Issues"
        subtitle="Review vehicle issues submitted by users and update their status."
      />

      <div className="card">
        <div className="card-header bg-white d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <h5 className="mb-0">All Issue Reports</h5>
          <select
            className="form-select"
            style={{ maxWidth: 210 }}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
        <DataTable columns={columns} rows={rows} />
      </div>
    </>
  );
}
