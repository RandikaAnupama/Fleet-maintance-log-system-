import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const USERS_STORAGE_KEY = "fleet_users";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      general: "",
    }));

    setSuccessMessage("");
  };

  const validateForm = () => {
    const newErrors = {};
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
      newErrors.name = "Full name is required.";
    } else if (name.length < 3) {
      newErrors.name = "Name must contain at least 3 characters.";
    }

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      newErrors.password =
        "Password must contain at least 6 characters.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const email = form.email.trim().toLowerCase();

    let existingUsers = [];

    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);

      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);

        if (Array.isArray(parsedUsers)) {
          existingUsers = parsedUsers;
        }
      }
    } catch (error) {
      console.error("Failed to read users:", error);
    }

    const emailAlreadyExists = existingUsers.some(
      (user) =>
        String(user.email || "").toLowerCase() === email
    );

    if (emailAlreadyExists) {
      setErrors({
        email: "An account with this email already exists.",
      });
      return;
    }

    const newUser = {
      id: Date.now(),
      name: form.name.trim(),
      email,
      password: form.password,
      role: "USER",
      status: "ACTIVE",
    };

    const updatedUsers = [...existingUsers, newUser];

    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(updatedUsers)
    );

    setForm(initialForm);
    setErrors({});
    setSuccessMessage(
      "Account created successfully. Redirecting to login..."
    );

    setTimeout(() => {
      navigate("/login");
    }, 1200);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <div
        className="card shadow-sm border-0"
        style={{ width: "100%", maxWidth: "460px" }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="mb-3">
              <i className="bi bi-person-plus-fill fs-1 text-primary"></i>
            </div>

            <h2 className="fw-bold mb-2">Create Account</h2>

            <p className="text-muted mb-0">
              Register as a fleet system user.
            </p>
          </div>

          {successMessage && (
            <div className="alert alert-success">
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="alert alert-danger">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label">Full Name</label>

              <input
                type="text"
                name="name"
                className={`form-control ${
                  errors.name ? "is-invalid" : ""
                }`}
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />

              {errors.name && (
                <div className="invalid-feedback">
                  {errors.name}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Email Address</label>

              <input
                type="email"
                name="email"
                className={`form-control ${
                  errors.email ? "is-invalid" : ""
                }`}
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />

              {errors.email && (
                <div className="invalid-feedback">
                  {errors.email}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>

              <input
                type="password"
                name="password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
              />

              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">
                Confirm Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                className={`form-control ${
                  errors.confirmPassword ? "is-invalid" : ""
                }`}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
              />

              {errors.confirmPassword && (
                <div className="invalid-feedback">
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
            >
              <i className="bi bi-person-check me-2"></i>
              Create Account
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">
              Already have an account?{" "}
            </span>

            <Link
              to="/login"
              className="text-decoration-none fw-semibold"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}