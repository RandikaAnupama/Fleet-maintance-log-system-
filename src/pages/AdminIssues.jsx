import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { useIssues } from "../context/IssueContext";

export default function AdminIssues() {
  const {
    issues,
    loading,
    error,
    updatingId,
    refreshIssues,
    updateIssueStatus,
  } = useIssues();

  const [filter, setFilter] = useState("ALL");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    refreshIssues();
  }, [refreshIssues]);

  const busy = loading || updatingId !== null;

  const rows = useMemo(() => {
    if (filter === "ALL") return issues;
    return issues.filter((issue) => issue.status === filter);
  }, [issues, filter]);

  const changeStatus = async (row, status) => {
    if (busy || row.status === status) return;

    setSuccess("");

    const updated = await updateIssueStatus(row.id, status);

    if (updated) {
      setSuccess(`Status updated for "${row.title}".`);
    }
  };

  const refresh = () => {
    setSuccess("");
    refreshIssues();
  };

  const columns = [
    { key: "vehicle", label: "Vehicle" },
    { key: "title", label: "Issue" },
    {
      key: "description",
      label: "Description",
      render: (row) => row.description || "—",
    },
    {
      key: "reportedBy",
      label: "Reported By",
    },
    { key: "date", label: "Reported Date" },
    {
      key: "priority",
      label: "Priority",
      render: (row) => <StatusBadge value={row.priority} />,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge value={row.status} />,
    },
    {
      key: "actions",
      label: "Update Status",
      render: (row) => (
        <div>
          <select
            className="form-select form-select-sm"
            value={row.status}
            disabled={busy || Boolean(error)}
            onChange={(event) =>
              changeStatus(row, event.target.value)
            }
            aria-label={`Update ${row.title} status`}
          >
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          {updatingId === row.id && (
            <small className="text-muted">Saving...</small>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Reported Issues"
        subtitle="Review vehicle issues submitted by users and update their status."
        action={
          <button
            className="btn btn-outline-secondary"
            disabled={busy}
            onClick={refresh}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        }
      />

      {error && (
        <div className="alert alert-danger">
          {error} Click Refresh to reload the latest issue data.
        </div>
      )}

      {success && (
        <div className="alert alert-success">{success}</div>
      )}

      <div className="card">
        <div className="card-header bg-white d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <h5 className="mb-0">All Issue Reports</h5>

          <select
            className="form-select"
            style={{ maxWidth: 210 }}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter issues by status"
          >
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {loading ? (
          <div className="p-3">Loading reported issues...</div>
        ) : (
          <DataTable columns={columns} rows={rows} />
        )}
      </div>
    </>
  );
}