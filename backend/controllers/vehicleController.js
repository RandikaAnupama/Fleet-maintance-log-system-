const vehicleModel = require("../models/vehicleModel");

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

    if (
      manufacture_year &&
      (manufacture_year < 1900 ||
        manufacture_year > new Date().getFullYear() + 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid manufacture year.",
      });
    }

    if (mileage !== undefined && mileage < 0) {
      return res.status(400).json({
        success: false,
        message: "Mileage cannot be negative.",
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

    const { registration_number, make, model, manufacture_year, mileage } =
      updatedVehicle;

    if (
      typeof registration_number !== "string" ||
      !registration_number.trim() ||
      typeof make !== "string" ||
      !make.trim() ||
      typeof model !== "string" ||
      !model.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Registration number, make and model are required.",
      });
    }

    if (manufacture_year !== null && manufacture_year !== undefined) {
      const year = Number(manufacture_year);

      if (
        !["string", "number"].includes(typeof manufacture_year) ||
        !Number.isInteger(year) ||
        year < 1900 ||
        year > new Date().getFullYear() + 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid manufacture year.",
        });
      }

      updatedVehicle.manufacture_year = year;
    }

    if (
      !["string", "number"].includes(typeof mileage) ||
      (typeof mileage === "string" && !mileage.trim()) ||
      !Number.isFinite(Number(mileage)) ||
      Number(mileage) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Mileage must be a valid non-negative number.",
      });
    }

    updatedVehicle.registration_number = registration_number.trim();
    updatedVehicle.make = make.trim();
    updatedVehicle.model = model.trim();
    updatedVehicle.mileage = Number(mileage);

    const duplicateVehicle = await vehicleModel.findVehicleByRegistration(
      updatedVehicle.registration_number
    );

    if (duplicateVehicle && String(duplicateVehicle.id) !== String(id)) {
      return res.status(400).json({
        success: false,
        message: "Vehicle registration number already exists.",
      });
    }

    await vehicleModel.updateVehicle(id, updatedVehicle);

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully.",
    });
  } catch (error) {
    console.error("Update vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle.",
    });
  }
};

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