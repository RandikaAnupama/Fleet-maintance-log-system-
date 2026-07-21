import { useAuth } from "../context/AuthContext";
import { useIssues } from "../context/IssueContext";
import { maintenanceSeed } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import DataTable from "../components/DataTable";

export default function Dashboard() {
  const { user } = useAuth();
  const { issues, openIssues } = useIssues();

  const isAdmin = user?.role === "ADMIN";
  const assignedVehicle = "CAB-1234";

  const userIssues = issues.filter(
    (issue) => issue.vehicle === assignedVehicle
  );

  const userOpenIssues = userIssues.filter(
    (issue) => issue.status !== "RESOLVED"
  );

  const highPriorityIssues = openIssues.filter(
    (issue) => issue.priority === "HIGH"
  );

  const dashboardIssues = isAdmin ? issues : userIssues;

  const dashboardMaintenance = isAdmin
    ? maintenanceSeed
    : maintenanceSeed.filter(
        (record) => record.vehicle === assignedVehicle
      );

  const adminCards = [
    ["Total Vehicles", "24", "bi-truck", "20 active"],
    ["Services Due", "5", "bi-calendar2-event", "Next 7 days"],
    [
      "Open Issues",
      openIssues.length.toString(),
      "bi-exclamation-circle",
      `${highPriorityIssues.length} high priority`
    ],
    ["Monthly Cost", "Rs. 125,000", "bi-cash-stack", "July 2026"]
  ];

  const userCards = [
    ["My Vehicle", assignedVehicle, "bi-truck", "Toyota Hilux"],
    ["Next Service", "15 Aug 2026", "bi-calendar-check", "Oil and filter"],
    ["Last Service", "18 Jul 2026", "bi-tools", "Completed"],
    [
      "Open Issues",
      userOpenIssues.length.toString(),
      "bi-exclamation-circle",
      userOpenIssues.length > 0
        ? userOpenIssues[0].title
        : "No open issues"
    ]
  ];

  const columns = [
    { key: "vehicle", label: "Vehicle" },
    { key: "type", label: "Service" },
    { key: "date", label: "Date" },
    {
      key: "cost",
      label: "Cost",
      render: (row) => `Rs. ${row.cost.toLocaleString()}`
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge value={row.status} />
    }
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name}`}
        subtitle={
          isAdmin
            ? "Administrator overview of the complete fleet."
            : "Your assigned vehicle and maintenance overview."
        }
      />

      <div className="row g-3 mb-4">
        {(isAdmin ? adminCards : userCards).map(
          ([title, value, icon, note]) => (
            <div className="col-sm-6 col-xl-3" key={title}>
              <StatCard
                title={title}
                value={value}
                icon={icon}
                note={note}
              />
            </div>
          )
        )}
      </div>

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

            <DataTable
              columns={columns}
              rows={dashboardMaintenance}
            />
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Notifications</h5>
            </div>

            <div className="card-body">
              {dashboardIssues.length === 0 ? (
                <p className="text-muted mb-0">
                  No issue notifications available.
                </p>
              ) : (
                dashboardIssues.map((issue) => (
                  <div
                    className="notification-item"
                    key={issue.id}
                  >
                    <i className="bi bi-exclamation-triangle"></i>

                    <div>
                      <strong>{issue.title}</strong>

                      <div className="text-muted small">
                        {issue.vehicle} · {issue.date}
                      </div>
                    </div>

                    <StatusBadge value={issue.status} />
                  </div>
                ))
              )}

              {isAdmin && (
                <div className="notification-item">
                  <i className="bi bi-calendar-event"></i>

                  <div>
                    <strong>Service due soon</strong>

                    <div className="text-muted small">
                      CAD-5678 · 25 Jul 2026
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}