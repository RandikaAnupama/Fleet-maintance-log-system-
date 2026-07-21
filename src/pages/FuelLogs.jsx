import { fuelSeed } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";

export default function FuelLogs() {
  const columns = [
    { key: "vehicle", label: "Vehicle" },
    { key: "date", label: "Date" },
    { key: "litres", label: "Fuel Amount", render: (r) => `${r.litres} L` },
    { key: "cost", label: "Cost", render: (r) => `Rs. ${r.cost.toLocaleString()}` },
    { key: "odometer", label: "Odometer", render: (r) => `${r.odometer.toLocaleString()} km` },
    { key: "actions", label: "Actions", render: () => <button className="btn btn-sm btn-outline-primary">Edit</button> }
  ];
  return <>
    <PageHeader title="Fuel Logs" subtitle="Record fuel purchases and odometer readings." action={<button className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>Add Fuel Record</button>} />
    <div className="card"><DataTable columns={columns} rows={fuelSeed} /></div>
  </>;
}
