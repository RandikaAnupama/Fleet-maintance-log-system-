const userModel = require("../models/userModel");
const vehicleModel = require("../models/vehicleModel");

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get users.",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get user.",
    });
  }
};

const handleAccessUpdate = async (req, res, field) => {
  try {
    const idText = String(req.params.id);

    if (
      !/^[1-9]\d*$/.test(idText) ||
      !Number.isSafeInteger(Number(idText))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const actorId = Number(req.user?.id);

    if (!Number.isSafeInteger(actorId) || actorId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid login session.",
      });
    }

    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).length !== 1 ||
      !Object.prototype.hasOwnProperty.call(body, field)
    ) {
      return res.status(400).json({
        success: false,
        message: `Send only the ${field} field.`,
      });
    }

    const allowedValues =
      field === "role"
        ? ["ADMIN", "USER"]
        : ["ACTIVE", "INACTIVE"];

    if (!allowedValues.includes(body[field])) {
      return res.status(400).json({
        success: false,
        message: `Invalid user ${field}.`,
      });
    }

    await userModel.updateUserAccess(
      actorId,
      Number(idText),
      field,
      body[field]
    );

    return res.status(200).json({
      success: true,
      message: `User ${field} updated successfully.`,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.code === "ER_LOCK_DEADLOCK" ||
      error.code === "ER_LOCK_WAIT_TIMEOUT"
    ) {
      return res.status(409).json({
        success: false,
        message: "Another account update is in progress. Please try again.",
      });
    }

    console.error("Update user access error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user access.",
    });
  }
};

const updateUserRole = (req, res) =>
  handleAccessUpdate(req, res, "role");

const updateUserStatus = (req, res) =>
  handleAccessUpdate(req, res, "status");


const updateAssignedVehicle = async (req, res) => {
  try {
    const validId = (value) =>
      ["string", "number"].includes(typeof value) &&
      /^[1-9]\d*$/.test(String(value)) &&
      Number.isSafeInteger(Number(value));

    if (!validId(req.user?.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid login session.",
      });
    }

    const admin = await userModel.getUserById(Number(req.user.id));

    if (!admin || admin.role !== "ADMIN" || admin.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Only active administrators can assign vehicles.",
      });
    }

    if (!validId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !Object.prototype.hasOwnProperty.call(body, "assigned_vehicle_id") ||
      Object.keys(body).some((key) => key !== "assigned_vehicle_id")
    ) {
      return res.status(400).json({
        success: false,
        message: "Send only the assigned_vehicle_id field.",
      });
    }

    const vehicleId = body.assigned_vehicle_id;

    if (vehicleId !== null && !validId(vehicleId)) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID must be a positive integer or null.",
      });
    }

    const userId = Number(req.params.id);
    const user = await userModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (vehicleId !== null) {
      if (user.role !== "USER" || user.status !== "ACTIVE") {
        return res.status(400).json({
          success: false,
          message: "Vehicles can only be assigned to active USER accounts.",
        });
      }

      const vehicle = await vehicleModel.getVehicleById(Number(vehicleId));

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: "Vehicle not found.",
        });
      }

      if (vehicle.status !== "ACTIVE") {
        return res.status(400).json({
          success: false,
          message: "Select an active vehicle.",
        });
      }
    }

    await userModel.updateAssignedVehicle(
      userId,
      vehicleId === null ? null : Number(vehicleId)
    );

    return res.status(200).json({
      success: true,
      message:
        vehicleId === null
          ? "Vehicle assignment removed successfully."
          : "Vehicle assigned successfully.",
    });
  } catch (error) {
    console.error("Assign vehicle error:", error);

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(409).json({
        success: false,
        message: "Vehicle details changed. Refresh and try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle assignment.",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  updateAssignedVehicle,
};