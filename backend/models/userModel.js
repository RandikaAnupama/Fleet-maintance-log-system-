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

const getAllUsers = async () => {
  const [rows] = await pool.execute(
    `SELECT id, full_name, email, role, status, created_at
     FROM users
     ORDER BY id DESC`
  );

  return rows;
};

const getUserById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, full_name, email, role, status, created_at
     FROM users
     WHERE id = ?`,
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


module.exports = {
  createUser,
  findUserByEmail,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
};