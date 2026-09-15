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

module.exports = {
  createUser,
  findUserByEmail,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  updateAssignedVehicle,
};