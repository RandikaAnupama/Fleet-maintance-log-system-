import { useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import driverService from "../services/driverService";

const emptyForm = {
  full_name: "",
  license_number: "",
  phone: "",
  email: "",
  address: "",
  status: "ACTIVE",
};

const getError = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Request failed. Please try again.";

export default function Drivers() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const mutationBusy = useRef(false);

  const loadDrivers = async () => {
    setLoading(true);
    setError("");

    try {
      setRows(await driverService.getAll());
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter(
      (row) =>
        `${row.full_name || ""} ${row.license_number || ""} ${row.phone || ""}`
          .toLowerCase()
          .includes(term) &&
        (statusFilter === "ALL" || row.status === statusFilter)
    );
  }, [rows, search, statusFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      full_name: row.full_name || "",
      license_number: row.license_number || "",
      phone: row.phone || "",
      email: row.email || "",
      address: row.address || "",
      status: row.status || "ACTIVE",
    });
    setFormError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (mutationBusy.current) return;
    setShowModal(false);
    setFormError("");
  };

  const changeForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const saveDriver = async (event) => {
    event.preventDefault();

    if (mutationBusy.current) return;

    setFormError("");

    const data = {
      full_name: form.full_name.trim(),
      license_number: form.license_number.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      status: form.status,
    };

    if (!data.full_name || !data.license_number) {
      setFormError("Full name and license number are required.");
      return;
    }

    if (data.phone && !/^[0-9]{10}$/.test(data.phone)) {
      setFormError("Phone number must contain 10 digits.");
      return;
    }

    if (
      data.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
    ) {
      setFormError("Enter a valid email address.");
      return;
    }

    mutationBusy.current = true;
    setSaving(true);
    setSuccess("");

    try {
      if (editingId !== null) {
        await driverService.update(editingId, data);
      } else {
        await driverService.create(data);
      }

      setShowModal(false);
      setSuccess(
        editingId !== null ? "Driver updated." : "Driver created."
      );
      await loadDrivers();
    } catch (err) {
      setFormError(getError(err));
    } finally {
      mutationBusy.current = false;
      setSaving(false);
    }
  };

  const deactivate = async (row) => {
    if (mutationBusy.current) return;

    if (!window.confirm(`Deactivate ${row.full_name}?`)) return;

    mutationBusy.current = true;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await driverService.deactivate(row.id);
      setSuccess("Driver deactivated.");
      await loadDrivers();
    } catch (err) {
      setError(getError(err));
    } finally {
      mutationBusy.current = false;
      setSaving(false);
    }
  };

  const busy = loading || saving;

  const columns = [
    { key: "full_name", label: "Driver Name" },
    { key: "license_number", label: "License Number" },
    {
      key: "phone",
      label: "Phone",
      render: (row) => row.phone || "—",
    },
    {
      key: "email",
      label: "Email",
      render: (row) => row.email || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge value={row.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={busy || Boolean(error)}
            onClick={() => openEdit(row)}
          >
            Edit
          </button>

          {row.status === "ACTIVE" && (
            <button
              className="btn btn-sm btn-outline-danger"
              disabled={busy || Boolean(error)}
              onClick={() => deactivate(row)}
            >
              Deactivate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Driver Management"
        subtitle="Manage driver details and account status."
        action={
          <button
            className="btn btn-primary"
            disabled={busy || Boolean(error)}
            onClick={openAdd}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Add Driver
          </button>
        }
      />

      {error && (
        <div className="alert alert-danger">
          {error} Click Refresh to reload the latest data.
        </div>
      )}

      {success && (
        <div className="alert alert-success">{success}</div>
      )}

      <div className="card">
        <div className="card-body border-bottom">
          <div className="row g-2">
            <div className="col-md-7">
              <input
                className="form-control"
                placeholder="Search name, license or phone"
                aria-label="Search drivers"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                aria-label="Filter by driver status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary"
                disabled={busy}
                onClick={loadDrivers}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-3">Loading drivers...</div>
        ) : (
          <div className="table-responsive">
            <DataTable columns={columns} rows={filtered} />
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="driverModalTitle"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={saveDriver}>
                <div className="modal-header">
                  <h5 className="modal-title" id="driverModalTitle">
                    {editingId !== null ? "Edit Driver" : "Add Driver"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    disabled={saving}
                    onClick={closeModal}
                  ></button>
                </div>

                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger">
                      {formError}
                    </div>
                  )}

                  <fieldset disabled={saving}>
                    <div className="row g-3">
                      {[
                        ["full_name", "Driver Name", "text", 100, true],
                        ["license_number", "License Number", "text", 50, true],
                        ["phone", "Phone (optional)", "tel", 10, false],
                        ["email", "Email (optional)", "email", 100, false],
                      ].map(([name, label, type, maxLength, required]) => (
                        <div className="col-md-6" key={name}>
                          <label
                            htmlFor={`driver-${name}`}
                            className="form-label"
                          >
                            {label}
                          </label>
                          <input
                            id={`driver-${name}`}
                            name={name}
                            type={type}
                            className="form-control"
                            maxLength={maxLength}
                            required={required}
                            value={form[name]}
                            onChange={changeForm}
                          />
                        </div>
                      ))}

                      <div className="col-12">
                        <label
                          htmlFor="driver-address"
                          className="form-label"
                        >
                          Address (optional)
                        </label>
                        <textarea
                          id="driver-address"
                          name="address"
                          className="form-control"
                          rows={3}
                          value={form.address}
                          onChange={changeForm}
                        />
                      </div>

                      <div className="col-md-6">
                        <label
                          htmlFor="driver-status"
                          className="form-label"
                        >
                          Status
                        </label>
                        <select
                          id="driver-status"
                          name="status"
                          className="form-select"
                          value={form.status}
                          onChange={changeForm}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </fieldset>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={saving}
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Driver"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}