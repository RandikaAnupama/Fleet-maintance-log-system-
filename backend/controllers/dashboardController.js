const dashboardModel = require("../models/dashboardModel");
const userModel = require("../models/userModel");

const getDashboard = async (req, res) => {
  try {
    const userId = Number(req.user?.id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid login session.",
      });
    }

    const user = await userModel.getUserById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (
      user.status !== "ACTIVE" ||
      !["ADMIN", "USER"].includes(user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. An active account is required.",
      });
    }

    const dashboard = await dashboardModel.getDashboard(user);

    return res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard.",
    });
  }
};

module.exports = {
  getDashboard,
};