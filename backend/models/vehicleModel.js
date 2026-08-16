const pool = require("../config/db");

// Get all vehicles
const getAllVehicles = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM vehicles ORDER BY id DESC"
  );

  return rows;
};

// Get one vehicle by ID
const getVehicleById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM vehicles WHERE id = ?",
    [id]
  );

  return rows[0];
};

// Find vehicle by registration number
const findVehicleByRegistration = async (registrationNumber) => {
  const [rows] = await pool.query(
    "SELECT * FROM vehicles WHERE registration_number = ?",
    [registrationNumber]
  );

  return rows[0];
};

// Create vehicle
const createVehicle = async (vehicle) => {
  const {
    registration_number,
    make,
    model,
    manufacture_year,
    vehicle_type,
    fuel_type,
    mileage,
    status,
  } = vehicle;

  const [result] = await pool.query(
    `INSERT INTO vehicles
    (
      registration_number,
      make,
      model,
      manufacture_year,
      vehicle_type,
      fuel_type,
      mileage,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      registration_number,
      make,
      model,
      manufacture_year || null,
      vehicle_type || null,
      fuel_type || null,
      mileage ?? 0,
      status || "ACTIVE",
    ]
  );

  return result.insertId;
};

// Update vehicle
const updateVehicle = async (id, vehicle) => {
  const {
    registration_number,
    make,
    model,
    manufacture_year,
    vehicle_type,
    fuel_type,
    mileage,
    status,
  } = vehicle;

  const [result] = await pool.query(
    `UPDATE vehicles
     SET registration_number = ?,
         make = ?,
         model = ?,
         manufacture_year = ?,
         vehicle_type = ?,
         fuel_type = ?,
         mileage = ?,
         status = ?
     WHERE id = ?`,
    [
      registration_number,
      make,
      model,
      manufacture_year || null,
      vehicle_type || null,
      fuel_type || null,
      mileage ?? 0,
      status || "ACTIVE",
      id,
    ]
  );

  return result;
};

// Deactivate vehicle
const deactivateVehicle = async (id) => {
  const [result] = await pool.query(
    "UPDATE vehicles SET status = 'INACTIVE' WHERE id = ?",
    [id]
  );

  return result;
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  findVehicleByRegistration,
  createVehicle,
  updateVehicle,
  deactivateVehicle,
};