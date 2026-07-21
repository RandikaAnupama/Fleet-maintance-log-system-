import { useState } from "react";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { useIssues } from "../context/IssueContext";

export default function ReportIssue() {
  const { issues, addIssue } = useIssues();

  const assignedVehicle = "CAB-1234";

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM"
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const myIssues = issues.filter(
    (issue) => issue.vehicle === assignedVehicle
  );

  const submit = (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      setError("Issue title and description are required.");
      setSuccess("");
      return;
    }

    addIssue({
      title: form.title,
      description: form.description,
      priority: form.priority,
      vehicle: assignedVehicle,
      reportedBy: "Kamal Perera"
    });

    setForm({
      title: "",
      description: "",
      priority: "MEDIUM"
    });

    setError("");
    setSuccess("Issue submitted successfully.");
  };

  const columns = [
    {
      key: "title",
      label: "Issue"
    },
    {
      key: "vehicle",
      label: "Vehicle"
    },
    {
      key: "priority",
      label: "Priority",
      render: (row) => (
        <StatusBadge value={row.priority} />
      )
    },
    {
      key: "date",
      label: "Reported Date"
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge value={row.status} />
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Report Vehicle Issue"
        subtitle="Submit a fault or maintenance concern to the administrator."
      />

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card">
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

              <form onSubmit={submit}>
                <div className="mb-3">
                  <label className="form-label">
                    Assigned Vehicle
                  </label>

                  <input
                    className="form-control"
                    value={assignedVehicle}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Issue Title
                  </label>

                  <input
                    className="form-control"
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value
                      })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Description
                  </label>

                  <textarea
                    className="form-control"
                    rows="4"
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value
                      })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Priority
                  </label>

                  <select
                    className="form-select"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value
                      })
                    }
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
                  Submit Issue
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card">
            <DataTable
              columns={columns}
              rows={myIssues}
            />
          </div>
        </div>
      </div>
    </>
  );
}