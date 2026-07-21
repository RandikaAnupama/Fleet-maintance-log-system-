import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { maintenanceSeed } from "../data/mockData";
import DataTable from "../components/DataTable";

function downloadCsv(filename, rows) {
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => `"${String(row[h]).replaceAll('"', '""')}"`).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [type, setType] = useState("daily");
  const [date, setDate] = useState("2026-07-20");

  const rows = maintenanceSeed;
  const columns = [
    { key: "vehicle", label: "Vehicle" },
    { key: "type", label: "Service Type" },
    { key: "date", label: "Date" },
    { key: "cost", label: "Cost", render: (r) => `Rs. ${r.cost.toLocaleString()}` },
    { key: "status", label: "Status" }
  ];

  return <>
    <PageHeader title="Reports" subtitle="Generate daily and monthly maintenance reports and export them." />
    <div className="card mb-4">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Report Type</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="daily">Daily Report</option>
              <option value="monthly">Monthly Report</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">{type === "daily" ? "Select Date" : "Select Month"}</label>
            <input className="form-control" type={type === "daily" ? "date" : "month"} value={type === "daily" ? date : date.slice(0, 7)} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="col-md-4 d-flex gap-2">
            <button className="btn btn-outline-success" onClick={() => downloadCsv(`${type}-maintenance-report.csv`, rows)}>
              <i className="bi bi-filetype-csv me-1"></i>CSV
            </button>
            <button className="btn btn-outline-danger" onClick={() => window.print()}>
              <i className="bi bi-filetype-pdf me-1"></i>Print / PDF
            </button>
          </div>
        </div>
      </div>
    </div>
    <div className="card">
      <div className="card-header bg-white"><h5 className="mb-0 text-capitalize">{type} Maintenance Report</h5></div>
      <DataTable columns={columns} rows={rows} />
    </div>
  </>;
}
