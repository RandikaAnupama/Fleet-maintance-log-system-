const express = require("express");
const router = express.Router();

const maintenanceController = require("../controllers/maintenanceController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.use(verifyToken);
router.use(authorizeRoles("ADMIN"));

router.get("/", maintenanceController.getAllMaintenance);
router.get("/:id", maintenanceController.getMaintenanceById);
router.post("/", maintenanceController.createMaintenance);
router.put("/:id", maintenanceController.updateMaintenance);
router.delete("/:id", maintenanceController.deleteMaintenance);

module.exports = router;