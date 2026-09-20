const myMaintenanceModel = require("../models/myMaintenanceModel");
const myVehicleModel = require("../models/myVehicleModel");

const getMyMaintenance = async (req, res) => {
  try {
    const userId = Number(req.user?.id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid login session. Please log in again.",
      });
    }

    const user = await myVehicleModel.getUserAssignment(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    if (user.role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "This endpoint is available to USER accounts only.",
      });
    }

    if (user.assigned_vehicle_id == null) {
      return res.status(200).json({
        success: true,
        maintenance: [],
        message: "No vehicle assigned. Please contact the administrator.",
      });
    }

    const maintenance =
      await myMaintenanceModel.getMyMaintenance(userId);

    return res.status(200).json({
      success: true,
      maintenance,
    });
  } catch (error) {
    console.error("Get my maintenance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load your maintenance history.",
    });
  }
};

module.exports = {
  getMyMaintenance,
};