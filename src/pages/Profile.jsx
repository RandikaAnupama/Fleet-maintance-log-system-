import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: "0771234567" });
  const [message, setMessage] = useState("");

  return <>
    <PageHeader title="Profile" subtitle="View and update account information." />
    <div className="card profile-card">
      <div className="card-body">
        {message && <div className="alert alert-success">{message}</div>}
        <div className="profile-avatar"><i className="bi bi-person"></i></div>
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" value={form.email} disabled /></div>
          <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Role</label><input className="form-control" value={user?.role || ""} disabled /></div>
        </div>
        <button className="btn btn-primary mt-4" onClick={() => setMessage("Profile updated in the frontend demo.")}>Save Changes</button>
      </div>
    </div>
  </>;
}
