import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <button className="btn btn-light d-lg-none" onClick={onMenuClick} aria-label="Open menu">
        <i className="bi bi-list fs-4"></i>
      </button>

      <div>
        <h5 className="mb-0">Fleet Maintenance Log System</h5>
        <small className="text-muted">Manage maintenance records and service schedules</small>
      </div>

      <div className="ms-auto d-flex align-items-center gap-3">
        <span className={`badge ${user?.role === "ADMIN" ? "text-bg-primary" : "text-bg-success"}`}>
          {user?.role}
        </span>
        <div className="text-end d-none d-sm-block">
          <div className="fw-semibold">{user?.name}</div>
          <small className="text-muted">{user?.email}</small>
        </div>
        <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-1"></i>Logout
        </button>
      </div>
    </header>
  );
}
