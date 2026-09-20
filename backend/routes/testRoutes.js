const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get("/protected", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected route accessed successfully.",
    user: req.user,
  });
});

router.get(
  "/admin-only",
  verifyToken,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin-only route accessed successfully.",
      user: req.user,
    });
  }
);

module.exports = router;