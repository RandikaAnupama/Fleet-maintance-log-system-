const pool = require("../config/db");

const issueSelect = `
  SELECT
    i.id,
    i.vehicle_id,
    v.registration_number AS vehicle_number,
    i.reported_by,
    i.reported_by_user_id,
    i.title,
    i.description,
    i.priority,
    i.status,
    DATE_FORMAT(i.reported_date, '%Y-%m-%d') AS reported_date,
    i.created_at
  FROM issues i
  LEFT JOIN vehicles v ON v.id = i.vehicle_id
`;

const getAllIssues = async () => {
  const [rows] = await pool.execute(
    `${issueSelect}
     ORDER BY i.created_at DESC, i.id DESC`
  );

  return rows;
};

const getIssuesByUserId = async (userId) => {
  const [rows] = await pool.execute(
    `${issueSelect}
     WHERE i.reported_by_user_id = ?
     ORDER BY i.created_at DESC, i.id DESC`,
    [userId]
  );

  return rows;
};

const getIssueById = async (id) => {
  const [rows] = await pool.execute(
    `${issueSelect}
     WHERE i.id = ?`,
    [id]
  );

  return rows[0] || null;
};

const createIssue = async ({
  vehicle_id,
  reported_by,
  reported_by_user_id,
  title,
  description,
  priority,
}) => {
  const [result] = await pool.execute(
    `INSERT INTO issues (
       vehicle_id,
       reported_by,
       reported_by_user_id,
       title,
       description,
       priority,
       status,
       reported_date
     )
     VALUES (?, ?, ?, ?, ?, ?, 'OPEN', CURDATE())`,
    [
      vehicle_id,
      reported_by,
      reported_by_user_id,
      title,
      description,
      priority,
    ]
  );

  return result.insertId;
};

const updateIssueStatus = async (id, status) => {
  const [result] = await pool.execute(
    `UPDATE issues
     SET status = ?
     WHERE id = ?`,
    [status, id]
  );

  return result;
};

module.exports = {
  getAllIssues,
  getIssuesByUserId,
  getIssueById,
  createIssue,
  updateIssueStatus,
};