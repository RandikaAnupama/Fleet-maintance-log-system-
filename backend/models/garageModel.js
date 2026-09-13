const pool = require("../config/db");

const getAllGarages = async () => {
  const [rows] = await pool.execute(
    "SELECT id, name, status, created_at, updated_at FROM garages ORDER BY id DESC"
  );

  return rows;
};

const getGarageById = async (id) => {
  const [rows] = await pool.execute(
    "SELECT id, name, status, created_at, updated_at FROM garages WHERE id = ?",
    [id]
  );

  return rows[0];
};

const findGarageByName = async (name) => {
  const [rows] = await pool.execute(
    "SELECT id, name, status FROM garages WHERE name = ?",
    [name]
  );

  return rows[0];
};

const createGarage = async ({ name, status = "ACTIVE" }) => {
  const [result] = await pool.execute(
    "INSERT INTO garages (name, status) VALUES (?, ?)",
    [name, status]
  );

  return result.insertId;
};

const updateGarage = async (id, { name, status }) => {
  const [result] = await pool.execute(
    "UPDATE garages SET name = ?, status = ? WHERE id = ?",
    [name, status, id]
  );

  return result;
};

const deactivateGarage = async (id) => {
  const [result] = await pool.execute(
    "UPDATE garages SET status = 'INACTIVE' WHERE id = ?",
    [id]
  );

  return result;
};

module.exports = {
  getAllGarages,
  getGarageById,
  findGarageByName,
  createGarage,
  updateGarage,
  deactivateGarage,
};