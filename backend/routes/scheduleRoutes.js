const express = require("express");
const router = express.Router();

const scheduleController = require("../controllers/scheduleController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.use(verifyToken);
router.use(authorizeRoles("ADMIN"));

router.get("/", scheduleController.getAllSchedules);
router.get("/:id", scheduleController.getScheduleById);
router.post("/", scheduleController.createSchedule);
router.put("/:id", scheduleController.updateSchedule);
router.post("/:id/complete", scheduleController.completeSchedule);
router.post("/:id/cancel", scheduleController.cancelSchedule);
router.delete("/:id", scheduleController.deleteSchedule);

module.exports = router;