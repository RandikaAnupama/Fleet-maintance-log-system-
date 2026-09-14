const pool = require("../config/db");

const scheduleSelect = `
  SELECT
    s.id,
    s.vehicle_id,
    v.registration_number AS vehicle_number,
    s.garage_id,
    g.name AS garage_name,
    s.service_type,
    DATE_FORMAT(s.due_date, '%Y-%m-%d') AS due_date,
    s.estimated_cost,
    s.maintenance_id,
    CASE
      WHEN s.status = 'COMPLETED' THEN 'COMPLETED'
      WHEN s.status = 'CANCELLED' THEN 'CANCELLED'
      WHEN s.due_date < CURDATE() THEN 'OVERDUE'
      ELSE 'UPCOMING'
    END AS status,
    s.created_at,
    s.updated_at
  FROM service_schedules s
  JOIN vehicles v ON v.id = s.vehicle_id
  LEFT JOIN garages g ON g.id = s.garage_id
`;

const getAllSchedules = async () => {
  const [rows] = await pool.execute(
    `${scheduleSelect} ORDER BY s.due_date ASC, s.id DESC`
  );

  return rows;
};

const getScheduleById = async (id) => {
  const [rows] = await pool.execute(
    `${scheduleSelect} WHERE s.id = ?`,
    [id]
  );

  return rows[0];
};

const createSchedule = async (schedule) => {
  const [result] = await pool.execute(
    `INSERT INTO service_schedules (
      vehicle_id,
      garage_id,
      service_type,
      due_date,
      estimated_cost,
      status
    ) VALUES (?, ?, ?, ?, ?, 'UPCOMING')`,
    [
      schedule.vehicle_id,
      schedule.garage_id,
      schedule.service_type,
      schedule.due_date,
      schedule.estimated_cost,
    ]
  );

  return result.insertId;
};

const updateSchedule = async (id, schedule) => {
  const [result] = await pool.execute(
    `UPDATE service_schedules
     SET vehicle_id = ?,
         garage_id = ?,
         service_type = ?,
         due_date = ?,
         estimated_cost = ?
     WHERE id = ?
       AND status IN ('UPCOMING', 'OVERDUE')
       AND maintenance_id IS NULL`,
    [
      schedule.vehicle_id,
      schedule.garage_id,
      schedule.service_type,
      schedule.due_date,
      schedule.estimated_cost,
      id,
    ]
  );

  return result;
};

const cancelSchedule = async (id) => {
  const [result] = await pool.execute(
    `UPDATE service_schedules
     SET status = 'CANCELLED'
     WHERE id = ?
       AND status IN ('UPCOMING', 'OVERDUE')
       AND maintenance_id IS NULL`,
    [id]
  );

  return result;
};

const deleteSchedule = async (id) => {
  const [result] = await pool.execute(
    `DELETE FROM service_schedules
     WHERE id = ?
       AND status <> 'COMPLETED'
       AND maintenance_id IS NULL`,
    [id]
  );

  return result;
};

const completeSchedule = async (id, completion) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      "SELECT * FROM service_schedules WHERE id = ? FOR UPDATE",
      [id]
    );

    const schedule = rows[0];

    if (!schedule) {
      const error = new Error("Service schedule not found.");
      error.status = 404;
      throw error;
    }

    if (
      schedule.status === "COMPLETED" ||
      schedule.maintenance_id !== null
    ) {
      const error = new Error("This service schedule is already completed.");
      error.status = 409;
      throw error;
    }

    if (schedule.status === "CANCELLED") {
      const error = new Error("A cancelled schedule cannot be completed.");
      error.status = 409;
      throw error;
    }

    const [result] = await connection.execute(
      `INSERT INTO maintenance_logs (
        vehicle_id,
        service_type,
        description,
        service_date,
        next_service_date,
        cost,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED')`,
      [
        schedule.vehicle_id,
        schedule.service_type,
        completion.description ?? null,
        completion.service_date,
        completion.next_service_date ?? null,
        completion.actual_cost,
      ]
    );

    const maintenanceId = result.insertId;

    await connection.execute(
      `UPDATE service_schedules
       SET status = 'COMPLETED',
           maintenance_id = ?
       WHERE id = ?`,
      [maintenanceId, id]
    );

    await connection.commit();

    return maintenanceId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  cancelSchedule,
  deleteSchedule,
  completeSchedule,
};