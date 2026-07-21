import { useState } from "react";
import { driversSeed } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

export default function Drivers() {
  const [rows, setRows] = useState(driversSeed);
  const columns = [
    { key: "name", label: "Driver Name" },
    { key: "license", label: "License Number" },
    { key: "phone", label: "Phone" },
    { key: "vehicle", label: "Assigned Vehicle" },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
    { key: "actions", label: "Actions", render: (r) => <button className="btn btn-sm btn-outline-danger" onClick={() => setRows(rows.filter(x => x.id !== r.id))}>Delete</button> }
  ];
  return <>
    <PageHeader title="Driver Management" subtitle="Manage drivers and vehicle assignments." action={<button className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>Add Driver</button>} />
    <div className="card"><DataTable columns={columns} rows={rows} /></div>
  </>;
}
