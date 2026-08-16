const vehicleModel = require("../models/vehicleModel");

// Get all vehicles
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleModel.getAllVehicles();

    res.status(200).json({
      success: true,
      vehicles,
    });
  } catch (error) {
    console.error("Get vehicles error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get vehicles.",
    });
  }
};

// Get vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await vehicleModel.getVehicleById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    console.error("Get vehicle error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get vehicle.",
    });
  }
};

// Create vehicle
const createVehicle = async (req, res) => {
  try {
    const {
      registration_number,
      make,
      model,
      manufacture_year,
      vehicle_type,
      fuel_type,
      mileage,
      status,
    } = req.body;

    if (!registration_number || !make || !model) {
      return res.status(400).json({
        success: false,
        message: "Registration number, make and model are required.",
      });
    }

    const existingVehicle =
      await vehicleModel.findVehicleByRegistration(registration_number);

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle registration number already exists.",
      });
    }

    const vehicleId = await vehicleModel.createVehicle({
      registration_number,
      make,
      model,
      manufacture_year,
      vehicle_type,
      fuel_type,
      mileage,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully.",
      vehicleId,
    });
  } catch (error) {
    console.error("Create vehicle error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create vehicle.",
    });
  }
};

// Update vehicle
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const existingVehicle = await vehicleModel.getVehicleById(id);

    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    const updatedVehicle = {
      ...existingVehicle,
      ...req.body,
    };

    await vehicleModel.updateVehicle(id, updatedVehicle);

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully.",
    });
  } catch (error) {
    console.error("Update vehicle error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update vehicle.",
    });
  }
};

// Deactivate vehicle
const deactivateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await vehicleModel.getVehicleById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    await vehicleModel.deactivateVehicle(id);

    res.status(200).json({
      success: true,
      message: "Vehicle deactivated successfully.",
    });
  } catch (error) {
    console.error("Deactivate vehicle error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to deactivate vehicle.",
    });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deactivateVehicle,
};