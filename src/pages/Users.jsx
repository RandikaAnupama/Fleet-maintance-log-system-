import { usersSeed } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

export default function Users() {
  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (r) => <span className="badge text-bg-primary">{r.role}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
    { key: "actions", label: "Actions", render: () => <button className="btn btn-sm btn-outline-primary">Edit</button> }
  ];
  return <>
    <PageHeader title="User Management" subtitle="Admin-only page for creating and managing users." action={<button className="btn btn-primary"><i className="bi bi-person-plus me-1"></i>Add User</button>} />
    <div className="card"><DataTable columns={columns} rows={usersSeed} /></div>
  </>;
}
