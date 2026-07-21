import { repairsSeed } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

export default function RepairLogs() {
  const columns = [
    { key: "vehicle", label: "Vehicle" },
    { key: "date", label: "Repair Date" },
    { key: "garage", label: "Garage" },
    { key: "description", label: "Description" },
    { key: "cost", label: "Cost", render: (r) => `Rs. ${r.cost.toLocaleString()}` },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> }
  ];
  return <>
    <PageHeader title="Repair Logs" subtitle="Record vehicle repairs and costs." action={<button className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>Add Repair</button>} />
    <div className="card"><DataTable columns={columns} rows={repairsSeed} /></div>
  </>;
}
