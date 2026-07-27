import { useState } from "react";
import { repairsSeed } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

export default function RepairLogs() {
  const [showModal, setShowModal] = useState(false);
  const [rows, setRows] = useState(repairsSeed);

  const [garages, setGarages] = useState([
    "ABC Motors",
    "City Auto Care",
    "Auto Fix Garage",
    "Prime Service Center",
  ]);

  const [newGarage, setNewGarage] = useState("");
  const [showGarageModal, setShowGarageModal] = useState(false);
  const [formData, setFormData] = useState({
  vehicle: "",
  date: "",
  garage: "",
  description: "",
  cost: "",
  status: "OPEN",
});

  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));

  if (name === "garage" && value === "ADD_NEW") {
  setShowGarageModal(true);
}
};

const handleAddGarage = () => {
  const garageName = newGarage.trim();
  if (!garageName) {
    alert("Please enter a garage name.");
    return;
  }
  if (
    garages.some(
      (garage) => garage.toLowerCase() === garageName.toLowerCase()
    )
  ) {
    alert("This garage already exists.");
    return;
  }

  setGarages((prevGarages) => [...prevGarages, garageName]);

  setFormData((prevData) => ({
    ...prevData,
    garage: garageName,
  }));

  setNewGarage("");
  setShowGarageModal(false);
};

const handleSave = () => {
  if (
    !formData.vehicle.trim() ||
    !formData.date ||
    !formData.garage.trim() ||
    !formData.description.trim() ||
    !formData.cost ||
    !formData.status
  ) {
    alert("Please fill in all fields.");
    return;
  }

  if (Number(formData.cost) <= 0) {
    alert("Cost must be greater than 0.");
    return;
  }

  const newRepair = {
    id: Date.now(),
    vehicle: formData.vehicle,
    date: formData.date,
    garage: formData.garage,
    description: formData.description,
    cost: Number(formData.cost),
    status: formData.status,
  };

  setRows((prevRows) => [...prevRows, newRepair]);

  setFormData({
    vehicle: "",
    date: "",
    garage: "",
    description: "",
    cost: "",
    status: "OPEN",
  });

  setShowModal(false);
};
  const columns = [
    { key: "vehicle", label: "Vehicle" },
    { key: "date", label: "Repair Date" },
    { key: "garage", label: "Garage" },
    { key: "description", label: "Description" },
    { key: "cost", label: "Cost", render: (r) => `Rs. ${r.cost.toLocaleString()}` },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> }
  ];
  return <>
    <PageHeader title="Repair Logs" 
    subtitle="Record vehicle repairs and costs." 
    action={
    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
      <i className="bi bi-plus-lg me-1"></i>
      Add Repair
    </button>
    }    />
    <div className="card"><DataTable columns={columns} rows={rows} /></div>
    {showModal && (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">

        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Repair</h5>
            <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
          </div>

          <div className="modal-body px-4 py-3">
          <div className="container-fluid px-3">
           <div className="mb-3">
             <label className="form-label">Vehicle</label>
             <input type="text" className="form-control" name="vehicle" value={formData.vehicle} onChange={handleChange} placeholder="Enter vehicle number"/>
          </div>
    
          <div className="mb-3">
            <label className="form-label">Repair Date</label>
            <input type="date" className="form-control" name="date" value={formData.date} onChange={handleChange}/>
          </div>

          <div className="mb-3">
            <label className="form-label">Garage</label>
              <select className="form-select" name="garage" value={formData.garage} onChange={handleChange}>
                <option value="">Select Garage</option>
                {garages.map((garage) => (
                  <option key={garage} value={garage}>
                    {garage}
                </option>
                ))}
                <option value="ADD_NEW">+ Add New Garage</option>
              </select>

          </div>
        </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} placeholder="Enter repair description" style={{height:"80px",resize: "none",}}>    
            </textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Cost (Rs.)</label>
            <input type="number" className="form-control" name="cost" value={formData.cost} onChange={handleChange} placeholder="Enter repair cost"/>
          </div>

          <div className="mb-3">
            <label className="form-label">Status</label>
            <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
              <option value="OPEN">OPEN</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
          </div>

          <div className="modal-footer">

            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>

            <button className="btn btn-primary" onClick={handleSave}>
              Save Repair
            </button>

          </div>

      </div>
      </div>
        </div>
)}

{showGarageModal && (
  <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        
        <div className="modal-header">
          <h5 className="modal-title">Add New Garage</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowGarageModal(false)}
          ></button>
        </div>

        <div className="modal-body">
          <label className="form-label">Garage Name</label>
          <input
            type="text"
            className="form-control"
            value={newGarage}
            onChange={(e) => setNewGarage(e.target.value)}
            placeholder="Enter garage name"
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={() => setShowGarageModal(false)}>
            Cancel
          </button>

          <button type="button" className="btn btn-primary" onClick={handleAddGarage}>
            Add Garage
          </button>
        </div>

      </div>
    </div>
  </div>
)}

  </>;
}