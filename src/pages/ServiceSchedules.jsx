import { useEffect, useRef, useState } from "react";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import scheduleService from "../services/scheduleService";

const emptyForm = {
  vehicle_id: "",
  garage_id: "",
  service_type: "",
  due_date: "",
  estimated_cost: "",
};

const emptyCompletion = {
  service_date: "",
  actual_cost: "",
  next_service_date: "",
  description: "",
};

function errorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Request failed. Please try again."
  );
}

function validCost(value) {
  return (
    /^\d+(\.\d{1,2})?$/.test(String(value)) &&
    Number(value) > 0 &&
    Number(value) <= 99999999.99
  );
}

export default function ServiceSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [completion, setCompletion] = useState(emptyCompletion);
  const busyRef = useRef(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [scheduleRows, vehicleResponse, garageResponse] =
        await Promise.all([
          scheduleService.getAll(),
          api.get("/vehicles"),
          api.get("/garages"),
        ]);

      setSchedules(scheduleRows);
      setVehicles(vehicleResponse.data.vehicles);
      setGarages(garageResponse.data.garages);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const closeModal = () => {
    if (busyRef.current) return;
    setModal(null);
    setSelected(null);
    setFormError("");
  };

  const openAdd = () => {
    setSelected(null);
    setForm({ ...emptyForm });
    setFormError("");
    setNotice("");
    setModal("schedule");
  };

  const openEdit = (row) => {
    setSelected(row);
    setForm({
      vehicle_id: String(row.vehicle_id),
      garage_id: row.garage_id ? String(row.garage_id) : "",
      service_type: row.service_type,
      due_date: row.due_date,
      estimated_cost: String(row.estimated_cost),
    });
    setFormError("");
    setNotice("");
    setModal("schedule");
  };

  const openComplete = (row) => {
    setSelected(row);
    setCompletion({ ...emptyCompletion });
    setFormError("");
    setNotice("");
    setModal("complete");
  };

  const changeForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const changeCompletion = (event) => {
    const { name, value } = event.target;
    setCompletion((current) => ({ ...current, [name]: value }));
  };

  const runMutation = async (operation, message, inModal = false) => {
    if (busyRef.current) return;

    busyRef.current = true;
    setSaving(true);
    setError("");
    setFormError("");
    setNotice("");

    try {
      await operation();
      setModal(null);
      setSelected(null);
      setNotice(message);
      await loadData();
    } catch (err) {
      if (inModal) {
        setFormError(errorMessage(err));
      } else {
        setError(errorMessage(err));
      }
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  };

  const saveSchedule = (event) => {
    event.preventDefault();
    setFormError("");

    if (
      !form.vehicle_id ||
      !form.garage_id ||
      !form.service_type.trim() ||
      !form.due_date
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (!validCost(form.estimated_cost)) {
      setFormError(
        "Enter an estimated cost greater than 0, up to 99,999,999.99, with at most 2 decimal places."
      );
      return;
    }

    const data = {
      vehicle_id: Number(form.vehicle_id),
      garage_id: Number(form.garage_id),
      service_type: form.service_type.trim(),
      due_date: form.due_date,
      estimated_cost: form.estimated_cost,
    };

    runMutation(
      () =>
        selected
          ? scheduleService.update(selected.id, data)
          : scheduleService.create(data),
      selected ? "Schedule updated." : "Schedule created.",
      true
    );
  };

  const completeSchedule = (event) => {
    event.preventDefault();
    setFormError("");

    if (!completion.service_date || !validCost(completion.actual_cost)) {
      setFormError("Enter a service date and a valid positive actual cost.");
      return;
    }

    if (
      completion.next_service_date &&
      completion.next_service_date < completion.service_date
    ) {
      setFormError("Next service date cannot be before the service date.");
      return;
    }

    runMutation(
      () =>
        scheduleService.complete(selected.id, {
          service_date: completion.service_date,
          actual_cost: completion.actual_cost,
          next_service_date: completion.next_service_date || null,
          description: completion.description.trim() || null,
        }),
      "Service completed. The actual cost was saved in Maintenance Logs.",
      true
    );
  };

  const cancelSchedule = (row) => {
    if (!window.confirm("Cancel this service schedule?")) return;

    runMutation(
      () => scheduleService.cancel(row.id),
      "Schedule cancelled."
    );
  };

  const deleteSchedule = (row) => {
    if (!window.confirm("Permanently delete this service schedule?")) return;

    runMutation(
      () => scheduleService.remove(row.id),
      "Schedule deleted."
    );
  };

  const availableVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.status === "ACTIVE" ||
      (selected && Number(vehicle.id) === Number(selected.vehicle_id))
  );

  const availableGarages = garages.filter(
    (garage) =>
      garage.status === "ACTIVE" ||
      (selected && Number(garage.id) === Number(selected.garage_id))
  );

  const columns = [
    { key: "vehicle_number", label: "Vehicle" },
    { key: "service_type", label: "Service Type" },
    { key: "due_date", label: "Scheduled Date" },
    {
      key: "garage_name",
      label: "Garage",
      render: (row) => row.garage_name || "—",
    },
    {
      key: "estimated_cost",
      label: "Estimated Cost",
      render: (row) =>
        `Rs. ${Number(row.estimated_cost).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge value={row.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        const linked = row.maintenance_id != null;
        const editable =
          !linked && ["UPCOMING", "OVERDUE"].includes(row.status);
        const deletable = !linked && row.status !== "COMPLETED";

        return (
          <div className="d-flex gap-2 flex-wrap">
            {editable && (
              <>
                <button
                  className="btn btn-sm btn-outline-primary"
                  disabled={saving || loading}
                  onClick={() => openEdit(row)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-success"
                  disabled={saving || loading}
                  onClick={() => openComplete(row)}
                >
                  Complete
                </button>
                <button
                  className="btn btn-sm btn-outline-warning"
                  disabled={saving || loading}
                  onClick={() => cancelSchedule(row)}
                >
                  Cancel
                </button>
              </>
            )}
            {deletable && (
              <button
                className="btn btn-sm btn-outline-danger"
                disabled={saving || loading}
                onClick={() => deleteSchedule(row)}
              >
                Delete
              </button>
            )}
            {!deletable && (
              <span className="text-muted">
                {linked
                  ? `Maintenance #${row.maintenance_id}`
                  : "Completed"}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Service Schedule"
        subtitle="Plan services and record their completion."
        action={
          <button
            className="btn btn-primary"
            disabled={loading || saving || Boolean(error)}
            onClick={openAdd}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Schedule Service
          </button>
        }
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="card">
        <div className="card-body border-bottom">
          <button
            className="btn btn-outline-secondary"
            disabled={loading || saving}
            onClick={loadData}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="p-3">Loading schedules...</div>
        ) : (
          <>
            {error && (
              <div className="p-3 text-danger">
                Could not refresh data. Click Refresh to try again.
              </div>
            )}
            <DataTable columns={columns} rows={schedules} />
          </>
        )}
      </div>

      {modal && (
        <>
          <div
            className="modal show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scheduleModalTitle"
          >
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <form
                  onSubmit={
                    modal === "complete" ? completeSchedule : saveSchedule
                  }
                >
                  <div className="modal-header">
                    <h5 className="modal-title" id="scheduleModalTitle">
                      {modal === "complete"
                        ? "Complete Service"
                        : selected
                          ? "Edit Service Schedule"
                          : "Schedule Service"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      disabled={saving}
                      onClick={closeModal}
                    ></button>
                  </div>

                  <div className="modal-body">
                    {formError && (
                      <div className="alert alert-danger">{formError}</div>
                    )}

                    <fieldset disabled={saving}>
                      {modal === "schedule" ? (
                        <>
                          <div className="mb-3">
                            <label htmlFor="vehicleId" className="form-label">
                              Vehicle
                            </label>
                            <select
                              id="vehicleId"
                              name="vehicle_id"
                              className="form-select"
                              value={form.vehicle_id}
                              onChange={changeForm}
                              required
                            >
                              <option value="">Select Vehicle</option>
                              {availableVehicles.map((vehicle) => (
                                <option key={vehicle.id} value={vehicle.id}>
                                  {vehicle.registration_number}
                                  {vehicle.status !== "ACTIVE"
                                    ? " (currently inactive)"
                                    : ""}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="serviceType" className="form-label">
                              Service Type
                            </label>
                            <input
                              id="serviceType"
                              name="service_type"
                              className="form-control"
                              list="serviceTypes"
                              maxLength={100}
                              value={form.service_type}
                              onChange={changeForm}
                              placeholder="Example: Oil Change"
                              required
                            />
                            <datalist id="serviceTypes">
                              {[
                                "Oil Change",
                                "Full Service",
                                "Brake Inspection",
                                "Engine Service",
                                "Battery Check",
                                "Tire Rotation",
                              ].map((type) => (
                                <option key={type} value={type} />
                              ))}
                            </datalist>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="dueDate" className="form-label">
                              Scheduled Date
                            </label>
                            <input
                              id="dueDate"
                              type="date"
                              name="due_date"
                              className="form-control"
                              value={form.due_date}
                              onChange={changeForm}
                              required
                            />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="garageId" className="form-label">
                              Garage
                            </label>
                            <select
                              id="garageId"
                              name="garage_id"
                              className="form-select"
                              value={form.garage_id}
                              onChange={changeForm}
                              required
                            >
                              <option value="">Select Garage</option>
                              {availableGarages.map((garage) => (
                                <option key={garage.id} value={garage.id}>
                                  {garage.name}
                                  {garage.status !== "ACTIVE"
                                    ? " (currently inactive)"
                                    : ""}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="estimatedCost" className="form-label">
                              Estimated Cost (Rs.)
                            </label>
                            <input
                              id="estimatedCost"
                              type="number"
                              name="estimated_cost"
                              className="form-control"
                              min="0.01"
                              max="99999999.99"
                              step="0.01"
                              value={form.estimated_cost}
                              onChange={changeForm}
                              required
                            />
                          </div>

                          <p className="text-muted mb-0">
                            Upcoming and Overdue are determined by the scheduled
                            date. Use Complete after the service is finished.
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            <strong>{selected.vehicle_number}</strong>
                            {" — "}
                            {selected.service_type}
                          </p>

                          <div className="mb-3">
                            <label htmlFor="serviceDate" className="form-label">
                              Actual Service Date
                            </label>
                            <input
                              id="serviceDate"
                              type="date"
                              name="service_date"
                              className="form-control"
                              value={completion.service_date}
                              onChange={changeCompletion}
                              required
                            />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="actualCost" className="form-label">
                              Actual Cost (Rs.)
                            </label>
                            <input
                              id="actualCost"
                              type="number"
                              name="actual_cost"
                              className="form-control"
                              min="0.01"
                              max="99999999.99"
                              step="0.01"
                              value={completion.actual_cost}
                              onChange={changeCompletion}
                              required
                            />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="nextDate" className="form-label">
                              Next Service Date (optional)
                            </label>
                            <input
                              id="nextDate"
                              type="date"
                              name="next_service_date"
                              className="form-control"
                              min={completion.service_date || undefined}
                              value={completion.next_service_date}
                              onChange={changeCompletion}
                            />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="description" className="form-label">
                              Description (optional)
                            </label>
                            <textarea
                              id="description"
                              name="description"
                              className="form-control"
                              rows={3}
                              value={completion.description}
                              onChange={changeCompletion}
                            />
                          </div>

                          <p className="text-muted mb-0">
                            Completing this service creates a Maintenance Log
                            with the actual cost entered above.
                          </p>
                        </>
                      )}
                    </fieldset>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={saving}
                      onClick={closeModal}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : modal === "complete"
                          ? "Complete Service"
                          : selected
                            ? "Update Schedule"
                            : "Save Schedule"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </>
  );
}