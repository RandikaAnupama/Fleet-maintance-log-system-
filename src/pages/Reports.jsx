import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { maintenanceSeed, repairsSeed } from "../data/mockData";

function escapeCsvValue(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadCsv(filename, rows, category) {
  if (rows.length === 0) {
    alert("No records available to export.");
    return;
  }

  const isMaintenance = category === "maintenance";

  const headers = [
    "Vehicle",
    isMaintenance ? "Service Type" : "Repair Description",
    "Date",
    "Garage",
    "Cost",
    "Status",
  ];

  const csvRows = rows.map((row) => [
    row.vehicle,
    isMaintenance ? row.type : row.description,
    row.date,
    row.garage || "Not Assigned",
    row.cost,
    row.status,
  ]);

  const csvContent = [
    headers.map(escapeCsvValue).join(","),
    ...csvRows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [category, setCategory] = useState("maintenance");
  const [reportType, setReportType] = useState("daily");

  const [selectedDate, setSelectedDate] = useState("2026-07-20");
  const [selectedMonth, setSelectedMonth] = useState("2026-07");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [vehicleFilter, setVehicleFilter] = useState("ALL");
  const [workTypeFilter, setWorkTypeFilter] = useState("ALL");
  const [garageFilter, setGarageFilter] = useState("ALL");

  const rows =
    category === "maintenance" ? maintenanceSeed : repairsSeed;

  const isMaintenance = category === "maintenance";

  const getUniqueValues = (key) => {
    return [
      ...new Set(
        rows
          .map((row) => row[key])
          .filter(
            (value) =>
              value !== undefined &&
              value !== null &&
              value !== ""
          )
      ),
    ];
  };

  const vehicleOptions = getUniqueValues("vehicle");
  const garageOptions = getUniqueValues("garage");
  const statusOptions = getUniqueValues("status");

  const workTypeOptions = isMaintenance
    ? getUniqueValues("type")
    : getUniqueValues("description");

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const rowDate = String(row.date || "");

      const matchesPeriod =
        reportType === "daily"
          ? rowDate === selectedDate
          : rowDate.startsWith(selectedMonth);

      const matchesStatus =
        statusFilter === "ALL" ||
        String(row.status || "").toUpperCase() === statusFilter;

      const matchesVehicle =
        vehicleFilter === "ALL" ||
        row.vehicle === vehicleFilter;

      const rowWorkType = isMaintenance
        ? row.type
        : row.description;

      const matchesWorkType =
        workTypeFilter === "ALL" ||
        rowWorkType === workTypeFilter;

      const matchesGarage =
        garageFilter === "ALL" ||
        String(row.garage || "") === garageFilter;

      return (
        matchesPeriod &&
        matchesStatus &&
        matchesVehicle &&
        matchesWorkType &&
        matchesGarage
      );
    });
  }, [
    rows,
    reportType,
    selectedDate,
    selectedMonth,
    statusFilter,
    vehicleFilter,
    workTypeFilter,
    garageFilter,
    isMaintenance,
  ]);

  const totalCost = filteredRows.reduce(
    (total, row) => total + Number(row.cost || 0),
    0
  );

  const completedCount = filteredRows.filter(
    (row) =>
      String(row.status || "").toUpperCase() === "COMPLETED"
  ).length;

  const pendingCount = filteredRows.filter(
    (row) =>
      String(row.status || "").toUpperCase() === "PENDING"
  ).length;

  const columns = [
    {
      key: "vehicle",
      label: "Vehicle",
    },
    {
      key: isMaintenance ? "type" : "description",
      label: isMaintenance
        ? "Service Type"
        : "Repair Description",
    },
    {
      key: "date",
      label: "Date",
    },
    {
      key: "garage",
      label: "Garage",
      render: (row) => row.garage || "—",
    },
    {
      key: "cost",
      label: "Cost",
      render: (row) =>
        `Rs. ${Number(row.cost || 0).toLocaleString()}`,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge value={row.status} />,
    },
  ];

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setStatusFilter("ALL");
    setVehicleFilter("ALL");
    setWorkTypeFilter("ALL");
    setGarageFilter("ALL");
  };

  const handleResetFilters = () => {
    setStatusFilter("ALL");
    setVehicleFilter("ALL");
    setWorkTypeFilter("ALL");
    setGarageFilter("ALL");
  };

  const handleCsvExport = () => {
    const period =
      reportType === "daily" ? selectedDate : selectedMonth;

    downloadCsv(
      `${category}-${reportType}-report-${period}.csv`,
      filteredRows,
      category
    );
  };

  const handlePrint = () => {
    if (filteredRows.length === 0) {
      alert("No records available to print.");
      return;
    }

    window.print();
  };

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Generate daily and monthly maintenance or repair reports."
      />

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4 col-lg-3">
              <label className="form-label">
                Report Category
              </label>

              <select className="form-select" value={category} onChange={handleCategoryChange}>
                <option value="maintenance">
                  Maintenance Report
                </option>
                <option value="repair">
                  Repair Report
                </option>
              </select>
            </div>

            <div className="col-md-4 col-lg-3">
              <label className="form-label">
                Report Type
              </label>

              <select className="form-select" value={reportType} onChange={(event) =>setReportType(event.target.value)}>
                <option value="daily">Daily Report</option>
                <option value="monthly">Monthly Report</option>
              </select>
            </div>

            <div className="col-md-4 col-lg-3">
              <label className="form-label">
                {reportType === "daily"
                  ? "Select Date"
                  : "Select Month"}
              </label>

              {reportType === "daily" ? (
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(event) =>
                    setSelectedDate(event.target.value)
                  }
                />
              ) : (
                <input
                  type="month"
                  className="form-control"
                  value={selectedMonth}
                  onChange={(event) =>
                    setSelectedMonth(event.target.value)
                  }
                />
              )}
            </div>

            <div className="col-md-4 col-lg-3">
              <label className="form-label">Status</label>

              <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="ALL">All Statuses</option>

                {statusOptions.map((status) => (
                  <option key={status} value={String(status).toUpperCase()}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4 col-lg-3">
              <label className="form-label">Vehicle</label>

              <select className="form-select" value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)}>
                <option value="ALL">All Vehicles</option>

                {vehicleOptions.map((vehicle) => (
                  <option key={vehicle} value={vehicle}>
                    {vehicle}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4 col-lg-3">
              <label className="form-label">
                {isMaintenance
                  ? "Service Type"
                  : "Repair Description"}
              </label>

              <select className="form-select" value={workTypeFilter} onChange={(event) =>  setWorkTypeFilter(event.target.value)}>
                <option value="ALL">
                  {isMaintenance
                    ? "All Service Types"
                    : "All Repair Types"}
                </option>

                {workTypeOptions.map((workType) => (
                  <option key={workType} value={workType}>
                    {workType}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4 col-lg-3">
              <label className="form-label">Garage</label>
 
              <select className="form-select" value={garageFilter} onChange={(event) => setGarageFilter(event.target.value)}>
                <option value="ALL">All Garages</option>

                {garageOptions.map((garage) => (
                  <option key={garage} value={garage}>
                    {garage}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-8 col-lg-3 d-flex align-items-end gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleResetFilters}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                Reset
              </button>

              <button
                type="button"
                className="btn btn-outline-success"
                onClick={handleCsvExport}
              >
                <i className="bi bi-filetype-csv me-1"></i>
                CSV
              </button>

              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handlePrint}
              >
                <i className="bi bi-filetype-pdf me-1"></i>
                Print / PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Total Records</p>
              <h3 className="mb-0">{filteredRows.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Total Cost</p>
              <h3 className="mb-0">
                Rs. {totalCost.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Completed</p>
              <h3 className="mb-0">{completedCount}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Pending</p>
              <h3 className="mb-0">{pendingCount}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-white">
          <h5 className="mb-0 text-capitalize">
            {reportType}{" "}
            {isMaintenance ? "Maintenance" : "Repair"} Report
          </h5>
        </div>

        {filteredRows.length > 0 ? (
          <DataTable columns={columns} rows={filteredRows} />
        ) : (
          <div className="text-center text-muted py-5">
            <i className="bi bi-file-earmark-x fs-1 d-block mb-2"></i>
            No records found for the selected filters.
          </div>
        )}
      </div>
    </>
  );
}