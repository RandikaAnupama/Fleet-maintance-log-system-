import { useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import userService from "../services/userService";

const PAGE_SIZE = 5;

const getError = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Request failed. Please try again.";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const mutationBusy = useRef(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [userRows, vehicleResponse] = await Promise.all([
        userService.getAll(),
        api.get("/vehicles"),
      ]);

      setUsers(userRows);
      setVehicles(vehicleResponse.data.vehicles);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        `${user.full_name || ""} ${user.email || ""}`
          .toLowerCase()
          .includes(term);

      return (
        matchesSearch &&
        (roleFilter === "ALL" || user.role === roleFilter) &&
        (statusFilter === "ALL" || user.status === statusFilter)
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);
  const rows = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const busy = loading || savingId !== null;
  const actionsDisabled = busy || Boolean(error);

  const mutate = async (id, operation, message) => {
    if (mutationBusy.current || loading) return;

    mutationBusy.current = true;
    setSavingId(id);
    setError("");
    setSuccess("");

    try {
      await operation();
      setSuccess(message);
      await loadData();
    } catch (err) {
      setError(getError(err));
    } finally {
      mutationBusy.current = false;
      setSavingId(null);
    }
  };

  const changeRole = (user, role) => {
    if (role === user.role) return;

    if (
      !window.confirm(
        `Change ${user.full_name}'s role to ${role}?`
      )
    ) {
      return;
    }

    mutate(
      user.id,
      () => userService.updateRole(user.id, role),
      "User role updated."
    );
  };

  const changeStatus = (user, status) => {
    if (status === user.status) return;

    if (
      !window.confirm(
        `Change ${user.full_name}'s account status to ${status}?`
      )
    ) {
      return;
    }

    mutate(
      user.id,
      () => userService.updateStatus(user.id, status),
      "User status updated."
    );
  };

  const changeVehicle = (user, value) => {
    const vehicleId = value === "" ? null : Number(value);
    const previousId =
      user.assigned_vehicle_id == null
        ? null
        : Number(user.assigned_vehicle_id);

    if (vehicleId === previousId) return;

    const vehicle = vehicles.find(
      (item) => Number(item.id) === vehicleId
    );

    const message =
      vehicleId === null
        ? `Remove ${user.full_name}'s vehicle assignment?`
        : `Assign ${vehicle?.registration_number} to ${user.full_name}?`;

    if (!window.confirm(message)) return;

    mutate(
      user.id,
      () => userService.assignVehicle(user.id, vehicleId),
      vehicleId === null
        ? "Vehicle assignment removed."
        : "Vehicle assigned successfully."
    );
  };

  const columns = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (row) => {
        const ownAccount =
          Number(row.id) === Number(currentUser?.id);

        return (
          <select
            className="form-select form-select-sm"
            value={row.role}
            disabled={
              actionsDisabled ||
              ownAccount ||
              row.assigned_vehicle_id != null
            }
            onChange={(event) =>
              changeRole(row, event.target.value)
            }
            aria-label={`Role for ${row.full_name}`}
            title={
              ownAccount
                ? "Your own role cannot be changed here."
                : row.assigned_vehicle_id != null
                  ? "Remove the vehicle assignment before changing role."
                  : "Change role"
            }
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        );
      },
    },
    {
      key: "status",
      label: "Account Status",
      render: (row) => (
        <select
          className="form-select form-select-sm"
          value={row.status}
          disabled={
            actionsDisabled ||
            Number(row.id) === Number(currentUser?.id)
          }
          onChange={(event) =>
            changeStatus(row, event.target.value)
          }
          aria-label={`Account status for ${row.full_name}`}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      ),
    },
    {
      key: "assigned_vehicle_id",
      label: "Assigned Vehicle",
      render: (row) => {
        const canAssign =
          row.role === "USER" && row.status === "ACTIVE";

        const options = vehicles.filter(
          (vehicle) =>
            (canAssign && vehicle.status === "ACTIVE") ||
            Number(vehicle.id) === Number(row.assigned_vehicle_id)
        );

        return (
          <div style={{ minWidth: 190 }}>
            <select
              className="form-select form-select-sm"
              value={row.assigned_vehicle_id ?? ""}
              disabled={
                actionsDisabled ||
                (!canAssign && row.assigned_vehicle_id == null)
              }
              onChange={(event) =>
                changeVehicle(row, event.target.value)
              }
              aria-label={`Assigned vehicle for ${row.full_name}`}
            >
              <option value="">No vehicle assigned</option>
              {options.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registration_number}
                  {vehicle.status !== "ACTIVE"
                    ? ` (${vehicle.status})`
                    : ""}
                </option>
              ))}
            </select>

            {row.assigned_vehicle_status && (
              <div className="mt-1">
                <StatusBadge value={row.assigned_vehicle_status} />
              </div>
            )}

            {savingId === row.id && (
              <small className="text-muted">Saving...</small>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Manage account roles, status and vehicle assignments."
        action={
          <button
            className="btn btn-outline-secondary"
            disabled={busy}
            onClick={() => {
              setSuccess("");
              loadData();
            }}
          >
            {loading ? "Loading..." : "Refresh"}
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
          <div className="row g-3">
            <div className="col-md-5">
              <input
                className="form-control"
                placeholder="Search name or email"
                aria-label="Search users"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                aria-label="Filter by role"
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All roles</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="col-md-1">
              <button
                className="btn btn-light"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("ALL");
                  setStatusFilter("ALL");
                  setPage(1);
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-3">Loading users...</div>
        ) : (
          <div className="table-responsive">
            <DataTable columns={columns} rows={rows} />
          </div>
        )}

        <div className="card-footer d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <span>
            {filteredUsers.length} users · Page {currentPage} of {totalPages}
          </span>

          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={currentPage <= 1 || busy}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={currentPage >= totalPages || busy}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}