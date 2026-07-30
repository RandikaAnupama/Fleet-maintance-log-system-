import { useEffect, useMemo, useState } from "react";
import { usersSeed } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

const STORAGE_KEY = "fleet_users";
const PAGE_SIZE = 5;

const emptyForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "USER",
  status: "ACTIVE",
};

function loadUsers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error(err);
  }

  return usersSeed;
}

function isMainAdmin(user) {
  return (
    String(user.email).toLowerCase() === "admin@fleet.com" ||
    String(user.name).toLowerCase() === "system admin"
  );
}

export default function Users() {

  const [users, setUsers] = useState(loadUsers());
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(users)
    );
  }, [users]);
    const filteredUsers = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        searchText === "" ||
        String(user.name || "")
          .toLowerCase()
          .includes(searchText) ||
        String(user.email || "")
          .toLowerCase()
          .includes(searchText);

      const matchesRole =
        roleFilter === "ALL" ||
        String(user.role || "").toUpperCase() === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        String(user.status || "").toUpperCase() === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredUsers.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openAddModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
      role: String(user.role || "USER").toUpperCase(),
      status: String(user.status || "ACTIVE").toUpperCase(),
    });

    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setForm(emptyForm);
    setErrors({});
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
      newErrors.name = "Name is required.";
    } else if (name.length < 3) {
      newErrors.name =
        "Name must contain at least 3 characters.";
    }

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!emailPattern.test(email)) {
      newErrors.email =
        "Enter a valid email address.";
    }

    const duplicateEmail = users.some(
      (user) =>
        String(user.email || "").toLowerCase() === email &&
        user.id !== editingUser?.id
    );

    if (duplicateEmail) {
      newErrors.email =
        "This email is already registered.";
    }

    if (!editingUser && !form.password) {
      newErrors.password = "Password is required.";
    }

    if (
      form.password &&
      form.password.length < 6
    ) {
      newErrors.password =
        "Password must contain at least 6 characters.";
    }

    if (
      form.password !== form.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const userData = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      status: form.status,
    };

    if (editingUser) {
      setUsers((previousUsers) =>
        previousUsers.map((user) => {
          if (user.id !== editingUser.id) {
            return user;
          }

          if (isMainAdmin(user)) {
            return {
              ...user,
              name: userData.name,
              email: userData.email,
              role: "ADMIN",
              status: "ACTIVE",
            };
          }

          return {
            ...user,
            ...userData,
          };
        })
      );
    } else {
      setUsers((previousUsers) => [
        ...previousUsers,
        {
          id: Date.now(),
          ...userData,
        },
      ]);
    }

    closeModal();
  };

  const openDeleteModal = (user) => {
    if (isMainAdmin(user)) {
      alert(
        "The main System Admin account cannot be deleted."
      );
      return;
    }

    setDeleteUser(user);
    setShowDelete(true);
  };

  const closeDeleteModal = () => {
    setShowDelete(false);
    setDeleteUser(null);
  };

  const confirmDelete = () => {
    if (!deleteUser) {
      return;
    }

    if (isMainAdmin(deleteUser)) {
      closeDeleteModal();
      return;
    }

    setUsers((previousUsers) =>
      previousUsers.filter(
        (user) => user.id !== deleteUser.id
      )
    );

    closeDeleteModal();
  };

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };
  const columns = [
  {
    key: "id",
    label: "ID",
    render: (row) => `#${row.id}`,
  },
  {
    key: "name",
    label: "Name",
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "role",
    label: "Role",
    render: (row) => (
      <span
        className={`badge ${
          row.role === "ADMIN"
            ? "text-bg-primary"
            : "text-bg-secondary"
        }`}
      >
        {row.role}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <StatusBadge value={row.status} />
    ),
  },
  {
    key: "actions",
    label: "Actions",
    render: (row) => (
      <div className="d-flex gap-2">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => openEditModal(row)}
        >
          <i className="bi bi-pencil-square me-1"></i>
          Edit
        </button>

        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => openDeleteModal(row)}
          disabled={isMainAdmin(row)}
        >
          <i className="bi bi-trash me-1"></i>
          Delete
        </button>
      </div>
    ),
  },
];

const firstRecord =
  filteredUsers.length === 0
    ? 0
    : (currentPage - 1) * PAGE_SIZE + 1;

const lastRecord = Math.min(
  currentPage * PAGE_SIZE,
  filteredUsers.length
);

