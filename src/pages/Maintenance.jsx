import { maintenanceSeed } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

export default function Maintenance() {
  const columns = [
    { key: "vehicle", label: "Vehicle" },
    { key: "type", label: "Service Type" },
    { key: "date", label: "Service Date" },
    { key: "nextDate", label: "Next Service" },
    { key: "cost", label: "Cost", render: (r) => `Rs. ${r.cost.toLocaleString()}` },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
    { key: "actions", label: "Actions", render: () => <button className="btn btn-sm btn-outline-primary">Edit</button> }
  ];
  return <>
    <PageHeader title="Maintenance Logs" subtitle="Maintain the complete service history for each vehicle." action={<button className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>Add Maintenance</button>} />
    <div className="card"><DataTable columns={columns} rows={maintenanceSeed} /></div>
  </>;
}
