const driverModel = require("../models/driverModel");

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

const validId = (value) =>
  /^[1-9]\d*$/.test(String(value)) &&
  Number.isSafeInteger(Number(value));

const fields = [
  "full_name",
  "license_number",
  "phone",
  "email",
  "address",
  "status",
];

const prepareDriver = (body, existing = null) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("A JSON object is required.");
  }

  if (Object.keys(body).some((key) => !fields.includes(key))) {
    throw new Error("Unknown driver field.");
  }

  const data = {};

  for (const field of fields) {
    data[field] = Object.prototype.hasOwnProperty.call(body, field)
      ? body[field]
      : existing?.[field];
  }

  for (const [field, label, limit] of [
    ["full_name", "Full name", 100],
    ["license_number", "License number", 50],
  ]) {
    if (
      typeof data[field] !== "string" ||
      !data[field].trim() ||
      data[field].trim().length > limit
    ) {
      throw new Error(`${label} must contain 1 to ${limit} characters.`);
    }

    data[field] = data[field].trim();
  }

  for (const field of ["phone", "email", "address"]) {
    if (data[field] == null) {
      data[field] = "";
    }

    if (typeof data[field] !== "string") {
      throw new Error(`${field} must be text.`);
    }

    data[field] = data[field].trim();
  }

  if (data.phone && !/^[0-9]{10}$/.test(data.phone)) {
    throw new Error("Phone number must contain 10 digits.");
  }

  if (
    data.email &&
    (data.email.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
  ) {
    throw new Error("Enter a valid email address, up to 100 characters.");
  }

  if (Buffer.byteLength(data.address, "utf8") > 65535) {
    throw new Error("Address is too long.");
  }

  if (data.status === undefined) {
    data.status = "ACTIVE";
  }

  if (!["ACTIVE", "INACTIVE"].includes(data.status)) {
    throw new Error("Invalid driver status.");
  }

  return data;
};

const handleError = (res, error, message) => {
  console.error(message, error);

  if (error.code === "ER_DUP_ENTRY") {
    return fail(res, 409, "Driver license number already exists.");
  }

  return fail(res, 500, message);
};

const getAllDrivers = async (req, res) => {
  try {
    const drivers = await driverModel.getAllDrivers();
    return res.status(200).json({ success: true, drivers });
  } catch (error) {
    return handleError(res, error, "Failed to get drivers.");
  }
};

const getDriverById = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return fail(res, 400, "Invalid driver ID.");
    }

    const driver = await driverModel.getDriverById(Number(req.params.id));

    if (!driver) {
      return fail(res, 404, "Driver not found.");
    }

    return res.status(200).json({ success: true, driver });
  } catch (error) {
    return handleError(res, error, "Failed to get driver.");
  }
};

const createDriver = async (req, res) => {
  try {
    let data;

    try {
      data = prepareDriver(req.body);
    } catch (error) {
      return fail(res, 400, error.message);
    }

    const duplicate = await driverModel.findDriverByLicense(
      data.license_number
    );

    if (duplicate) {
      return fail(res, 409, "Driver license number already exists.");
    }

    const driverId = await driverModel.createDriver(data);

    return res.status(201).json({
      success: true,
      message: "Driver created successfully.",
      driverId,
    });
  } catch (error) {
    return handleError(res, error, "Failed to create driver.");
  }
};

const updateDriver = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return fail(res, 400, "Invalid driver ID.");
    }

    const id = Number(req.params.id);
    const existing = await driverModel.getDriverById(id);

    if (!existing) {
      return fail(res, 404, "Driver not found.");
    }

    let data;

    try {
      data = prepareDriver(req.body, existing);
    } catch (error) {
      return fail(res, 400, error.message);
    }

    const duplicate = await driverModel.findDriverByLicense(
      data.license_number
    );

    if (duplicate && Number(duplicate.id) !== id) {
      return fail(res, 409, "Driver license number already exists.");
    }

    await driverModel.updateDriver(id, data);

    return res.status(200).json({
      success: true,
      message: "Driver updated successfully.",
    });
  } catch (error) {
    return handleError(res, error, "Failed to update driver.");
  }
};

const deactivateDriver = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return fail(res, 400, "Invalid driver ID.");
    }

    const id = Number(req.params.id);
    const driver = await driverModel.getDriverById(id);

    if (!driver) {
      return fail(res, 404, "Driver not found.");
    }

    await driverModel.deactivateDriver(id);

    return res.status(200).json({
      success: true,
      message: "Driver deactivated successfully.",
    });
  } catch (error) {
    return handleError(res, error, "Failed to deactivate driver.");
  }
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deactivateDriver,
};