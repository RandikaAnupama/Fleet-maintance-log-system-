const express = require("express");
const router = express.Router();

const driverController = require("../controllers/driverController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// View all drivers
router.get(
  "/",
  verifyToken,
  driverController.getAllDrivers
);

// View one driver
router.get(
  "/:id",
  verifyToken,
  driverController.getDriverById
);

// Add driver - ADMIN only
router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN"),
  driverController.createDriver
);

// Update driver - ADMIN only
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  driverController.updateDriver
);

// Deactivate driver - ADMIN only
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  driverController.deactivateDriver
);

module.exports = router;