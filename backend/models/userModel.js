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

module.exports = {
  createUser,
  findUserByEmail,
};