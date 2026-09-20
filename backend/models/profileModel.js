const pool = require("../config/db");

const getProfile = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT id, full_name, email, phone, role, status
     FROM users
     WHERE id = ?`,
    [userId]
  );

  return rows[0];
};

const updateProfile = async (userId, { full_name, phone }) => {
  const [result] = await pool.execute(
    `UPDATE users
     SET full_name = ?, phone = ?
     WHERE id = ? AND status = 'ACTIVE'`,
    [full_name, phone, userId]
  );

  return result;
};

module.exports = {
  getProfile,
  updateProfile,
};