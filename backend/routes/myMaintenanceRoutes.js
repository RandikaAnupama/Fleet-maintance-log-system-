const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const myMaintenanceController = require("../controllers/myMaintenanceController");

const router = express.Router();

router.get(
  "/",
  verifyToken,
  myMaintenanceController.getMyMaintenance
);

module.exports = router;