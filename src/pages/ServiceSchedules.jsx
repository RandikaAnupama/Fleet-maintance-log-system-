import { schedulesSeed } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

export default function ServiceSchedules() {
  const columns = [
    { key: "vehicle", label: "Vehicle" },
    { key: "service", label: "Service" },
    { key: "date", label: "Scheduled Date" },
    { key: "reminder", label: "Reminder", render: (r) => `${r.reminder} days before` },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> }
  ];
  return <>
    <PageHeader title="Service Schedule" subtitle="Plan upcoming maintenance and reminders." action={<button className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>Schedule Service</button>} />
    <div className="card"><DataTable columns={columns} rows={schedulesSeed} /></div>
  </>;
}
