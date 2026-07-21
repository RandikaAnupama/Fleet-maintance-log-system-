import { maintenanceSeed } from "../data/mockData";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

export default function Maintenance() {
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
  vehicle: "",
  type: "",
  date: "",
  nextDate: "",
  cost: "",
  status: "PENDING",
});

  const [rows, setRows] = useState(maintenanceSeed);
  const [editingMaintenance, setEditingMaintenance] = useState(null);

  const handleSaveMaintenance = () => {
  const newMaintenance = {
    id: Date.now(),
    vehicle: formData.vehicle,
    type: formData.type,
    date: formData.date,
    nextDate: formData.nextDate,
    cost: Number(formData.cost),
    status: formData.status,
  };

  setRows([...rows, newMaintenance]);

  setFormData({
    vehicle: "",
    type: "",
    date: "",
    nextDate: "",
    cost: "",
    status: "PENDING",
  });

  setShowModal(false);
};

  const columns = [
    { key: "vehicle", label: "Vehicle" },
    { key: "type", label: "Service Type" },
    { key: "date", label: "Service Date" },
    { key: "nextDate", label: "Next Service" },
    { key: "cost", label: "Cost", render: (r) => `Rs. ${r.cost.toLocaleString()}` },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
    { key: "actions", label: "Actions", render: () => <button className="btn btn-sm btn-outline-primary">Edit</button> }
  ];
  return <>
    <PageHeader title="Maintenance Logs" subtitle="Maintain the complete service history for each vehicle." action={<button className="btn btn-primary"  onClick={() => setShowModal(true)}><i className="bi bi-plus-lg me-1"></i>Add Maintenance</button>} />
    <div className="card"><DataTable columns={columns} rows={rows} /></div>
    <Modal
      show={showModal}
      title="Add Maintenance"
      onClose={() => setShowModal(false)}
      footer={
        <div className="d-flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSaveMaintenance}
          >
            Save
          </button>
        </div>
  }
>

    <div className="mb-3">
      <label className="form-label">Vehicle</label>
      <input
          type="text"
          className="form-control"
          value={formData.vehicle}
          onChange={(e) =>
            setFormData({ ...formData, vehicle: e.target.value })
          }
          placeholder="Enter vehicle number"
      />
    </div>

    <div className="mb-3">
      <label className="form-label">Service Type</label>
      <input
          type="text"
          className="form-control"
          value={formData.type}
          onChange={(e) =>
          setFormData({ ...formData, type: e.target.value })
          }
          placeholder="Example: Oil Change"
        />
    </div>

    <div className="mb-3">
      <label className="form-label">Service Date</label>
      <input
        type="date"
        className="form-control"
        value={formData.date}
        onChange={(e) =>
          setFormData({ ...formData, date: e.target.value })
        }
      />
    </div>
    <div className="mb-3">
      <label className="form-label">Next Service Date</label>
      <input
          type="date"
          className="form-control"
          value={formData.nextDate}
          onChange={(e) =>
            setFormData({ ...formData, nextDate: e.target.value })
            }
      />
    </div>

    <div className="mb-3">
      <label className="form-label">Cost (Rs.)</label>
      <input
          type="number"
          className="form-control"
          value={formData.cost}
          onChange={(e) =>
            setFormData({ ...formData, cost: e.target.value })
          }
          placeholder="Enter maintenance cost"
      />
    </div>

    <div className="mb-3">
      <label className="form-label">Status</label>
      <select
        className="form-select"
        value={formData.status}
        onChange={(e) =>
        setFormData({ ...formData, status: e.target.value })
        }
      >
      <option value="PENDING">Pending</option>
      <option value="COMPLETED">Completed</option>
      </select>
    </div>

    </Modal>
  </>;
}
