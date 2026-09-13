const garageModel = require("../models/garageModel");

const validId = (id) => /^[1-9]\d*$/.test(String(id));

const validateGarage = ({ name, status }) => {
  if (typeof name !== "string" || !name.trim()) {
    return "Garage name is required.";
  }

  if (name.trim().length > 150) {
    return "Garage name cannot exceed 150 characters.";
  }

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    return "Invalid garage status.";
  }

  return null;
};

const handleError = (res, error, message) => {
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "Garage name already exists.",
    });
  }

  console.error(message, error);

  return res.status(500).json({
    success: false,
    message,
  });
};

const getAllGarages = async (req, res) => {
  try {
    const garages = await garageModel.getAllGarages();

    return res.status(200).json({
      success: true,
      garages,
    });
  } catch (error) {
    return handleError(res, error, "Failed to get garages.");
  }
};

const getGarageById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid garage ID.",
      });
    }

    const garage = await garageModel.getGarageById(id);

    if (!garage) {
      return res.status(404).json({
        success: false,
        message: "Garage not found.",
      });
    }

    return res.status(200).json({
      success: true,
      garage,
    });
  } catch (error) {
    return handleError(res, error, "Failed to get garage.");
  }
};

const createGarage = async (req, res) => {
  try {
    const { name, status = "ACTIVE" } = req.body || {};
    const validationError = validateGarage({ name, status });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const trimmedName = name.trim();
    const existingGarage = await garageModel.findGarageByName(trimmedName);

    if (existingGarage) {
      return res.status(409).json({
        success: false,
        message: "Garage name already exists.",
      });
    }

    const garageId = await garageModel.createGarage({
      name: trimmedName,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Garage created successfully.",
      garageId,
    });
  } catch (error) {
    return handleError(res, error, "Failed to create garage.");
  }
};

const updateGarage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid garage ID.",
      });
    }

    const existingGarage = await garageModel.getGarageById(id);

    if (!existingGarage) {
      return res.status(404).json({
        success: false,
        message: "Garage not found.",
      });
    }

    const body = req.body || {};
    const updatedGarage = {
      name: body.name === undefined ? existingGarage.name : body.name,
      status: body.status === undefined ? existingGarage.status : body.status,
    };

    const validationError = validateGarage(updatedGarage);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    updatedGarage.name = updatedGarage.name.trim();

    const duplicateGarage = await garageModel.findGarageByName(
      updatedGarage.name
    );

    if (duplicateGarage && String(duplicateGarage.id) !== String(id)) {
      return res.status(409).json({
        success: false,
        message: "Garage name already exists.",
      });
    }

    await garageModel.updateGarage(id, updatedGarage);

    return res.status(200).json({
      success: true,
      message: "Garage updated successfully.",
    });
  } catch (error) {
    return handleError(res, error, "Failed to update garage.");
  }
};

const deactivateGarage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid garage ID.",
      });
    }

    const garage = await garageModel.getGarageById(id);

    if (!garage) {
      return res.status(404).json({
        success: false,
        message: "Garage not found.",
      });
    }

    await garageModel.deactivateGarage(id);

    return res.status(200).json({
      success: true,
      message: "Garage deactivated successfully.",
    });
  } catch (error) {
    return handleError(res, error, "Failed to deactivate garage.");
  }
};

module.exports = {
  getAllGarages,
  getGarageById,
  createGarage,
  updateGarage,
  deactivateGarage,
};