return (
  <>
    <PageHeader
      title="User Management"
      subtitle="Admin-only page for creating and managing users."
      action={
        <button
          className="btn btn-primary"
          onClick={openAddModal}
        >
          <i className="bi bi-person-plus me-1"></i>
          Add User
        </button>
      }
    />

    <div className="row g-3 mb-4">

      <div className="col-md-4">
        <div className="card h-100">
          <div className="card-body">
            <small className="text-muted">
              Total Users
            </small>

            <h3>{users.length}</h3>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card h-100">
          <div className="card-body">
            <small className="text-muted">
              Active Users
            </small>

            <h3>
              {
                users.filter(
                  (u) =>
                    u.status === "ACTIVE"
                ).length
              }
            </h3>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card h-100">
          <div className="card-body">
            <small className="text-muted">
              Admin Users
            </small>

            <h3>
              {
                users.filter(
                  (u) =>
                    u.role === "ADMIN"
                ).length
              }
            </h3>
          </div>
        </div>
      </div>

    </div>

    <div className="card mb-3">

      <div className="card-body">

        <div className="row g-3">

          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">
                All Roles
              </option>

              <option value="ADMIN">
                Admin
              </option>

              <option value="USER">
                User
              </option>

            </select>
          </div>

          <div className="col-md-3">

            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">
                All Status
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

            </select>

          </div>

          <div className="col-md-1">

            <button
              className="btn btn-outline-secondary w-100"
              onClick={resetFilters}
            >
              ↺
            </button>
          </div>
        </div>
      </div>
    </div>
        <div className="card">
      {paginatedUsers.length > 0 ? (
        <DataTable
          columns={columns}
          rows={paginatedUsers}
        />
      ) : (
        <div className="text-center text-muted py-5">
          <i className="bi bi-people fs-1 d-block mb-2"></i>
          No users found.
        </div>
      )}

      <div className="card-footer bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <small className="text-muted">
          Showing {firstRecord} - {lastRecord} of{" "}
          {filteredUsers.length} users
        </small>

        <ul className="pagination pagination-sm mb-0">
          <li
            className={`page-item ${
              currentPage === 1 ? "disabled" : ""
            }`}
          >
            <button
              type="button"
              className="page-link"
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1)
                )
              }
            >
              Previous
            </button>
          </li>

          {Array.from(
            { length: totalPages },
            (_, index) => {
              const pageNumber = index + 1;

              return (
                <li
                  key={pageNumber}
                  className={`page-item ${
                    currentPage === pageNumber
                      ? "active"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() =>
                      setCurrentPage(pageNumber)
                    }
                  >
                    {pageNumber}
                  </button>
                </li>
              );
            }
          )}

          <li
            className={`page-item ${
              currentPage === totalPages
                ? "disabled"
                : ""
            }`}
          >
            <button
              type="button"
              className="page-link"
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1)
                )
              }
            >
              Next
            </button>
          </li>
        </ul>
      </div>
    </div>

    {showModal && (
      <>
        <div
          className="modal fade show d-block"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingUser
                      ? "Edit User"
                      : "Add User"}
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      className={`form-control ${
                        errors.name
                          ? "is-invalid"
                          : ""
                      }`}
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                    />

                    {errors.name && (
                      <div className="invalid-feedback">
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      className={`form-control ${
                        errors.email
                          ? "is-invalid"
                          : ""
                      }`}
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                    />

                    {errors.email && (
                      <div className="invalid-feedback">
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        {editingUser
                          ? "New Password"
                          : "Password"}
                      </label>

                      <input
                        type="password"
                        name="password"
                        className={`form-control ${
                          errors.password
                            ? "is-invalid"
                            : ""
                        }`}
                        value={form.password}
                        onChange={handleChange}
                        placeholder={
                          editingUser
                            ? "Leave blank to keep current"
                            : "Minimum 6 characters"
                        }
                      />

                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Confirm Password
                      </label>

                      <input
                        type="password"
                        name="confirmPassword"
                        className={`form-control ${
                          errors.confirmPassword
                            ? "is-invalid"
                            : ""
                        }`}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                      />

                      {errors.confirmPassword && (
                        <div className="invalid-feedback">
                          {
                            errors.confirmPassword
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row g-3 mt-1">
                    <div className="col-md-6">
                      <label className="form-label">
                        Role
                      </label>

                      <select
                        name="role"
                        className="form-select"
                        value={form.role}
                        onChange={handleChange}
                        disabled={
                          editingUser &&
                          isMainAdmin(editingUser)
                        }
                      >
                        <option value="USER">
                          User
                        </option>

                        <option value="ADMIN">
                          Admin
                        </option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Status
                      </label>

                      <select
                        name="status"
                        className="form-select"
                        value={form.status}
                        onChange={handleChange}
                        disabled={
                          editingUser &&
                          isMainAdmin(editingUser)
                        }
                      >
                        <option value="ACTIVE">
                          Active
                        </option>

                        <option value="INACTIVE">
                          Inactive
                        </option>
                      </select>
                    </div>
                  </div>

                  {editingUser &&
                    isMainAdmin(editingUser) && (
                      <div className="alert alert-info mt-3 mb-0">
                        The main System Admin must
                        remain an active
                        administrator.
                      </div>
                    )}

                  {editingUser && (
                    <small className="text-muted d-block mt-3">
                      Leave password fields empty
                      when the password does not
                      need to be changed.
                    </small>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    <i className="bi bi-check-circle me-1"></i>

                    {editingUser
                      ? "Save Changes"
                      : "Add User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="modal-backdrop fade show"></div>
      </>
    )}

    {showDelete && deleteUser && (
      <>
        <div
          className="modal fade show d-block"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Delete User
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDeleteModal}
                ></button>
              </div>

              <div className="modal-body">
                <p>
                  Are you sure you want to delete{" "}
                  <strong>
                    {deleteUser.name}
                  </strong>
                  ?
                </p>

                <p className="text-muted mb-0">
                  This action cannot be undone.
                </p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  <i className="bi bi-trash me-1"></i>
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-backdrop fade show"></div>
      </>
    )}
  </>
);
}