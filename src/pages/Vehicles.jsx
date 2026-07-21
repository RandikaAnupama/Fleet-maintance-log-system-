import { useMemo, useState } from "react";
import { vehiclesSeed } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

const emptyForm = { number: "", brand: "", model: "", year: "", mileage: "", status: "ACTIVE" };

export default function Vehicles() {
  const [rows, setRows] = useState(vehiclesSeed);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const filtered = useMemo(() => rows.filter((r) =>
    `${r.number} ${r.brand} ${r.model}`.toLowerCase().includes(search.toLowerCase())
  ), [rows, search]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setShow(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ ...row });
    setErrors({});
    setShow(true);
  };

  const validate = () => {
    const e = {};
    if (!form.number.trim()) e.number = "Vehicle number is required.";
    if (!form.brand.trim()) e.brand = "Brand is required.";
    if (!form.model.trim()) e.model = "Model is required.";
    if (!form.year || Number(form.year) < 1980) e.year = "Enter a valid year.";
    if (form.mileage === "" || Number(form.mileage) < 0) e.mileage = "Mileage cannot be negative.";
    return e;
  };

  const save = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    if (editingId) {
      setRows(rows.map((r) => r.id === editingId ? { ...form, id: editingId, year: Number(form.year), mileage: Number(form.mileage) } : r));
    } else {
      setRows([...rows, { ...form, id: Date.now(), year: Number(form.year), mileage: Number(form.mileage) }]);
    }
    setShow(false);
  };

  const remove = (id) => {
    if (window.confirm("Delete this vehicle record?")) setRows(rows.filter((r) => r.id !== id));
  };

  const columns = [
    { key: "number", label: "Vehicle No." },
    { key: "brand", label: "Brand" },
    { key: "model", label: "Model" },
    { key: "year", label: "Year" },
    { key: "mileage", label: "Mileage", render: (r) => `${r.mileage.toLocaleString()} km` },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
    {
      key: "actions", label: "Actions", render: (r) => (
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(r)}>Edit</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => remove(r.id)}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Vehicle Management"
        subtitle="Create, view, update and delete vehicle records through the REST API."
        action={<button className="btn btn-primary" onClick={openNew}><i className="bi bi-plus-lg me-1"></i>Add Vehicle</button>}
      />

      <div className="card">
        <div className="card-body border-bottom">
          <input className="form-control search-box" placeholder="Search vehicle number, brand or model" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <DataTable columns={columns} rows={filtered} />
      </div>

      <Modal
        show={show}
        title={editingId ? "Edit Vehicle" : "Add Vehicle"}
        onClose={() => setShow(false)}
        footer={<><button className="btn btn-light" onClick={() => setShow(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}
      >
        <div className="row g-3">
          {[
            ["number", "Vehicle Number", "text"],
            ["brand", "Brand", "text"],
            ["model", "Model", "text"],
            ["year", "Year", "number"],
            ["mileage", "Current Mileage", "number"]
          ].map(([key, label, type]) => (
            <div className="col-md-6" key={key}>
              <label className="form-label">{label}</label>
              <input type={type} className={`form-control ${errors[key] ? "is-invalid" : ""}`} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              <div className="invalid-feedback">{errors[key]}</div>
            </div>
          ))}
          <div className="col-md-6">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
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
