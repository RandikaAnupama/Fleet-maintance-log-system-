const express = require("express");
const router = express.Router();

const vehicleController = require("../controllers/vehicleController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// View all vehicles
router.get(
  "/",
  verifyToken,
  vehicleController.getAllVehicles
);

// View one vehicle
router.get(
  "/:id",
  verifyToken,
  vehicleController.getVehicleById
);

// Add vehicle - ADMIN only
router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN"),
  vehicleController.createVehicle
);

// Update vehicle - ADMIN only
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  vehicleController.updateVehicle
);

// Deactivate vehicle - ADMIN only
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  vehicleController.deactivateVehicle
);

module.exports = router;