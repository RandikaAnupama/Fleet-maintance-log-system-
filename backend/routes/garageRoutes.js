const express = require("express");
const router = express.Router();

const garageController = require("../controllers/garageController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.use(verifyToken);
router.use(authorizeRoles("ADMIN"));

router.get("/", garageController.getAllGarages);
router.get("/:id", garageController.getGarageById);
router.post("/", garageController.createGarage);
router.put("/:id", garageController.updateGarage);
router.delete("/:id", garageController.deactivateGarage);

module.exports = router;