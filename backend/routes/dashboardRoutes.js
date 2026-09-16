const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", verifyToken, dashboardController.getDashboard);

module.exports = router;