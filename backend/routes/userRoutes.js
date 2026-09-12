const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get(
  "/",
  verifyToken,
  authorizeRoles("ADMIN"),
  userController.getAllUsers
);

router.get(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  userController.getUserById
);

router.put(
  "/:id/role",
  verifyToken,
  authorizeRoles("ADMIN"),
  userController.updateUserRole
);

router.put(
  "/:id/status",
  verifyToken,
  authorizeRoles("ADMIN"),
  userController.updateUserStatus
);

module.exports = router;