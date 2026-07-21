import { useState } from "react";
import { driversSeed } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

export default function Drivers() {
  const [rows, setRows] = useState(driversSeed);
  const [showModal, setShowModal] = useState(false);

const [formData, setFormData] = useState({
  name: "",
  license: "",
  phone: "",
  vehicle: "",
  status: "ACTIVE"
});
  const handleSaveDriver = () => {
  const newDriver = {
    id: Date.now(),
    name: formData.name,
    license: formData.license,
    phone: formData.phone,
    vehicle: formData.vehicle || "Unassigned",
    status: "ACTIVE"
  };

  setRows([...rows, newDriver]);

  setFormData({
    name: "",
    license: "",
    phone: "",
    vehicle: "",
    status: "ACTIVE"
  });

  setShowModal(false);
};
  const columns = [
    { key: "name", label: "Driver Name" },
    { key: "license", label: "License Number" },
    { key: "phone", label: "Phone" },
    { key: "vehicle", label: "Assigned Vehicle" },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
    { key: "actions", label: "Actions", render: (r) => <button className="btn btn-sm btn-outline-danger" onClick={() => setRows(rows.filter(x => x.id !== r.id))}>Delete</button> }
  ];
  return (
  <>
    <PageHeader
      title="Driver Management"
      subtitle="Manage drivers and vehicle assignments."
      action={
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg me-1"></i>
          Add Driver
        </button>
      }
    />

    <div className="card">
      <DataTable columns={columns} rows={rows} />
    </div>

  {showModal && (
  <div
    className="modal d-block"
    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
  >
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Add Driver</h5>

          <button
            type="button"
            className="btn-close"
            onClick={() => setShowModal(false)}
          ></button>
        </div>

        <div className="modal-body">

  <div className="mb-3">
    <label className="form-label">Driver Name</label>
    <input
      type="text"
      className="form-control"
      value={formData.name}
      onChange={(e) =>
        setFormData({ ...formData, name: e.target.value })
      }
    />
  </div>

  <div className="mb-3">
    <label className="form-label">License Number</label>
    <input
      type="text"
      className="form-control"
      value={formData.license}
      onChange={(e) =>
        setFormData({ ...formData, license: e.target.value })
      }
    />
  </div>

  <div className="mb-3">
    <label className="form-label">Phone Number</label>
    <input
      type="text"
      className="form-control"
      value={formData.phone}
      onChange={(e) =>
        setFormData({ ...formData, phone: e.target.value })
      }
    />
  </div>

  <div className="mb-3">
    <label className="form-label">Assigned Vehicle</label>
    <input
      type="text"
      className="form-control"
      value={formData.vehicle}
      onChange={(e) =>
        setFormData({ ...formData, vehicle: e.target.value })
      }
    />
  </div>

</div>

        <div className="modal-footer">
  <button
    type="button"
    className="btn btn-secondary"
    onClick={() => setShowModal(false)}
  >
    Cancel
  </button>

  <button
    type="button"
    className="btn btn-primary"
    onClick={handleSaveDriver}
  >
    Save Driver
  </button>
</div>
      </div>
    </div>
  </div>
)}
  </>
);
}