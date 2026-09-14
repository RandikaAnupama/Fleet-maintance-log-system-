const pool = require("../config/db");

const getUserAssignment = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT
       id,
       full_name,
       role,
       status,
       assigned_vehicle_id
     FROM users
     WHERE id = ?`,
    [userId]
  );

  return rows[0] || null;
};

const getAssignedVehicle = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT
       v.id,
       v.registration_number,
       v.make,
       v.model,
       v.manufacture_year,
       v.vehicle_type,
       v.fuel_type,
       v.mileage,
       v.status,
       (
         SELECT DATE_FORMAT(MIN(s.due_date), '%Y-%m-%d')
         FROM service_schedules s
         WHERE s.vehicle_id = v.id
           AND s.status IN ('UPCOMING', 'OVERDUE')
           AND s.maintenance_id IS NULL
       ) AS next_service_date
     FROM users u
     INNER JOIN vehicles v
       ON v.id = u.assigned_vehicle_id
     WHERE u.id = ?`,
    [userId]
  );

  return rows[0] || null;
};

module.exports = {
  getUserAssignment,
  getAssignedVehicle,
};