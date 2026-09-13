const repairModel = require("../models/repairModel");
const vehicleModel = require("../models/vehicleModel");
const garageModel = require("../models/garageModel");

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

const validateRepair = (repair) => {
  if (!validId(repair.vehicle_id)) {
    return "Select a valid vehicle.";
  }

  if (!validId(repair.garage_id)) {
    return "Select a valid garage.";
  }

  if (
    typeof repair.repair_type !== "string" ||
    !repair.repair_type.trim() ||
    repair.repair_type.trim().length > 100
  ) {
    return "Repair type is required and cannot exceed 100 characters.";
  }

  if (
    typeof repair.description !== "string" ||
    !repair.description.trim()
  ) {
    return "Repair description is required.";
  }

  if (Buffer.byteLength(repair.description.trim(), "utf8") > 65535) {
    return "Repair description is too long.";
  }

  if (!validDate(repair.repair_date)) {
    return "Enter a valid repair date in YYYY-MM-DD format.";
  }

  if (
    !["string", "number"].includes(typeof repair.cost) ||
    !/^\d+(\.\d{1,2})?$/.test(String(repair.cost).trim()) ||
    !Number.isFinite(Number(repair.cost)) ||
    Number(repair.cost) <= 0 ||
    Number(repair.cost) > 99999999.99
  ) {
    return "Cost must be greater than zero, with at most two decimal places, and no more than 99999999.99.";
  }

  if (!["PENDING", "IN_PROGRESS", "COMPLETED"].includes(repair.status)) {
    return "Invalid repair status.";
  }

  return null;
};

const prepareRepair = async (body, existing = null) => {
  const fields = [
    "vehicle_id",
    "repair_type",
    "garage_id",
    "description",
    "repair_date",
    "cost",
    "status",
  ];

  const repair = {};

  for (const field of fields) {
    repair[field] =
      body[field] === undefined ? existing?.[field] : body[field];
  }

  if (repair.status === undefined) {
    repair.status = "PENDING";
  }

  const validationError = validateRepair(repair);

  if (validationError) {
    return { error: validationError };
  }

  const vehicle = await vehicleModel.getVehicleById(repair.vehicle_id);

  if (!vehicle) {
    return { error: "Selected vehicle does not exist." };
  }

  const garage = await garageModel.getGarageById(repair.garage_id);

  if (!garage) {
    return { error: "Selected garage does not exist." };
  }

  const keepingExistingGarage =
    existing &&
    String(existing.garage_id) === String(repair.garage_id);

  if (garage.status !== "ACTIVE" && !keepingExistingGarage) {
    return { error: "Select an active garage." };
  }

  return {
    repair: {
      vehicle_id: Number(repair.vehicle_id),
      repair_type: repair.repair_type.trim(),
      garage_id: Number(repair.garage_id),
      garage_name: null,
      description: repair.description.trim(),
      repair_date: repair.repair_date,
      cost: Number(repair.cost).toFixed(2),
      status: repair.status,
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
      message: "Related records changed or prevent this action. Refresh and try again.",
    });
  }

  return res.status(500).json({
    success: false,
    message,
  });
};

const getAllRepairs = async (req, res) => {
  try {
    const repairs = await repairModel.getAllRepairs();

    return res.status(200).json({
      success: true,
      repairs,
    });
  } catch (error) {
    return handleError(res, error, "Failed to get repairs.");
  }
};

const getRepairById = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid repair ID.",
      });
    }

    const repair = await repairModel.getRepairById(req.params.id);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair not found.",
      });
    }

    return res.status(200).json({
      success: true,
      repair,
    });
  } catch (error) {
    return handleError(res, error, "Failed to get repair.");
  }
};

const createRepair = async (req, res) => {
  try {
    const result = await prepareRepair(req.body || {});

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    const repairId = await repairModel.createRepair(result.repair);

    return res.status(201).json({
      success: true,
      message: "Repair created successfully.",
      repairId,
    });
  } catch (error) {
    return handleError(res, error, "Failed to create repair.");
  }
};

const updateRepair = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid repair ID.",
      });
    }

    const existing = await repairModel.getRepairById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Repair not found.",
      });
    }

    const result = await prepareRepair(req.body || {}, existing);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    await repairModel.updateRepair(id, result.repair);

    return res.status(200).json({
      success: true,
      message: "Repair updated successfully.",
    });
  } catch (error) {
    return handleError(res, error, "Failed to update repair.");
  }
};

const deleteRepair = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid repair ID.",
      });
    }

    const result = await repairModel.deleteRepair(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Repair not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Repair deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error, "Failed to delete repair.");
  }
};

module.exports = {
  getAllRepairs,
  getRepairById,
  createRepair,
  updateRepair,
  deleteRepair,
};