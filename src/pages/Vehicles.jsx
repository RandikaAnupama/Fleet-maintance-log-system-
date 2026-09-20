import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

const emptyForm = {
  number: "",
  brand: "",
  model: "",
  year: "",
  vehicle_type: "",
  fuel_type: "",
  mileage: "",
  status: "ACTIVE",
};

const toRow = (vehicle) => ({
  id: vehicle.id,
  number: vehicle.registration_number ?? "",
  brand: vehicle.make ?? "",
  model: vehicle.model ?? "",
  year: vehicle.manufacture_year ?? "",
  vehicle_type: vehicle.vehicle_type ?? "",
  fuel_type: vehicle.fuel_type ?? "",
  mileage: Number(vehicle.mileage ?? 0),
  status: vehicle.status ?? "ACTIVE",
});

const errorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Request failed. Please try again.";

export default function Vehicles() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const loadVehicles = async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await api.get("/vehicles");
      setRows(response.data.vehicles.map(toRow));
    } catch (error) {
      setPageError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        `${row.number} ${row.brand} ${row.model}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      ),
    [rows, search]
  );

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setErrors({});
    setFormError("");
    setNotice("");
    setShow(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ ...row });
    setErrors({});
    setFormError("");
    setNotice("");
    setShow(true);
  };

  const closeModal = () => {
    if (!busy) setShow(false);
  };

  const validate = () => {
    const result = {};
    const year = Number(form.year);
    const mileage = Number(form.mileage);

    if (!form.number.trim()) {
      result.number = "Vehicle number is required.";
    }

    if (!form.brand.trim()) {
      result.brand = "Brand is required.";
    }

    if (!form.model.trim()) {
      result.model = "Model is required.";
    }

    if (
      String(form.year).trim() === "" ||
      !Number.isInteger(year) ||
      year < 1900 ||
      year > new Date().getFullYear() + 1
    ) {
      result.year = "Enter a valid manufacture year.";
    }

    if (
      String(form.mileage).trim() === "" ||
      !Number.isFinite(mileage) ||
      mileage < 0
    ) {
      result.mileage = "Enter a valid non-negative mileage.";
    }

    return result;
  };

  const save = async () => {
    if (busy) return;

    const validationErrors = validate();
    setErrors(validationErrors);
    setFormError("");

    if (Object.keys(validationErrors).length) return;

    const payload = {
      registration_number: form.number.trim(),
      make: form.brand.trim(),
      model: form.model.trim(),
      manufacture_year: Number(form.year),
      vehicle_type: form.vehicle_type.trim() || null,
      fuel_type: form.fuel_type.trim() || null,
      mileage: Number(form.mileage),
      status: form.status,
    };

    setBusy(true);

    try {
      if (editingId !== null) {
        await api.put(`/vehicles/${editingId}`, payload);
        setNotice("Vehicle updated successfully.");
      } else {
        await api.post("/vehicles", payload);
        setNotice("Vehicle created successfully.");
      }

      setShow(false);
      await loadVehicles();
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (row) => {
    if (busy || row.status === "INACTIVE") return;

    if (!window.confirm(`Deactivate vehicle ${row.number}?`)) return;

    setBusy(true);
    setPageError("");
    setNotice("");

    try {
      await api.delete(`/vehicles/${row.id}`);
      setNotice("Vehicle deactivated successfully.");
      await loadVehicles();
    } catch (error) {
      setPageError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: "number", label: "Vehicle No." },
    { key: "brand", label: "Brand" },
    { key: "model", label: "Model" },
    { key: "year", label: "Year" },
    {
      key: "mileage",
      label: "Mileage",
      render: (row) => `${row.mileage.toLocaleString()} km`,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge value={row.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={busy || loading}
            onClick={() => openEdit(row)}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            disabled={busy || loading || row.status === "INACTIVE"}
            onClick={() => deactivate(row)}
          >
            Deactivate
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Vehicle Management"
        subtitle="Create, view, update and deactivate vehicle records."
        action={
          <button
            className="btn btn-primary"
            disabled={busy || loading}
            onClick={openNew}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Add Vehicle
          </button>
        }
      />

      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
        </div>
      )}

      {pageError && (
        <div className="alert alert-danger" role="alert">
          {pageError}
        </div>
      )}

      <div className="card">
        <div className="card-body border-bottom d-flex gap-2">
          <input
            className="form-control search-box"
            placeholder="Search vehicle number, brand or model"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button
            className="btn btn-outline-secondary"
            disabled={loading || busy}
            onClick={loadVehicles}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="card-body">Loading vehicles...</div>
        ) : pageError ? (
          <div className="card-body">
            Could not refresh vehicle data. Click Refresh to try again.
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-body">No vehicles found.</div>
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}
      </div>

      <Modal
        show={show}
        title={editingId !== null ? "Edit Vehicle" : "Add Vehicle"}
        onClose={closeModal}
        footer={
          <>
            <button
              className="btn btn-light"
              disabled={busy}
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={busy}
              onClick={save}
            >
              {busy ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        {formError && (
          <div className="alert alert-danger" role="alert">
            {formError}
          </div>
        )}

        <div className="row g-3">
          {[
            ["number", "Vehicle Number", "text"],
            ["brand", "Brand", "text"],
            ["model", "Model", "text"],
            ["year", "Manufacture Year", "number"],
            ["vehicle_type", "Vehicle Type (optional)", "text"],
            ["fuel_type", "Fuel Type (optional)", "text"],
            ["mileage", "Current Mileage", "number"],
          ].map(([key, label, type]) => (
            <div className="col-md-6" key={key}>
              <label className="form-label" htmlFor={`vehicle-${key}`}>
                {label}
              </label>
              <input
                id={`vehicle-${key}`}
                type={type}
                className={`form-control ${
                  errors[key] ? "is-invalid" : ""
                }`}
                value={form[key]}
                disabled={busy}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    [key]: event.target.value,
                  }))
                }
              />
              <div className="invalid-feedback">{errors[key]}</div>
            </div>
          ))}

          <div className="col-md-6">
            <label className="form-label" htmlFor="vehicle-status">
              Status
            </label>
            <select
              id="vehicle-status"
              className="form-select"
              value={form.status}
              disabled={busy}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  status: event.target.value,
                }))
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="SERVICE_DUE">Service Due</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
}