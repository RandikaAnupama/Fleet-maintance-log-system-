const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");

router.use(verifyToken);

router.get("/", profileController.getProfile);
router.put("/", profileController.updateProfile);

module.exports = router;