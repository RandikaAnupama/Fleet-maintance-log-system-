const pool = require("../config/db");

const getDashboard = async (user) => {
  const isAdmin = user.role === "ADMIN";
  const vehicleId = user.assigned_vehicle_id ?? null;

  const query = async (sql, params = []) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
  };

  const maintenanceScope = isAdmin ? "" : "WHERE m.vehicle_id = ?";
  const maintenanceParams = isAdmin ? [] : [vehicleId];

  const issueScope = isAdmin ? "" : "WHERE i.reported_by_user_id = ?";
  const issueParams = isAdmin ? [] : [user.id];

  const scheduleScope = isAdmin ? "" : "AND s.vehicle_id = ?";
  const scheduleParams = isAdmin ? [] : [vehicleId];

  const [
    clockRows,
    maintenance,
    issueCounts,
    issues,
    schedules,
  ] = await Promise.all([
    query(`
      SELECT
        DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today,
        DATE_FORMAT(CURDATE(), '%M %Y') AS month_label
    `),

    query(
      `SELECT
         m.id,
         v.registration_number AS vehicle_number,
         m.service_type,
         DATE_FORMAT(m.service_date, '%Y-%m-%d') AS service_date,
         m.cost,
         m.status
       FROM maintenance_logs m
       JOIN vehicles v ON v.id = m.vehicle_id
       ${maintenanceScope}
       ORDER BY m.service_date DESC, m.id DESC
       LIMIT 5`,
      maintenanceParams
    ),

    query(
      `SELECT
         COUNT(CASE WHEN i.status <> 'RESOLVED' THEN 1 END)
           AS open_issues,
         COUNT(CASE
           WHEN i.status <> 'RESOLVED' AND i.priority = 'HIGH'
           THEN 1 END) AS high_priority_count
       FROM issues i
       ${issueScope}`,
      issueParams
    ),

    query(
      `SELECT
         i.id,
         i.title,
         i.status,
         i.priority,
         v.registration_number AS vehicle_number,
         DATE_FORMAT(i.reported_date, '%Y-%m-%d') AS reported_date
       FROM issues i
       LEFT JOIN vehicles v ON v.id = i.vehicle_id
       ${issueScope}
       ORDER BY i.created_at DESC, i.id DESC
       LIMIT 5`,
      issueParams
    ),

    query(
      `SELECT
         s.id,
         v.registration_number AS vehicle_number,
         s.service_type,
         DATE_FORMAT(s.due_date, '%Y-%m-%d') AS due_date,
         CASE
           WHEN s.due_date < CURDATE() THEN 'OVERDUE'
           ELSE 'UPCOMING'
         END AS status
       FROM service_schedules s
       JOIN vehicles v ON v.id = s.vehicle_id
       WHERE s.status IN ('UPCOMING', 'OVERDUE')
         AND s.maintenance_id IS NULL
         AND s.due_date < DATE_ADD(CURDATE(), INTERVAL 7 DAY)
         ${scheduleScope}
       ORDER BY s.due_date ASC, s.id ASC
       LIMIT 5`,
      scheduleParams
    ),
  ]);

  const common = {
    role: user.role,
    today: clockRows[0].today,
    month_label: clockRows[0].month_label,
    open_issues: Number(issueCounts[0].open_issues),
    high_priority: Number(issueCounts[0].high_priority_count),
    maintenance,
    issues,
    schedules,
  };

  if (isAdmin) {
    const [vehicleCounts, scheduleCounts, costRows] = await Promise.all([
      query(`
        SELECT
          COUNT(*) AS total_vehicles,
          COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END)
            AS active_vehicles
        FROM vehicles
      `),

      query(`
        SELECT
          COUNT(CASE
            WHEN due_date >= CURDATE()
             AND due_date < DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            THEN 1 END) AS services_due,
          COUNT(CASE WHEN due_date < CURDATE() THEN 1 END)
            AS overdue_services
        FROM service_schedules
        WHERE status IN ('UPCOMING', 'OVERDUE')
          AND maintenance_id IS NULL
      `),

      query(`
        SELECT COALESCE(SUM(actual_cost), 0) AS monthly_cost
        FROM (
          SELECT cost AS actual_cost
          FROM maintenance_logs
          WHERE status = 'COMPLETED'
            AND service_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            AND service_date <= CURDATE()

          UNION ALL

          SELECT cost AS actual_cost
          FROM repair_logs
          WHERE status = 'COMPLETED'
            AND repair_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            AND repair_date <= CURDATE()
        ) AS completed_costs
      `),
    ]);

    return {
      ...common,
      total_vehicles: Number(vehicleCounts[0].total_vehicles),
      active_vehicles: Number(vehicleCounts[0].active_vehicles),
      services_due: Number(scheduleCounts[0].services_due),
      overdue_services: Number(scheduleCounts[0].overdue_services),
      monthly_cost: costRows[0].monthly_cost,
    };
  }

  const [vehicleRows, nextRows, lastRows] = await Promise.all([
    query(
      `SELECT id, registration_number, make, model, status
       FROM vehicles
       WHERE id = ?`,
      [vehicleId]
    ),

    query(
      `SELECT
         service_type,
         DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
         CASE
           WHEN due_date < CURDATE() THEN 'OVERDUE'
           ELSE 'UPCOMING'
         END AS status
       FROM service_schedules
       WHERE vehicle_id = ?
         AND status IN ('UPCOMING', 'OVERDUE')
         AND maintenance_id IS NULL
       ORDER BY due_date ASC, id ASC
       LIMIT 1`,
      [vehicleId]
    ),

    query(
      `SELECT
         service_type,
         DATE_FORMAT(service_date, '%Y-%m-%d') AS service_date
       FROM maintenance_logs
       WHERE vehicle_id = ?
         AND status = 'COMPLETED'
         AND service_date <= CURDATE()
       ORDER BY service_date DESC, id DESC
       LIMIT 1`,
      [vehicleId]
    ),
  ]);

  return {
    ...common,
    vehicle: vehicleRows[0] || null,
    next_service: nextRows[0] || null,
    last_service: lastRows[0] || null,
  };
};

module.exports = {
  getDashboard,
};