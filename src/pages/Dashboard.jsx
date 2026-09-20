import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import DataTable from "../components/DataTable";
import api from "../services/api";

const money = (value) =>
  `Rs. ${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Dashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const loadDashboard = useCallback(async () => {
    const currentRequest = ++requestId.current;

    setLoading(true);
    setError("");

    try {
      const response = await api.get("/dashboard");

      if (currentRequest === requestId.current) {
        setData(response.data.dashboard);
      }
    } catch (err) {
      if (currentRequest === requestId.current) {
        setData(null);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load dashboard."
        );
      }
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    setData(null);
    loadDashboard();

    return () => {
      requestId.current += 1;
    };
  }, [loadDashboard]);

  const isAdmin = (data?.role || user?.role) === "ADMIN";
  const nextService = data?.next_service;
  const lastService = data?.last_service;
  const vehicle = data?.vehicle;

  const cards = !data
    ? []
    : isAdmin
      ? [
          [
            "Total Vehicles",
            String(data.total_vehicles),
            "bi-truck",
            `${data.active_vehicles} active`,
          ],
          [
            "Services Due",
            String(data.services_due),
            "bi-calendar2-event",
            `Today + next 6 days · ${data.overdue_services} overdue`,
          ],
          [
            "Open Issues",
            String(data.open_issues),
            "bi-exclamation-circle",
            `${data.high_priority} high priority`,
          ],
          [
            "Monthly Cost",
            money(data.monthly_cost),
            "bi-cash-stack",
            `${data.month_label} · through ${data.today}`,
          ],
        ]
      : [
          [
            "My Vehicle",
            vehicle?.registration_number || "Not assigned",
            "bi-truck",
            vehicle
              ? `${vehicle.make} ${vehicle.model}`
              : "Contact the administrator",
          ],
          [
            "Next Pending Service",
            nextService?.due_date || "Not scheduled",
            "bi-calendar-check",
            nextService
              ? `${nextService.service_type} · ${nextService.status}`
              : "No pending schedule",
          ],
          [
            "Last Service",
            lastService?.service_date || "No record",
            "bi-tools",
            lastService?.service_type || "No completed service to date",
          ],
          [
            "Open Issues",
            String(data.open_issues),
            "bi-exclamation-circle",
            `${data.high_priority} high priority`,
          ],
        ];

  const columns = [
    { key: "vehicle_number", label: "Vehicle" },
    { key: "service_type", label: "Service" },
    { key: "service_date", label: "Date" },
    {
      key: "cost",
      label: "Cost",
      render: (row) => money(row.cost),
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
        title={`Welcome, ${user?.name || user?.full_name || "User"}`}
        subtitle={
          isAdmin
            ? "Administrator overview of the complete fleet."
            : "Your assigned vehicle and maintenance overview."
        }
        action={
          <button
            className="btn btn-outline-secondary"
            disabled={loading}
            onClick={loadDashboard}
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

      {loading ? (
        <div className="card">
          <div className="card-body">Loading dashboard...</div>
        </div>
      ) : data ? (
        <>
          <div className="row g-3 mb-4">
            {cards.map(([title, value, icon, note]) => (
              <div className="col-sm-6 col-xl-3" key={title}>
                <StatCard
                  title={title}
                  value={value}
                  icon={icon}
                  note={note}
                />
              </div>
            ))}
          </div>

          {!isAdmin && !vehicle && (
            <div className="alert alert-info">
              No vehicle assigned. Please contact the administrator.
            </div>
          )}

          <div className="row g-4">
            <div className="col-xl-8">
              <div className="card h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    {isAdmin
                      ? "Recent Maintenance"
                      : "My Maintenance History"}
                  </h5>
                </div>

                {data.maintenance.length === 0 ? (
                  <div className="card-body">
                    No maintenance records available.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <DataTable
                      columns={columns}
                      rows={data.maintenance}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="col-xl-4">
              <div className="card h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Notifications</h5>
                </div>

                <div className="card-body">
                  <p className="text-muted small">
                    Recent issues and pending service reminders.
                    Use Refresh to check for updates.
                  </p>

                  {data.issues.length === 0 &&
                    data.schedules.length === 0 && (
                      <p className="text-muted mb-0">
                        No notifications available.
                      </p>
                    )}

                  {data.issues.map((issue) => (
                    <div
                      className="notification-item"
                      key={`issue-${issue.id}`}
                    >
                      <i className="bi bi-exclamation-triangle"></i>

                      <div>
                        <strong>{issue.title}</strong>
                        <div className="text-muted small">
                          {issue.vehicle_number || "Vehicle unavailable"}
                          {" · "}
                          {issue.reported_date}
                        </div>
                      </div>

                      <StatusBadge value={issue.status} />
                    </div>
                  ))}

                  {data.schedules.map((schedule) => (
                    <div
                      className="notification-item"
                      key={`schedule-${schedule.id}`}
                    >
                      <i className="bi bi-calendar-event"></i>

                      <div>
                        <strong>
                          {schedule.status === "OVERDUE"
                            ? "Service overdue"
                            : "Service due soon"}
                          {": "}
                          {schedule.service_type}
                        </strong>
                        <div className="text-muted small">
                          {schedule.vehicle_number}
                          {" · "}
                          {schedule.due_date}
                        </div>
                      </div>

                      <StatusBadge value={schedule.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}