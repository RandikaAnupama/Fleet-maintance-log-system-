const express = require("express");
const router = express.Router();

const driverController = require("../controllers/driverController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get(
  "/",
  verifyToken,
  driverController.getAllDrivers
);

router.get(
  "/:id",
  verifyToken,
  driverController.getDriverById
);

router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN"),
  driverController.createDriver
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  driverController.updateDriver
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  driverController.deactivateDriver
);

module.exports = router;