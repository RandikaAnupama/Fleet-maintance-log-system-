import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";

export default function MaintenanceHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadHistory = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.get("/my-maintenance");

      setRows(response.data.maintenance);
      setMessage(response.data.message || "");
    } catch (err) {
      setRows([]);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load maintenance history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const columns = [
    { key: "vehicle_number", label: "Vehicle" },
    { key: "service_type", label: "Service" },
    {
      key: "description",
      label: "Description",
      render: (row) => row.description || "—",
    },
    { key: "service_date", label: "Service Date" },
    {
      key: "next_service_date",
      label: "Next Service",
      render: (row) => row.next_service_date || "Not recorded",
    },
    {
      key: "cost",
      label: "Cost",
      render: (row) =>
        `Rs. ${Number(row.cost).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge value={row.status} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Maintenance History"
        subtitle="View the maintenance history of your assigned vehicle."
        action={
          <button
            className="btn btn-outline-secondary"
            disabled={loading}
            onClick={loadHistory}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        }
      />

      {error && (
        <div className="alert alert-danger">
          {error} Click Refresh to try again.
        </div>
      )}

      {message && (
        <div className="alert alert-info">{message}</div>
      )}

      <div className="card">
        {loading ? (
          <div className="card-body">
            Loading maintenance history...
          </div>
        ) : error ? null : rows.length === 0 ? (
          <div className="card-body">
            {message
              ? "No maintenance history to display."
              : "No maintenance records found for your assigned vehicle."}
          </div>
        ) : (
          <div className="table-responsive">
            <DataTable columns={columns} rows={rows} />
          </div>
        )}
      </div>
    </>
  );
}