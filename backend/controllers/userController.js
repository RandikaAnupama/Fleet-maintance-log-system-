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

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["ADMIN", "USER"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    await userModel.updateUserRole(id, role);

    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
    });
  } catch (error) {
    console.error("Update user role error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user role.",
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user status.",
      });
    }

    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    await userModel.updateUserStatus(id, status);

    res.status(200).json({
      success: true,
      message: "User status updated successfully.",
    });
  } catch (error) {
    console.error("Update user status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user status.",
    });
  }
};


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