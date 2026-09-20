import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export default function Profile() {
  const { token, updateUser, logout } = useAuth();

  return (
    <ProfileForm
      key={token || "signed-out"}
      token={token}
      updateUser={updateUser}
      logout={logout}
    />
  );
}

function ProfileForm({ token, updateUser, logout }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reload, setReload] = useState(0);

  const mounted = useRef(false);
  const submitting = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json().catch(() => null);

        if (!active) return;

        if (response.status === 401) {
          logout();
          return;
        }

        if (!response.ok || !data?.success || !data.user) {
          throw new Error(data?.message || "Failed to load profile.");
        }

        setProfile(data.user);
        setForm({
          full_name: data.user.full_name || "",
          phone: data.user.phone || "",
        });
      } catch (err) {
        if (active && err.name !== "AbortError") {
          setError(err.message || "Unable to connect to the server.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (token) {
      loadProfile();
    } else {
      setError("Please log in to view your profile.");
      setLoading(false);
    }

    return () => {
      active = false;
      controller.abort();
    };
  }, [token, logout, reload]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting.current || loading || !profile) return;

    const fullName = form.full_name.trim();
    const phone = form.phone.trim();

    setError("");
    setMessage("");

    if (fullName.length < 3 || fullName.length > 100) {
      setError("Full name must contain 3–100 characters.");
      return;
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    submitting.current = true;
    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone || null,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!mounted.current) return;

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok || !data?.success || !data.user) {
        throw new Error(data?.message || "Failed to update profile.");
      }

      setProfile(data.user);
      setForm({
        full_name: data.user.full_name || "",
        phone: data.user.phone || "",
      });

      updateUser(data.user);
      setMessage("Profile updated successfully.");
    } catch (err) {
      if (mounted.current) {
        setError(err.message || "Unable to connect to the server.");
      }
    } finally {
      submitting.current = false;

      if (mounted.current) setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="View and update your account information."
      />

      <div className="card profile-card">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="alert alert-success" role="status">
              {message}
            </div>
          )}

          {loading ? (
            <p className="text-muted mb-0">Loading profile...</p>
          ) : !profile ? (
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setReload((value) => value + 1)}
              disabled={!token}
            >
              Retry
            </button>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="profile-avatar">
                <i className="bi bi-person"></i>
              </div>

              <fieldset disabled={saving}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="profile-name" className="form-label">
                      Full Name
                    </label>
                    <input
                      id="profile-name"
                      name="full_name"
                      className="form-control"
                      value={form.full_name}
                      onChange={handleChange}
                      autoComplete="name"
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="profile-email" className="form-label">
                      Email
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      className="form-control"
                      value={profile.email || ""}
                      disabled
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="profile-phone" className="form-label">
                      Phone
                    </label>
                    <input
                      id="profile-phone"
                      name="phone"
                      type="tel"
                      className="form-control"
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      placeholder="0771234567"
                      maxLength={10}
                      aria-describedby="profile-phone-help"
                    />
                    <div id="profile-phone-help" className="form-text">
                      Optional. Enter a 10-digit phone number.
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="profile-role" className="form-label">
                      Role
                    </label>
                    <input
                      id="profile-role"
                      className="form-control"
                      value={profile.role || ""}
                      disabled
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary mt-4"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </fieldset>
            </form>
          )}
        </div>
      </div>
    </>
  );
}