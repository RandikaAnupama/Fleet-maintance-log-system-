import { useRef, useState } from "react";
import { Link } from "react-router-dom";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);

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
  };

  const validateForm = () => {
    const newErrors = {};
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.length < 3 || name.length > 100) {
      newErrors.name = "Full name must contain 3–100 characters.";
    }

    if (email.length > 100 || !emailPattern.test(email)) {
      newErrors.email = "Enter a valid email address, up to 100 characters.";
    }

    if (!form.password.trim() || form.password.length < 6) {
      newErrors.password = "Password must contain at least 6 characters.";
    } else if (new TextEncoder().encode(form.password).length > 72) {
      newErrors.password = "Password is too long. Please use a shorter password.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting.current || successMessage || !validateForm()) {
      return;
    }

    submitting.current = true;
    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        const message =
          data?.message || "Registration failed. Please try again.";

        if (response.status === 409) {
          setErrors({ email: message });
        } else {
          setErrors({ general: message });
        }

        return;
      }

      setForm(initialForm);
      setErrors({});
      setSuccessMessage(
        "Account created successfully. You can now log in."
      );
    } catch {
      setErrors({
        general:
          "Unable to connect to the server. Check your connection and try again.",
      });
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  const fields = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter your full name",
      autoComplete: "name",
      maxLength: 100,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter your email",
      autoComplete: "email",
      maxLength: 100,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Minimum 6 characters",
      autoComplete: "new-password",
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      placeholder: "Re-enter your password",
      autoComplete: "new-password",
    },
  ];

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <div
        className="card shadow-sm border-0"
        style={{ width: "100%", maxWidth: 460 }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <i className="bi bi-person-plus-fill fs-1 text-primary"></i>
            <h2 className="fw-bold mt-3 mb-2">Create Account</h2>
            <p className="text-muted mb-0">
              Register as a fleet system user.
            </p>
          </div>

          {successMessage ? (
            <>
              <div className="alert alert-success" role="status">
                {successMessage}
              </div>

              <Link to="/login" className="btn btn-primary w-100">
                Go to Login
              </Link>
            </>
          ) : (
            <>
              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <fieldset disabled={saving}>
                  {fields.map((field) => (
                    <div className="mb-3" key={field.name}>
                      <label
                        className="form-label"
                        htmlFor={`register-${field.name}`}
                      >
                        {field.label}
                      </label>

                      <input
                        id={`register-${field.name}`}
                        name={field.name}
                        type={field.type}
                        className={`form-control ${
                          errors[field.name] ? "is-invalid" : ""
                        }`}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete}
                        maxLength={field.maxLength}
                        aria-invalid={Boolean(errors[field.name])}
                        aria-describedby={
                          errors[field.name]
                            ? `register-${field.name}-error`
                            : undefined
                        }
                        required
                      />

                      {errors[field.name] && (
                        <div
                          id={`register-${field.name}-error`}
                          className="invalid-feedback"
                        >
                          {errors[field.name]}
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={saving}
                  >
                    {saving ? "Creating account..." : "Create Account"}
                  </button>
                </fieldset>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}