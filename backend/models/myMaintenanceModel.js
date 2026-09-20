const pool = require("../config/db");

const getMyMaintenance = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT
       m.id,
       m.vehicle_id,
       v.registration_number AS vehicle_number,
       m.service_type,
       m.description,
       DATE_FORMAT(m.service_date, '%Y-%m-%d') AS service_date,
       DATE_FORMAT(m.next_service_date, '%Y-%m-%d') AS next_service_date,
       m.cost,
       m.status
     FROM users u
     INNER JOIN vehicles v
       ON v.id = u.assigned_vehicle_id
     INNER JOIN maintenance_logs m
       ON m.vehicle_id = v.id
     WHERE u.id = ?
       AND u.role = 'USER'
       AND u.status = 'ACTIVE'
     ORDER BY m.service_date DESC, m.id DESC`,
    [userId]
  );

  return rows;
};

module.exports = {
  getMyMaintenance,
};