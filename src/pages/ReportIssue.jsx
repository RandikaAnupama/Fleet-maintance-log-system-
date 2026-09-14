import { useEffect, useRef, useState } from "react";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import issueService from "../services/issueService";

const emptyForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
};

const getError = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Request failed. Please try again.";

export default function ReportIssue() {
  const [issues, setIssues] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const submitting = useRef(false);

  const loadData = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [vehicleResponse, issueRows] = await Promise.all([
        api.get("/my-vehicle"),
        issueService.getAll(),
      ]);

      setVehicle(vehicleResponse.data.vehicle);
      setIssues(issueRows);
    } catch (err) {
      setLoadError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const changeForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (submitting.current || loading || loadError) return;

    setError("");
    setSuccess("");

    if (!vehicle || vehicle.status === "INACTIVE") {
      setError("An assigned, non-inactive vehicle is required.");
      return;
    }

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title || !description) {
      setError("Issue title and description are required.");
      return;
    }

    if (title.length > 150) {
      setError("Issue title cannot exceed 150 characters.");
      return;
    }

    if (new TextEncoder().encode(description).length > 65535) {
      setError("Issue description is too long.");
      return;
    }

    submitting.current = true;
    setSaving(true);

    try {
      await issueService.create({
        title,
        description,
        priority: form.priority,
      });

      setForm({ ...emptyForm });
      setSuccess("Issue submitted successfully.");
      await loadData();
    } catch (err) {
      setError(getError(err));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  const columns = [
    { key: "title", label: "Issue" },
    {
      key: "vehicle_number",
      label: "Vehicle",
      render: (row) => row.vehicle_number || "Unavailable",
    },
    {
      key: "priority",
      label: "Priority",
      render: (row) => <StatusBadge value={row.priority} />,
    },
    { key: "reported_date", label: "Reported Date" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge value={row.status} />,
    },
  ];

  const formDisabled =
    loading ||
    saving ||
    Boolean(loadError) ||
    !vehicle ||
    vehicle.status === "INACTIVE";

  return (
    <>
      <PageHeader
        title="Report Vehicle Issue"
        subtitle="Submit a fault or maintenance concern to the administrator."
        action={
          <button
            className="btn btn-outline-secondary"
            disabled={loading || saving}
            onClick={loadData}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        }
      />

      {loadError && (
        <div className="alert alert-danger">
          {loadError} Click Refresh to try again.
        </div>
      )}

      {success && (
        <div className="alert alert-success">{success}</div>
      )}

      {!loading && !loadError && !vehicle && (
        <div className="alert alert-warning">
          No vehicle assigned. Please contact the administrator.
        </div>
      )}

      {!loading &&
        !loadError &&
        vehicle?.status === "INACTIVE" && (
          <div className="alert alert-warning">
            Your assigned vehicle is inactive. Please contact the
            administrator.
          </div>
        )}

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card">
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <form onSubmit={submit}>
                <fieldset disabled={formDisabled}>
                  <div className="mb-3">
                    <label
                      htmlFor="assignedVehicle"
                      className="form-label"
                    >
                      Assigned Vehicle
                    </label>
                    <input
                      id="assignedVehicle"
                      className="form-control"
                      value={vehicle?.registration_number || ""}
                      placeholder={
                        loading ? "Loading..." : "No vehicle assigned"
                      }
                      readOnly
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="issueTitle" className="form-label">
                      Issue Title
                    </label>
                    <input
                      id="issueTitle"
                      name="title"
                      className="form-control"
                      value={form.title}
                      onChange={changeForm}
                      maxLength={150}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="issueDescription"
                      className="form-label"
                    >
                      Description
                    </label>
                    <textarea
                      id="issueDescription"
                      name="description"
                      className="form-control"
                      rows={4}
                      value={form.description}
                      onChange={changeForm}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="issuePriority"
                      className="form-label"
                    >
                      Priority
                    </label>
                    <select
                      id="issuePriority"
                      name="priority"
                      className="form-select"
                      value={form.priority}
                      onChange={changeForm}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                  >
                    {saving ? "Submitting..." : "Submit Issue"}
                  </button>
                </fieldset>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card">
            <div className="card-header">My Reported Issues</div>
            {loading ? (
              <div className="p-3">Loading issues...</div>
            ) : (
              <DataTable columns={columns} rows={issues} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}