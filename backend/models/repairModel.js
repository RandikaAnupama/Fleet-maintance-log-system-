const pool = require("../config/db");

const repairSelect = `
  SELECT
    r.id,
    r.vehicle_id,
    v.registration_number AS vehicle_number,
    r.repair_type,
    r.garage_id,
    COALESCE(g.name, r.garage_name) AS garage_name,
    r.description,
    DATE_FORMAT(r.repair_date, '%Y-%m-%d') AS repair_date,
    r.cost,
    r.status,
    r.created_at,
    r.updated_at
  FROM repair_logs r
  JOIN vehicles v ON v.id = r.vehicle_id
  LEFT JOIN garages g ON g.id = r.garage_id
`;

const getAllRepairs = async () => {
  const [rows] = await pool.execute(
    `${repairSelect} ORDER BY r.repair_date DESC, r.id DESC`
  );

  return rows;
};

const getRepairById = async (id) => {
  const [rows] = await pool.execute(
    `${repairSelect} WHERE r.id = ?`,
    [id]
  );

  return rows[0];
};

const createRepair = async (repair) => {
  const [result] = await pool.execute(
    `INSERT INTO repair_logs (
      vehicle_id,
      repair_type,
      garage_id,
      garage_name,
      description,
      repair_date,
      cost,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      repair.vehicle_id,
      repair.repair_type,
      repair.garage_id,
      repair.garage_name ?? null,
      repair.description ?? null,
      repair.repair_date,
      repair.cost,
      repair.status,
    ]
  );

  return result.insertId;
};

const updateRepair = async (id, repair) => {
  const [result] = await pool.execute(
    `UPDATE repair_logs
     SET vehicle_id = ?,
         repair_type = ?,
         garage_id = ?,
         garage_name = ?,
         description = ?,
         repair_date = ?,
         cost = ?,
         status = ?
     WHERE id = ?`,
    [
      repair.vehicle_id,
      repair.repair_type,
      repair.garage_id,
      repair.garage_name ?? null,
      repair.description ?? null,
      repair.repair_date,
      repair.cost,
      repair.status,
      id,
    ]
  );

  return result;
};

const deleteRepair = async (id) => {
  const [result] = await pool.execute(
    "DELETE FROM repair_logs WHERE id = ?",
    [id]
  );

  return result;
};

module.exports = {
  getAllRepairs,
  getRepairById,
  createRepair,
  updateRepair,
  deleteRepair,
};