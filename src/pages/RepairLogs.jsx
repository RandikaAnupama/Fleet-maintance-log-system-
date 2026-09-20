import { useEffect, useState } from "react";
import api from "../services/api";
import garageService from "../services/garageService";
import repairService from "../services/repairService";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

const emptyForm = {
  vehicle_id: "",
  repair_type: "",
  garage_id: "",
  description: "",
  repair_date: "",
  cost: "",
  status: "PENDING",
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Request failed. Please try again.";

export default function RepairLogs() {
  const [rows, setRows] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingGarage, setSavingGarage] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [garageError, setGarageError] = useState("");
  const [notice, setNotice] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showGarageModal, setShowGarageModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [newGarage, setNewGarage] = useState("");

  const busy = saving || savingGarage || deletingId !== null;

  const loadData = async () => {
    setLoading(true);
    setPageError("");

    try {
      const [repairs, vehicleResponse, garageRows] = await Promise.all([
        repairService.getAll(),
        api.get("/vehicles"),
        garageService.getAll(),
      ]);

      setRows(repairs);
      setVehicles(vehicleResponse.data.vehicles);
      setGarages(garageRows);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshRepairs = async () => {
    try {
      const repairs = await repairService.getAll();
      setRows(repairs);
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
    setGarageError("");
    setNotice("");
    setShowGarageModal(false);
    setShowModal(true);
  };

  const handleEdit = (repair) => {
    setEditingId(repair.id);
    setFormData({
      vehicle_id: String(repair.vehicle_id),
      repair_type: repair.repair_type ?? "",
      garage_id:
        repair.garage_id === null ? "" : String(repair.garage_id),
      description: repair.description ?? "",
      repair_date: repair.repair_date,
      cost: String(repair.cost),
      status: repair.status,
    });
    setFormError("");
    setGarageError("");
    setNotice("");
    setShowGarageModal(false);
    setShowModal(true);
  };

  const closeRepairModal = () => {
    if (saving || savingGarage) return;
    setShowGarageModal(false);
    setShowModal(false);
  };

  const closeGarageModal = () => {
    if (savingGarage) return;
    setShowGarageModal(false);
    setGarageError("");
    setNewGarage("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "garage_id" && value === "ADD_NEW") {
      setNewGarage("");
      setGarageError("");
      setShowGarageModal(true);
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddGarage = async () => {
    if (savingGarage) return;

    const name = newGarage.trim();

    if (!name || name.length > 150) {
      setGarageError("Enter a garage name with 1–150 characters.");
      return;
    }

    setSavingGarage(true);
    setGarageError("");

    try {
      const result = await garageService.create(name);

      const createdGarage = {
        id: result.garageId,
        name,
        status: "ACTIVE",
      };

      setGarages((previous) => [...previous, createdGarage]);

      setFormData((previous) => ({
        ...previous,
        garage_id: String(result.garageId),
      }));

      setNewGarage("");
      setShowGarageModal(false);
    } catch (error) {
      setGarageError(getErrorMessage(error));
    } finally {
      setSavingGarage(false);
    }
  };

  const validate = () => {
    if (!formData.vehicle_id) {
      return "Select a vehicle.";
    }

    if (
      !formData.repair_type.trim() ||
      formData.repair_type.trim().length > 100
    ) {
      return "Enter a repair type with 1–100 characters.";
    }

    if (!formData.garage_id) {
      return "Select a garage.";
    }

    if (!formData.description.trim()) {
      return "Enter a repair description.";
    }

    const date = new Date(`${formData.repair_date}T00:00:00.000Z`);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(formData.repair_date) ||
      Number(formData.repair_date.slice(0, 4)) < 1000 ||
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== formData.repair_date
    ) {
      return "Enter a valid repair date.";
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

    if (
      !["PENDING", "IN_PROGRESS", "COMPLETED"].includes(formData.status)
    ) {
      return "Select a valid status.";
    }

    return "";
  };

  const handleSave = async () => {
    if (saving || savingGarage) return;

    const validationError = validate();
    setFormError(validationError);

    if (validationError) return;

    const payload = {
      vehicle_id: Number(formData.vehicle_id),
      repair_type: formData.repair_type.trim(),
      garage_id: Number(formData.garage_id),
      description: formData.description.trim(),
      repair_date: formData.repair_date,
      cost: Number(formData.cost),
      status: formData.status,
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await repairService.update(editingId, payload);
        setNotice("Repair updated successfully.");
      } else {
        await repairService.create(payload);
        setNotice("Repair created successfully.");
      }

      setShowModal(false);
      await refreshRepairs();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (repair) => {
    if (busy) return;

    if (
      !window.confirm(
        `Permanently delete repair #${repair.id} for ${repair.vehicle_number}?`
      )
    ) {
      return;
    }

    setDeletingId(repair.id);
    setPageError("");
    setNotice("");

    try {
      await repairService.remove(repair.id);
      setNotice("Repair deleted successfully.");
      await refreshRepairs();
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  const existingRepair = rows.find((repair) => repair.id === editingId);

  const selectableGarages = garages.filter(
    (garage) =>
      garage.status === "ACTIVE" ||
      (editingId !== null &&
        String(garage.id) === String(existingRepair?.garage_id))
  );

  const columns = [
    { key: "vehicle_number", label: "Vehicle" },
    { key: "repair_date", label: "Repair Date" },
    { key: "repair_type", label: "Repair Type" },
    { key: "garage_name", label: "Garage" },
    { key: "description", label: "Description" },
    {
      key: "cost",
      label: "Cost",
      render: (repair) =>
        `Rs. ${Number(repair.cost).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      key: "status",
      label: "Status",
      render: (repair) => <StatusBadge value={repair.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (repair) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={busy || loading}
            onClick={() => handleEdit(repair)}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            disabled={busy || loading}
            onClick={() => handleDelete(repair)}
          >
            {deletingId === repair.id ? "Deleting..." : "Delete"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Repair Logs"
        subtitle="Record vehicle repairs and costs."
        action={
          <button
            className="btn btn-primary"
            disabled={loading || busy || Boolean(pageError)}
            onClick={openNew}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Add Repair
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
          <div className="card-body">Loading repair records...</div>
        ) : pageError ? (
          <div className="card-body">
            Click Refresh to reload the data.
          </div>
        ) : rows.length === 0 ? (
          <div className="card-body">No repair records found.</div>
        ) : (
          <DataTable columns={columns} rows={rows} />
        )}
      </div>

      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="repair-modal-title"
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="repair-modal-title">
                  {editingId !== null ? "Edit Repair" : "Add Repair"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  disabled={saving || savingGarage}
                  onClick={closeRepairModal}
                ></button>
              </div>

              <div className="modal-body">
                {formError && (
                  <div className="alert alert-danger" role="alert">
                    {formError}
                  </div>
                )}

                <fieldset disabled={saving || savingGarage}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="repair-vehicle">
                        Vehicle
                      </label>
                      <select
                        id="repair-vehicle"
                        className="form-select"
                        name="vehicle_id"
                        value={formData.vehicle_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Vehicle</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.registration_number}
                            {vehicle.status === "INACTIVE"
                              ? " (Inactive)"
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="repair-date">
                        Repair Date
                      </label>
                      <input
                        id="repair-date"
                        type="date"
                        className="form-control"
                        name="repair_date"
                        value={formData.repair_date}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="repair-type">
                        Repair Type
                      </label>
                      <input
                        id="repair-type"
                        type="text"
                        className="form-control"
                        name="repair_type"
                        maxLength={100}
                        value={formData.repair_type}
                        onChange={handleChange}
                        placeholder="Example: Brake Repair"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="repair-garage">
                        Garage
                      </label>
                      <select
                        id="repair-garage"
                        className="form-select"
                        name="garage_id"
                        value={formData.garage_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Garage</option>
                        <option value="ADD_NEW">+ Add New Garage</option>
                        {selectableGarages.map((garage) => (
                          <option key={garage.id} value={garage.id}>
                            {garage.name}
                            {garage.status === "INACTIVE"
                              ? " (Inactive)"
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label
                        className="form-label"
                        htmlFor="repair-description"
                      >
                        Description
                      </label>
                      <textarea
                        id="repair-description"
                        className="form-control"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter repair description"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="repair-cost">
                        Cost (Rs.)
                      </label>
                      <input
                        id="repair-cost"
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
                      <label className="form-label" htmlFor="repair-status">
                        Status
                      </label>
                      <select
                        id="repair-status"
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>
                </fieldset>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  disabled={saving || savingGarage}
                  onClick={closeRepairModal}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={saving || savingGarage}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : "Save Repair"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGarageModal && (
        <div
          className="modal d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1060,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="garage-modal-title"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="garage-modal-title">
                  Add New Garage
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  disabled={savingGarage}
                  onClick={closeGarageModal}
                ></button>
              </div>

              <div className="modal-body">
                {garageError && (
                  <div className="alert alert-danger" role="alert">
                    {garageError}
                  </div>
                )}

                <label className="form-label" htmlFor="new-garage-name">
                  Garage Name
                </label>
                <input
                  id="new-garage-name"
                  type="text"
                  className="form-control"
                  maxLength={150}
                  value={newGarage}
                  disabled={savingGarage}
                  onChange={(event) => setNewGarage(event.target.value)}
                  placeholder="Enter garage name"
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  disabled={savingGarage}
                  onClick={closeGarageModal}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={savingGarage}
                  onClick={handleAddGarage}
                >
                  {savingGarage ? "Saving..." : "Add Garage"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}