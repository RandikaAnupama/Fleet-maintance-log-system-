import { useState } from "react";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

const emptyForm = {
  vehicle: "",
  service: "",
  date: "",
  garage: "",
  cost: "",
  status: "UPCOMING",
};

export default function ServiceSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.vehicle ||
      !formData.service ||
      !formData.date ||
      !formData.garage ||
      !formData.cost ||
      !formData.status
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const numericCost = Number(formData.cost);

    if (Number.isNaN(numericCost) || numericCost <= 0) {
      alert("Estimated cost must be greater than 0.");
      return;
    }

    if (editingId !== null) {
      setSchedules((currentSchedules) =>
        currentSchedules.map((schedule) =>
          schedule.id === editingId
            ? {
                ...schedule,
                vehicle: formData.vehicle,
                service: formData.service,
                date: formData.date,
                garage: formData.garage,
                cost: numericCost,
                status: formData.status,
              }
            : schedule
        )
      );
    } else {
      const newSchedule = {
        id: Date.now(),
        vehicle: formData.vehicle,
        service: formData.service,
        date: formData.date,
        garage: formData.garage,
        cost: numericCost,
        status: formData.status,
      };

      setSchedules((currentSchedules) => [
        ...currentSchedules,
        newSchedule,
      ]);
    }

    handleCloseModal();
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);

    setFormData({
      vehicle: schedule.vehicle,
      service: schedule.service,
      date: schedule.date,
      garage: schedule.garage,
      cost: String(schedule.cost),
      status: schedule.status,
    });

    setShowModal(true);
  };

  const handleComplete = (id) => {
    const confirmed = window.confirm(
      "Mark this service schedule as completed?"
    );

    if (!confirmed) {
      return;
    }

    setSchedules((currentSchedules) =>
      currentSchedules.map((schedule) =>
        schedule.id === id
          ? {
              ...schedule,
              status: "COMPLETED",
            }
          : schedule
      )
    );
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service schedule?"
    );

    if (!confirmed) {
      return;
    }

    setSchedules((currentSchedules) =>
      currentSchedules.filter((schedule) => schedule.id !== id)
    );
  };

  const columns = [
    {
      key: "vehicle",
      label: "Vehicle",
    },
    {
      key: "service",
      label: "Service Type",
    },
    {
      key: "date",
      label: "Scheduled Date",
    },
    {
      key: "garage",
      label: "Garage",
    },
    {
      key: "cost",
      label: "Estimated Cost",
      render: (row) => `Rs. ${Number(row.cost).toLocaleString()}`,
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
        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleEdit(row)}
          >
            Edit
          </button>

          {row.status !== "COMPLETED" && (
            <button
              type="button"
              className="btn btn-sm btn-outline-success"
              onClick={() => handleComplete(row.id)}
            >
              Complete
            </button>
          )}

          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Service Schedule"
        subtitle="Plan upcoming maintenance and reminders."
        action={
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenAddModal}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Schedule Service
          </button>
        }
      />

      <div className="card">
        <DataTable columns={columns} rows={schedules} />
      </div>

      {showModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingId !== null
                        ? "Edit Service Schedule"
                        : "Schedule Service"}
                    </h5>

                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseModal}
                    ></button>
                  </div>

                  <div className="modal-body">
                    <div className="mb-3">
                      <label
                        htmlFor="scheduleVehicle"
                        className="form-label"
                      >
                        Vehicle
                      </label>

                      <select
                        id="scheduleVehicle"
                        className="form-select"
                        name="vehicle"
                        value={formData.vehicle}
                        onChange={handleChange}
                      >
                        <option value="">Select Vehicle</option>
                        <option value="CAB-1234">CAB-1234</option>
                        <option value="CAD-5678">CAD-5678</option>
                        <option value="CAB-4567">CAB-4567</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="scheduleService"
                        className="form-label"
                      >
                        Service Type
                      </label>

                      <select
                        id="scheduleService"
                        className="form-select"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                      >
                        <option value="">Select Service</option>
                        <option value="Oil Change">Oil Change</option>
                        <option value="Full Service">Full Service</option>
                        <option value="Brake Inspection">
                          Brake Inspection
                        </option>
                        <option value="Engine Service">
                          Engine Service
                        </option>
                        <option value="Battery Check">
                          Battery Check
                        </option>
                        <option value="Tire Rotation">
                          Tire Rotation
                        </option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="scheduleDate"
                        className="form-label"
                      >
                        Scheduled Date
                      </label>

                      <input
                        id="scheduleDate"
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="scheduleGarage"
                        className="form-label"
                      >
                        Garage
                      </label>

                      <select
                        id="scheduleGarage"
                        className="form-select"
                        name="garage"
                        value={formData.garage}
                        onChange={handleChange}
                      >
                        <option value="">Select Garage</option>
                        <option value="Auto Care">Auto Care</option>
                        <option value="Speed Motors">
                          Speed Motors
                        </option>
                        <option value="City Garage">
                          City Garage
                        </option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="scheduleCost"
                        className="form-label"
                      >
                        Estimated Cost
                      </label>

                      <input
                        id="scheduleCost"
                        type="number"
                        className="form-control"
                        name="cost"
                        min="1"
                        step="0.01"
                        placeholder="Enter estimated cost"
                        value={formData.cost}
                        onChange={handleChange}
                        onKeyDown={(event) => {
                          if (
                            event.key === "-" ||
                            event.key === "e" ||
                            event.key === "E" ||
                            event.key === "+"
                          ) {
                            event.preventDefault();
                          }
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="scheduleStatus"
                        className="form-label"
                      >
                        Status
                      </label>

                      <select
                        id="scheduleStatus"
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="UPCOMING">Upcoming</option>
                        <option value="OVERDUE">Overdue</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      {editingId !== null
                        ? "Update Schedule"
                        : "Save Schedule"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
}