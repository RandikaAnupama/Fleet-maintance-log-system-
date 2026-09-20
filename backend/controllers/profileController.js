const profileModel = require("../models/profileModel");

const getProfile = async (req, res) => {
  try {
    const user = await profileModel.getProfile(req.user.id);

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        message: "Your session is no longer valid. Please log in again.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load profile.",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const body = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile data.",
      });
    }

    const allowedFields = ["full_name", "phone"];

    if (Object.keys(body).some((key) => !allowedFields.includes(key))) {
      return res.status(400).json({
        success: false,
        message: "Only full name and phone can be updated.",
      });
    }

    if (
      typeof body.full_name !== "string" ||
      body.full_name.trim().length < 3 ||
      body.full_name.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Full name must contain 3–100 characters.",
      });
    }

    if (
      body.phone !== undefined &&
      body.phone !== null &&
      typeof body.phone !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be text.",
      });
    }

    const existingUser = await profileModel.getProfile(req.user.id);

    if (!existingUser || existingUser.status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        message: "Your session is no longer valid. Please log in again.",
      });
    }

    const phone =
      body.phone === undefined
        ? existingUser.phone
        : body.phone === null
          ? null
          : body.phone.trim() || null;

    if (phone !== null && !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain exactly 10 digits.",
      });
    }

    await profileModel.updateProfile(req.user.id, {
      full_name: body.full_name.trim(),
      phone,
    });

    const user = await profileModel.getProfile(req.user.id);

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        message: "Your session is no longer valid. Please log in again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};