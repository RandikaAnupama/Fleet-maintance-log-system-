const maintenanceModel = require("../models/maintenanceModel");
const vehicleModel = require("../models/vehicleModel");

const validId = (value) =>
  /^[1-9]\d*$/.test(String(value)) &&
  Number.isSafeInteger(Number(value));

const validDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  if (Number(value.slice(0, 4)) < 1000) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

const validateMaintenance = (maintenance) => {
  if (!validId(maintenance.vehicle_id)) {
    return "Select a valid vehicle.";
  }

  if (
    typeof maintenance.service_type !== "string" ||
    !maintenance.service_type.trim() ||
    maintenance.service_type.trim().length > 100
  ) {
    return "Service type is required and cannot exceed 100 characters.";
  }

  if (
    maintenance.description !== null &&
    typeof maintenance.description !== "string"
  ) {
    return "Description must be text.";
  }

  if (
    typeof maintenance.description === "string" &&
    Buffer.byteLength(maintenance.description.trim(), "utf8") > 65535
  ) {
    return "Description is too long.";
  }

  if (!validDate(maintenance.service_date)) {
    return "Enter a valid service date in YYYY-MM-DD format.";
  }

  if (maintenance.next_service_date !== null) {
    if (!validDate(maintenance.next_service_date)) {
      return "Enter a valid next service date in YYYY-MM-DD format.";
    }

    if (maintenance.next_service_date < maintenance.service_date) {
      return "Next service date cannot be earlier than service date.";
    }
  }

  if (
    !["string", "number"].includes(typeof maintenance.cost) ||
    !/^\d+(\.\d{1,2})?$/.test(String(maintenance.cost).trim()) ||
    !Number.isFinite(Number(maintenance.cost)) ||
    Number(maintenance.cost) <= 0 ||
    Number(maintenance.cost) > 99999999.99
  ) {
    return "Cost must be greater than zero, with at most two decimal places, and no more than 99999999.99.";
  }

  if (!["PENDING", "COMPLETED"].includes(maintenance.status)) {
    return "Invalid maintenance status.";
  }

  return null;
};

const prepareMaintenance = async (body, existing = null) => {
  const fields = [
    "vehicle_id",
    "service_type",
    "description",
    "service_date",
    "next_service_date",
    "cost",
    "status",
  ];

  const maintenance = {};

  for (const field of fields) {
    maintenance[field] =
      body[field] === undefined ? existing?.[field] : body[field];
  }

  maintenance.description = maintenance.description ?? null;

  if (
    maintenance.next_service_date === undefined ||
    maintenance.next_service_date === ""
  ) {
    maintenance.next_service_date = null;
  }

  if (maintenance.status === undefined) {
    maintenance.status = "PENDING";
  }

  const validationError = validateMaintenance(maintenance);

  if (validationError) {
    return { error: validationError };
  }

  const vehicle = await vehicleModel.getVehicleById(
    maintenance.vehicle_id
  );

  if (!vehicle) {
    return { error: "Selected vehicle does not exist." };
  }

  return {
    maintenance: {
      vehicle_id: Number(maintenance.vehicle_id),
      service_type: maintenance.service_type.trim(),
      description: maintenance.description?.trim() || null,
      service_date: maintenance.service_date,
      next_service_date: maintenance.next_service_date,
      cost: Number(maintenance.cost).toFixed(2),
      status: maintenance.status,
    },
  };
};

const handleError = (res, error, message) => {
  console.error(message, error);

  if (
    error.code === "ER_NO_REFERENCED_ROW_2" ||
    error.code === "ER_ROW_IS_REFERENCED_2"
  ) {
    return res.status(409).json({
      success: false,
      message:
        "Related records changed or prevent this action. Refresh and try again.",
    });
  }

  return res.status(500).json({
    success: false,
    message,
  });
};

const getAllMaintenance = async (req, res) => {
  try {
    const maintenance = await maintenanceModel.getAllMaintenance();

    return res.status(200).json({
      success: true,
      maintenance,
    });
  } catch (error) {
    return handleError(res, error, "Failed to get maintenance records.");
  }
};

const getMaintenanceById = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance ID.",
      });
    }

    const maintenance = await maintenanceModel.getMaintenanceById(
      req.params.id
    );

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      maintenance,
    });
  } catch (error) {
    return handleError(res, error, "Failed to get maintenance record.");
  }
};

const createMaintenance = async (req, res) => {
  try {
    const result = await prepareMaintenance(req.body || {});

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    const maintenanceId = await maintenanceModel.createMaintenance(
      result.maintenance
    );

    return res.status(201).json({
      success: true,
      message: "Maintenance created successfully.",
      maintenanceId,
    });
  } catch (error) {
    return handleError(res, error, "Failed to create maintenance.");
  }
};

const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance ID.",
      });
    }

    const existing = await maintenanceModel.getMaintenanceById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found.",
      });
    }

    const result = await prepareMaintenance(req.body || {}, existing);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    await maintenanceModel.updateMaintenance(id, result.maintenance);

    return res.status(200).json({
      success: true,
      message: "Maintenance updated successfully.",
    });
  } catch (error) {
    return handleError(res, error, "Failed to update maintenance.");
  }
};

const deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance ID.",
      });
    }

    const result = await maintenanceModel.deleteMaintenance(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Maintenance deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error, "Failed to delete maintenance.");
  }
};

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
};