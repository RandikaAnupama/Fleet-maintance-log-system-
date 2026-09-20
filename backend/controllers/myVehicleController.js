const myVehicleModel = require("../models/myVehicleModel");

const getMyVehicle = async (req, res) => {
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
        message: "User account not found. Please log in again.",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact the administrator.",
      });
    }

    const vehicle = await myVehicleModel.getAssignedVehicle(userId);

    return res.status(200).json({
      success: true,
      vehicle,
      ...(vehicle
        ? {}
        : {
            message:
              "No vehicle assigned. Please contact the administrator.",
          }),
    });
  } catch (error) {
    console.error("Get assigned vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get your assigned vehicle.",
    });
  }
};

module.exports = {
  getMyVehicle,
};