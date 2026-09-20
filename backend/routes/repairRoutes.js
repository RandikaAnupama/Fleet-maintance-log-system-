const express = require("express");
const router = express.Router();

const repairController = require("../controllers/repairController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.use(verifyToken);
router.use(authorizeRoles("ADMIN"));

router.get("/", repairController.getAllRepairs);
router.get("/:id", repairController.getRepairById);
router.post("/", repairController.createRepair);
router.put("/:id", repairController.updateRepair);
router.delete("/:id", repairController.deleteRepair);

module.exports = router;