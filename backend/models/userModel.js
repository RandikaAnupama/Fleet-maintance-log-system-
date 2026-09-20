const pool = require("../config/db");

const createUser = async (full_name, email, password, role = "USER") => {
  const [result] = await pool.execute(
    `INSERT INTO users (full_name, email, password, role)
     VALUES (?, ?, ?, ?)`,
    [full_name, email, password, role]
  );

  return result;
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  return rows[0];
};

const userSelect = `
  SELECT
    u.id,
    u.full_name,
    u.email,
    u.role,
    u.status,
    u.created_at,
    u.assigned_vehicle_id,
    v.registration_number AS assigned_vehicle_number,
    v.status AS assigned_vehicle_status
  FROM users u
  LEFT JOIN vehicles v ON v.id = u.assigned_vehicle_id
`;

const getAllUsers = async () => {
  const [rows] = await pool.execute(
    `${userSelect}
     ORDER BY u.id DESC`
  );

  return rows;
};

const getUserById = async (id) => {
  const [rows] = await pool.execute(
    `${userSelect}
     WHERE u.id = ?`,
    [id]
  );

  return rows[0];
};

const updateUserRole = async (id, role) => {
  const [result] = await pool.execute(
    `UPDATE users
     SET role = ?
     WHERE id = ?`,
    [role, id]
  );

  return result;
};

const updateUserStatus = async (id, status) => {
  const [result] = await pool.execute(
    `UPDATE users
     SET status = ?
     WHERE id = ?`,
    [status, id]
  );

  return result;
};

const updateAssignedVehicle = async (id, vehicleId) => {
  const [result] = await pool.execute(
    `UPDATE users
     SET assigned_vehicle_id = ?
     WHERE id = ?`,
    [vehicleId, id]
  );

  return result;
};

const updateUserAccess = async (actorId, userId, field, value) => {
  const allowedValues = {
    role: ["ADMIN", "USER"],
    status: ["ACTIVE", "INACTIVE"],
  };

  const reject = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  };

  if (
    !Object.prototype.hasOwnProperty.call(allowedValues, field) ||
    !allowedValues[field].includes(value)
  ) {
    reject(400, "Invalid account update.");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [users] = await connection.execute(
      `SELECT id, role, status, assigned_vehicle_id
       FROM users
       ORDER BY id
       FOR UPDATE`
    );

    const actor = users.find((user) => user.id === actorId);
    const target = users.find((user) => user.id === userId);

    if (!actor || actor.role !== "ADMIN" || actor.status !== "ACTIVE") {
      reject(403, "Only active administrators can update user access.");
    }

    if (!target) {
      reject(404, "User not found.");
    }

    if (target[field] === value) {
      await connection.commit();
      return;
    }

    if (actorId === userId) {
      reject(403, "You cannot change your own role or account status.");
    }

    const removesActiveAdmin =
      target.role === "ADMIN" &&
      target.status === "ACTIVE" &&
      (
        (field === "role" && value === "USER") ||
        (field === "status" && value === "INACTIVE")
      );

    const activeAdminCount = users.filter(
      (user) => user.role === "ADMIN" && user.status === "ACTIVE"
    ).length;

    if (removesActiveAdmin && activeAdminCount <= 1) {
      reject(409, "The last active administrator cannot be removed.");
    }

    if (
      field === "role" &&
      value === "ADMIN" &&
      target.assigned_vehicle_id !== null
    ) {
      reject(409, "Remove the vehicle assignment before changing the role.");
    }

    const sql =
      field === "role"
        ? "UPDATE users SET role = ? WHERE id = ?"
        : "UPDATE users SET status = ? WHERE id = ?";

    await connection.execute(sql, [value, userId]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  updateAssignedVehicle,
  updateUserAccess,
};