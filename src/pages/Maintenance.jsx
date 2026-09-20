import { useEffect, useState } from "react";
import api from "../services/api";
import maintenanceService from "../services/maintenanceService";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

const emptyForm = {
  vehicle_id: "",
  service_type: "",
  description: "",
  service_date: "",
  next_service_date: "",
  cost: "",
  status: "PENDING",
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Request failed. Please try again.";

const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  if (Number(value.slice(0, 4)) < 1000) return false;

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

export default function Maintenance() {
  const [rows, setRows] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const busy = saving || deletingId !== null;

  const loadData = async () => {
    setLoading(true);
    setPageError("");

    try {
      const [maintenance, vehicleResponse] = await Promise.all([
        maintenanceService.getAll(),
        api.get("/vehicles"),
      ]);

      setRows(maintenance);
      setVehicles(vehicleResponse.data.vehicles);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshMaintenance = async () => {
    try {
      const maintenance = await maintenanceService.getAll();
      setRows(maintenance);
      setPageError("");
    } catch (error) {
      setPageError(
        `The change was saved, but the list could not refresh. ${getErrorMessage(error)}`
      );
    }
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setFormError("");
    setNotice("");
    setShowModal(true);
  };

  const openEdit = (maintenance) => {
    setEditingId(maintenance.id);
    setFormData({
      vehicle_id: String(maintenance.vehicle_id),
      service_type: maintenance.service_type ?? "",
      description: maintenance.description ?? "",
      service_date: maintenance.service_date ?? "",
      next_service_date: maintenance.next_service_date ?? "",
      cost: String(maintenance.cost ?? ""),
      status: maintenance.status,
    });
    setFormError("");
    setNotice("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) setShowModal(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validate = () => {
    if (!formData.vehicle_id) {
      return "Select a vehicle.";
    }

    if (
      !formData.service_type.trim() ||
      formData.service_type.trim().length > 100
    ) {
      return "Enter a service type with 1–100 characters.";
    }

    if (!validDate(formData.service_date)) {
      return "Enter a valid service date.";
    }

    if (formData.next_service_date) {
      if (!validDate(formData.next_service_date)) {
        return "Enter a valid next service date.";
      }

      if (formData.next_service_date < formData.service_date) {
        return "Next service date cannot be earlier than service date.";
      }
    }

    const cost = Number(formData.cost);

    if (
      !/^\d+(\.\d{1,2})?$/.test(String(formData.cost).trim()) ||
      !Number.isFinite(cost) ||
      cost <= 0 ||
      cost > 99999999.99
    ) {
      return "Enter a cost greater than zero, up to 99999999.99, with at most two decimal places.";
    }

    if (!["PENDING", "COMPLETED"].includes(formData.status)) {
      return "Select a valid status.";
    }

    return "";
  };

  const handleSave = async () => {
    if (saving) return;

    const validationError = validate();
    setFormError(validationError);

    if (validationError) return;

    const payload = {
      vehicle_id: Number(formData.vehicle_id),
      service_type: formData.service_type.trim(),
      description: formData.description.trim() || null,
      service_date: formData.service_date,
      next_service_date: formData.next_service_date || null,
      cost: Number(formData.cost),
      status: formData.status,
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await maintenanceService.update(editingId, payload);
        setNotice("Maintenance updated successfully.");
      } else {
        await maintenanceService.create(payload);
        setNotice("Maintenance created successfully.");
      }

      setShowModal(false);
      await refreshMaintenance();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (maintenance) => {
    if (busy) return;

    if (
      !window.confirm(
        `Permanently delete maintenance #${maintenance.id} for ${maintenance.vehicle_number}?`
      )
    ) {
      return;
    }

    setDeletingId(maintenance.id);
    setPageError("");
    setNotice("");

    try {
      await maintenanceService.remove(maintenance.id);
      setNotice("Maintenance deleted successfully.");
      await refreshMaintenance();
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    { key: "vehicle_number", label: "Vehicle" },
    { key: "service_type", label: "Service Type" },
    { key: "service_date", label: "Service Date" },
    {
      key: "next_service_date",
      label: "Next Service",
      render: (maintenance) => maintenance.next_service_date || "—",
    },
    {
      key: "cost",
      label: "Cost",
      render: (maintenance) =>
        `Rs. ${Number(maintenance.cost).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      key: "status",
      label: "Status",
      render: (maintenance) => (
        <StatusBadge value={maintenance.status} />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (maintenance) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={busy || loading}
            onClick={() => openEdit(maintenance)}
          >
            Edit
          </button>

          <button
            className="btn btn-sm btn-outline-danger"
            disabled={busy || loading}
            onClick={() => handleDelete(maintenance)}
          >
            {deletingId === maintenance.id ? "Deleting..." : "Delete"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Maintenance Logs"
        subtitle="Maintain the complete service history for each vehicle."
        action={
          <button
            className="btn btn-primary"
            disabled={loading || busy || Boolean(pageError)}
            onClick={openNew}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Add Maintenance
          </button>
        }
      />

      {pageError && (
        <div className="alert alert-danger" role="alert">
          {pageError}
        </div>
      )}

      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
        </div>
      )}

      <div className="card">
        <div className="card-body border-bottom d-flex justify-content-end">
          <button
            className="btn btn-outline-secondary"
            disabled={loading || busy}
            onClick={loadData}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="card-body">Loading maintenance records...</div>
        ) : pageError ? (
          <div className="card-body">
            Click Refresh to reload the data.
          </div>
        ) : rows.length === 0 ? (
          <div className="card-body">No maintenance records found.</div>
        ) : (
          <DataTable columns={columns} rows={rows} />
        )}
      </div>

      <Modal
        show={showModal}
        title={editingId !== null ? "Edit Maintenance" : "Add Maintenance"}
        onClose={closeModal}
        footer={
          <div className="d-flex gap-2">
            <button
              className="btn btn-secondary"
              disabled={saving}
              onClick={closeModal}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        }
      >
        {formError && (
          <div className="alert alert-danger" role="alert">
            {formError}
          </div>
        )}

        <fieldset disabled={saving}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="maintenance-vehicle">
                Vehicle
              </label>
              <select
                id="maintenance-vehicle"
                className="form-select"
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registration_number}
                    {vehicle.status === "INACTIVE" ? " (Inactive)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="maintenance-type">
                Service Type
              </label>
              <input
                id="maintenance-type"
                type="text"
                className="form-control"
                name="service_type"
                maxLength={100}
                value={formData.service_type}
                onChange={handleChange}
                placeholder="Example: Oil Change"
              />
            </div>

            <div className="col-12">
              <label
                className="form-label"
                htmlFor="maintenance-description"
              >
                Description (optional)
              </label>
              <textarea
                id="maintenance-description"
                className="form-control"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="maintenance-date">
                Service Date
              </label>
              <input
                id="maintenance-date"
                type="date"
                className="form-control"
                name="service_date"
                value={formData.service_date}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="maintenance-next-date">
                Next Service Date (optional)
              </label>
              <input
                id="maintenance-next-date"
                type="date"
                className="form-control"
                name="next_service_date"
                min={formData.service_date || undefined}
                value={formData.next_service_date}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="maintenance-cost">
                Cost (Rs.)
              </label>
              <input
                id="maintenance-cost"
                type="number"
                className="form-control"
                name="cost"
                min="0.01"
                max="99999999.99"
                step="0.01"
                value={formData.cost}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="maintenance-status">
                Status
              </label>
              <select
                id="maintenance-status"
                className="form-select"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </fieldset>
      </Modal>
    </>
  );
}