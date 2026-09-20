import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";

const money = (value) =>
  `Rs. ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function localDate() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function csvCell(value) {
  let text = String(value ?? "");

  if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

function Filter({ label, value, onChange, options }) {
  return (
    <div className="col-md-4 col-lg-3">
      <label className="form-label">{label}</label>
      <select
        className="form-select"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Reports() {
  const [category, setCategory] = useState("maintenance");
  const [reportType, setReportType] = useState("monthly");
  const [selectedDate, setSelectedDate] = useState(localDate);
  const [selectedMonth, setSelectedMonth] = useState(
    () => localDate().slice(0, 7)
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [workFilter, setWorkFilter] = useState("");
  const [garageFilter, setGarageFilter] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const requestId = useRef(0);

  const isMaintenance = category === "maintenance";
  const period =
    reportType === "daily" ? selectedDate : selectedMonth;

  useEffect(() => {
    const currentRequest = ++requestId.current;
    let active = true;

    setLoading(true);
    setError("");
    setRows([]);

    const load = async () => {
      try {
        const response = await api.get(
          category === "maintenance" ? "/maintenance" : "/repairs"
        );

        if (!active || currentRequest !== requestId.current) return;

        const records =
          category === "maintenance"
            ? response.data.maintenance
            : response.data.repairs;

        if (!Array.isArray(records)) {
          throw new Error("Unexpected report response.");
        }

        const mapped = records.map((row) => ({
          id: row.id,
          vehicle: row.vehicle_number || "Unavailable",
          type:
            category === "maintenance"
              ? row.service_type
              : row.repair_type,
          description: row.description || "",
          date: String(
            category === "maintenance"
              ? row.service_date || ""
              : row.repair_date || ""
          ).slice(0, 10),
          garage: category === "repair" ? row.garage_name || "" : "",
          cost: Number(row.cost || 0),
          status: row.status,
        }));

        mapped.sort(
          (a, b) => b.date.localeCompare(a.date) || b.id - a.id
        );

        setRows(mapped);
      } catch (err) {
        if (active && currentRequest === requestId.current) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load report data."
          );
        }
      } finally {
        if (active && currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [category, reload]);

  const options = useMemo(() => {
    const unique = (key) =>
      [...new Set(rows.map((row) => row[key]).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));

    return {
      vehicles: unique("vehicle"),
      types: unique("type"),
      garages: unique("garage"),
      statuses: unique("status"),
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!period) return [];

    return rows.filter((row) => {
      const matchesPeriod =
        reportType === "daily"
          ? row.date === selectedDate
          : row.date.slice(0, 7) === selectedMonth;

      return (
        matchesPeriod &&
        (!statusFilter || row.status === statusFilter) &&
        (!vehicleFilter || row.vehicle === vehicleFilter) &&
        (!workFilter || row.type === workFilter) &&
        (isMaintenance || !garageFilter || row.garage === garageFilter)
      );
    });
  }, [
    rows,
    period,
    reportType,
    selectedDate,
    selectedMonth,
    statusFilter,
    vehicleFilter,
    workFilter,
    garageFilter,
    isMaintenance,
  ]);

  const totalCents = filteredRows.reduce(
    (sum, row) => sum + Math.round(row.cost * 100),
    0
  );

  const completedCount = filteredRows.filter(
    (row) => row.status === "COMPLETED"
  ).length;

  const pendingCount = filteredRows.filter(
    (row) => row.status === "PENDING"
  ).length;

  const inProgressCount = filteredRows.filter(
    (row) => row.status === "IN_PROGRESS"
  ).length;

  const columns = [
    { key: "vehicle", label: "Vehicle" },
    {
      key: "type",
      label: isMaintenance ? "Service Type" : "Repair Type",
    },
    {
      key: "description",
      label: "Description",
      render: (row) => row.description || "—",
    },
    { key: "date", label: "Date" },
    ...(!isMaintenance
      ? [{
          key: "garage",
          label: "Garage",
          render: (row) => row.garage || "Not recorded",
        }]
      : []),
    {
      key: "cost",
      label: "Recorded Cost",
      render: (row) => money(row.cost),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge value={row.status} />,
    },
  ];

  const exportFields = [
    ["vehicle", "Vehicle"],
    ["type", isMaintenance ? "Service Type" : "Repair Type"],
    ["description", "Description"],
    ["date", "Date"],
    ...(!isMaintenance ? [["garage", "Garage"]] : []),
    ["cost", "Recorded Cost (LKR)"],
    ["status", "Status"],
  ];

  const resetFilters = () => {
    setStatusFilter("");
    setVehicleFilter("");
    setWorkFilter("");
    setGarageFilter("");
  };

  const canExport =
    !loading && !error && Boolean(period) && filteredRows.length > 0;

  const exportCsv = () => {
    if (!canExport) return;

    const lines = [
      exportFields.map(([, label]) => csvCell(label)).join(","),
      ...filteredRows.map((row) =>
        exportFields
          .map(([key]) =>
            csvCell(key === "cost" ? row.cost.toFixed(2) : row[key])
          )
          .join(",")
      ),
    ];

    const blob = new Blob(["\uFEFF", lines.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${category}-${reportType}-${period}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const reportTitle =
    `${reportType === "daily" ? "Daily" : "Monthly"} ` +
    `${isMaintenance ? "Maintenance" : "Repair"} Report`;

  const filterSummary = [
    `Status: ${statusFilter || "All"}`,
    `Vehicle: ${vehicleFilter || "All"}`,
    `Type: ${workFilter || "All"}`,
    ...(!isMaintenance ? [`Garage: ${garageFilter || "All"}`] : []),
  ].join(" | ");

  return (
    <>
      <style>{`
        .fleet-report-print { display: none; }
        @media print {
          @page { size: A4 landscape; margin: 12mm; }
          body > :not(.fleet-report-print) { display: none !important; }
          body > .fleet-report-print {
            display: block !important;
            color: #000;
            background: #fff;
            font-size: 10pt;
          }
          .fleet-report-print table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .fleet-report-print th,
          .fleet-report-print td {
            border: 1px solid #777;
            padding: 6px;
            overflow-wrap: anywhere;
          }
          .fleet-report-print thead { display: table-header-group; }
          .fleet-report-print tr { break-inside: avoid; }
        }
      `}</style>

      <PageHeader
        title="Reports"
        subtitle="Daily and monthly maintenance or repair records."
        action={
          <button
            className="btn btn-outline-secondary"
            disabled={loading}
            onClick={() => setReload((value) => value + 1)}
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

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4 col-lg-3">
              <label className="form-label">Report Category</label>
              <select
                className="form-select"
                aria-label="Report category"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  resetFilters();
                  setRows([]);
                  setLoading(true);
                }}
              >
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
              </select>
            </div>

            <div className="col-md-4 col-lg-3">
              <label className="form-label">Report Type</label>
              <select
                className="form-select"
                aria-label="Report type"
                value={reportType}
                onChange={(event) => setReportType(event.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="col-md-4 col-lg-3">
              <label className="form-label">
                {reportType === "daily" ? "Date" : "Month"}
              </label>
              <input
                className="form-control"
                aria-label="Report period"
                type={reportType === "daily" ? "date" : "month"}
                value={period}
                onChange={(event) =>
                  reportType === "daily"
                    ? setSelectedDate(event.target.value)
                    : setSelectedMonth(event.target.value)
                }
              />
            </div>

            <Filter
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={options.statuses}
            />

            <Filter
              label="Vehicle"
              value={vehicleFilter}
              onChange={setVehicleFilter}
              options={options.vehicles}
            />

            <Filter
              label={isMaintenance ? "Service Type" : "Repair Type"}
              value={workFilter}
              onChange={setWorkFilter}
              options={options.types}
            />

            {!isMaintenance && (
              <Filter
                label="Garage"
                value={garageFilter}
                onChange={setGarageFilter}
                options={options.garages}
              />
            )}

            <div className="col-12 d-flex flex-wrap gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
              <button
                className="btn btn-outline-success"
                disabled={!canExport}
                onClick={exportCsv}
              >
                CSV
              </button>
              <button
                className="btn btn-outline-danger"
                disabled={!canExport}
                onClick={() => window.print()}
              >
                Print / PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card card-body">Loading report data...</div>
      ) : error ? null : !period ? (
        <div className="alert alert-info">
          Select a date or month to view the report.
        </div>
      ) : (
        <>
          <div className="row g-3 mb-3">
            {[
              ["Total Records", filteredRows.length],
              ["Recorded Cost Total", money(totalCents / 100)],
              ["Completed", completedCount],
              ["Pending", pendingCount],
              ...(!isMaintenance
                ? [["In Progress", inProgressCount]]
                : []),
            ].map(([label, value]) => (
              <div className="col-sm-6 col-lg" key={label}>
                <div className="card h-100">
                  <div className="card-body">
                    <p className="text-muted mb-1">{label}</p>
                    <h4 className="mb-0">{value}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-muted small">
            Totals include all matching records in the selected period,
            including future-dated records and the selected statuses.
            Dashboard monthly cost includes completed maintenance and
            repairs only through today.
          </p>

          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-1">{reportTitle} · {period}</h5>
              <small className="text-muted">{filterSummary}</small>
            </div>

            {filteredRows.length > 0 ? (
              <div className="table-responsive">
                <DataTable columns={columns} rows={filteredRows} />
              </div>
            ) : (
              <div className="p-4 text-muted">
                No records found for the selected filters.
              </div>
            )}
          </div>
        </>
      )}

      {createPortal(
        <section className="fleet-report-print">
          <h2>Fleet Maintenance Log System</h2>
          <h3>{reportTitle} · {period}</h3>
          <p>{filterSummary}</p>
          <p>
            Records: {filteredRows.length}
            {" | "}Recorded Cost Total: {money(totalCents / 100)}
            {" | "}Completed: {completedCount}
            {" | "}Pending: {pendingCount}
            {!isMaintenance && ` | In Progress: ${inProgressCount}`}
          </p>
          <p>
            Includes all matching records in the selected period.
          </p>
          {!canExport ? (
            <p>No report available to print.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  {exportFields.map(([key, label]) => (
                    <th key={key}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    {exportFields.map(([key]) => (
                      <td key={key}>
                        {key === "cost"
                          ? row.cost.toFixed(2)
                          : row[key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>,
        document.body
      )}
    </>
  );
}