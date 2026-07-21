import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const adminItems = [
  ["Dashboard", "/dashboard", "bi-speedometer2"],
  ["Vehicles", "/vehicles", "bi-truck"],
  ["Drivers", "/drivers", "bi-person-badge"],
  ["Issues", "/issues", "bi-exclamation-triangle"],
  ["Maintenance", "/maintenance", "bi-tools"],
  ["Fuel Logs", "/fuel-logs", "bi-fuel-pump"],
  ["Repair Logs", "/repair-logs", "bi-wrench-adjustable"],
  ["Service Schedule", "/service-schedules", "bi-calendar-check"],
  ["Reports", "/reports", "bi-file-earmark-bar-graph"],
  ["Users", "/users", "bi-people"]
];

const userItems = [
  ["Dashboard", "/dashboard", "bi-speedometer2"],
  ["My Vehicle", "/my-vehicle", "bi-truck"],
  ["Maintenance History", "/maintenance-history", "bi-clock-history"],
  ["Report Issue", "/report-issue", "bi-exclamation-triangle"]
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = user?.role === "ADMIN" ? adminItems : userItems;

  return (
    <>
      {open && <div className="sidebar-backdrop d-lg-none" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <i className="bi bi-truck-front-fill"></i>
          <div>
            <strong>Fleet Log</strong>
            <small>Maintenance System</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map(([label, path, icon]) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => isActive ? "active" : ""}
            >
              <i className={`bi ${icon}`}></i>
              <span>{label}</span>
            </NavLink>
          ))}
          <NavLink to="/profile" onClick={onClose}>
            <i className="bi bi-person-circle"></i>
            <span>Profile</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
