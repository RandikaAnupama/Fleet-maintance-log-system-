const pool = require("../config/db");

const maintenanceSelect = `
  SELECT
    m.id,
    m.vehicle_id,
    v.registration_number AS vehicle_number,
    m.service_type,
    m.description,
    DATE_FORMAT(m.service_date, '%Y-%m-%d') AS service_date,
    DATE_FORMAT(m.next_service_date, '%Y-%m-%d') AS next_service_date,
    m.cost,
    m.status,
    m.created_at,
    m.updated_at
  FROM maintenance_logs m
  JOIN vehicles v ON v.id = m.vehicle_id
`;

const getAllMaintenance = async () => {
  const [rows] = await pool.execute(
    `${maintenanceSelect} ORDER BY m.service_date DESC, m.id DESC`
  );

  return rows;
};

const getMaintenanceById = async (id) => {
  const [rows] = await pool.execute(
    `${maintenanceSelect} WHERE m.id = ?`,
    [id]
  );

  return rows[0];
};

const createMaintenance = async (maintenance) => {
  const [result] = await pool.execute(
    `INSERT INTO maintenance_logs (
      vehicle_id,
      service_type,
      description,
      service_date,
      next_service_date,
      cost,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      maintenance.vehicle_id,
      maintenance.service_type,
      maintenance.description ?? null,
      maintenance.service_date,
      maintenance.next_service_date ?? null,
      maintenance.cost,
      maintenance.status,
    ]
  );

  return result.insertId;
};

const updateMaintenance = async (id, maintenance) => {
  const [result] = await pool.execute(
    `UPDATE maintenance_logs
     SET vehicle_id = ?,
         service_type = ?,
         description = ?,
         service_date = ?,
         next_service_date = ?,
         cost = ?,
         status = ?
     WHERE id = ?`,
    [
      maintenance.vehicle_id,
      maintenance.service_type,
      maintenance.description ?? null,
      maintenance.service_date,
      maintenance.next_service_date ?? null,
      maintenance.cost,
      maintenance.status,
      id,
    ]
  );

  return result;
};

const deleteMaintenance = async (id) => {
  const [result] = await pool.execute(
    "DELETE FROM maintenance_logs WHERE id = ?",
    [id]
  );

  return result;
};

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
};