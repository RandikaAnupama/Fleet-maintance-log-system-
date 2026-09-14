const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const myVehicleController = require("../controllers/myVehicleController");

const router = express.Router();

router.get(
  "/",
  verifyToken,
  myVehicleController.getMyVehicle
);

module.exports = router;