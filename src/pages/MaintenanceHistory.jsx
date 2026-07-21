import { maintenanceSeed } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

export default function MaintenanceHistory() {
  const rows = maintenanceSeed.filter((r) => r.vehicle === "CAB-1234");
  const columns = [
    { key: "type", label: "Service" },
    { key: "date", label: "Service Date" },
    { key: "nextDate", label: "Next Service" },
    { key: "cost", label: "Cost", render: (r) => `Rs. ${r.cost.toLocaleString()}` },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> }
  ];
  return <>
    <PageHeader title="Maintenance History" subtitle="View the maintenance history of your assigned vehicle." />
    <div className="card"><DataTable columns={columns} rows={rows} /></div>
  </>;
}
