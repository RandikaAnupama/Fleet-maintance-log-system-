const pool = require("../config/db");

// Get all drivers
const getAllDrivers = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM drivers ORDER BY id DESC"
  );

  return rows;
};

// Get driver by ID
const getDriverById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM drivers WHERE id = ?",
    [id]
  );

  return rows[0];
};

// Find driver by license number
const findDriverByLicense = async (licenseNumber) => {
  const [rows] = await pool.query(
    "SELECT * FROM drivers WHERE license_number = ?",
    [licenseNumber]
  );

  return rows[0];
};

// Create driver
const createDriver = async (driver) => {
  const {
    full_name,
    license_number,
    phone,
    email,
    address,
    status,
  } = driver;

  const [result] = await pool.query(
    `INSERT INTO drivers
    (full_name, license_number, phone, email, address, status)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      full_name,
      license_number,
      phone || null,
      email || null,
      address || null,
      status || "ACTIVE",
    ]
  );

  return result.insertId;
};

// Update driver
const updateDriver = async (id, driver) => {
  const {
    full_name,
    license_number,
    phone,
    email,
    address,
    status,
  } = driver;

  const [result] = await pool.query(
    `UPDATE drivers
     SET full_name = ?,
         license_number = ?,
         phone = ?,
         email = ?,
         address = ?,
         status = ?
     WHERE id = ?`,
    [
      full_name,
      license_number,
      phone || null,
      email || null,
      address || null,
      status || "ACTIVE",
      id,
    ]
  );

  return result;
};

// Deactivate driver
const deactivateDriver = async (id) => {
  const [result] = await pool.query(
    "UPDATE drivers SET status = 'INACTIVE' WHERE id = ?",
    [id]
  );

  return result;
};

module.exports = {
  getAllDrivers,
  getDriverById,
  findDriverByLicense,
  createDriver,
  updateDriver,
  deactivateDriver,
};