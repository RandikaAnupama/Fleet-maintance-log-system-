import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6) next.password = "Password must contain at least 6 characters.";
    return next;
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setServerError("");
    if (Object.keys(nextErrors).length) return;

    try {
      setLoading(true);
      await login(form);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (error) {
      setServerError(error.response?.data?.message || error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <i className="bi bi-truck-front-fill"></i>
          <div>
            <h2>Fleet Maintenance</h2>
            <p>Log System</p>
          </div>
        </div>

        <h3 className="mt-4">Welcome back</h3>
        <p className="text-muted">Admin and normal users log in from the same page.</p>

        {serverError && <div className="alert alert-danger">{serverError}</div>}

        <form onSubmit={submit} noValidate>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@example.com"
            />
            <div className="invalid-feedback">{errors.email}</div>
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
            />
            <div className="invalid-feedback">{errors.password}</div>
          </div>

          <button className="btn btn-primary w-100 py-2" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="demo-box mt-4">
          <strong>Demo accounts</strong>
          <small>Admin: admin@fleet.com / admin123</small>
          <small>User: user@fleet.com / user123</small>
        </div>
      </div>

      <div className="login-visual">
        <div>
          <span className="eyebrow">UNIVERSITY SOFTWARE PROJECT</span>
          <h1>One application.<br />Two user roles.</h1>
          <p>The sidebar, dashboard cards, pages and actions change automatically according to the role returned by the REST API.</p>
        </div>
      </div>
    </div>
  );
}
