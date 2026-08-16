const driverModel = require("../models/driverModel");

const getAllDrivers = async (req, res) => {
  try {
    const drivers = await driverModel.getAllDrivers();

    res.status(200).json({
      success: true,
      drivers,
    });
  } catch (error) {
    console.error("Get drivers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get drivers.",
    });
  }
};

const getDriverById = async (req, res) => {
  try {
    const driver = await driverModel.getDriverById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found.",
      });
    }

    res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    console.error("Get driver error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get driver.",
    });
  }
};

const createDriver = async (req, res) => {
  try {
    const {
      full_name,
      license_number,
      phone,
      email,
      address,
      status,
    } = req.body;

    if (!full_name || !license_number) {
      return res.status(400).json({
        success: false,
        message: "Full name and license number are required.",
      });
    }

    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
            success: false,
            message: "Invalid email address.",
            });
        }
        }
    
    if (phone && !/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
            success: false,
            message: "Phone number must contain 10 digits.",
        });
        }


    const existingDriver =
      await driverModel.findDriverByLicense(license_number);

    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: "Driver license number already exists.",
      });
    }

    const driverId = await driverModel.createDriver({
      full_name,
      license_number,
      phone,
      email,
      address,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Driver created successfully.",
      driverId,
    });
  } catch (error) {
    console.error("Create driver error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create driver.",
    });
  }
};

const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const existingDriver = await driverModel.getDriverById(id);

    if (!existingDriver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found.",
      });
    }

    const updatedDriver = {
      ...existingDriver,
      ...req.body,
    };

    await driverModel.updateDriver(id, updatedDriver);

    res.status(200).json({
      success: true,
      message: "Driver updated successfully.",
    });
  } catch (error) {
    console.error("Update driver error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update driver.",
    });
  }
};

const deactivateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await driverModel.getDriverById(id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found.",
      });
    }

    await driverModel.deactivateDriver(id);

    res.status(200).json({
      success: true,
      message: "Driver deactivated successfully.",
    });
  } catch (error) {
    console.error("Deactivate driver error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to deactivate driver.",
    });
  }
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deactivateDriver,
};