const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const issueController = require("../controllers/issueController");

const router = express.Router();

router.use(verifyToken);

router.get("/", issueController.getIssues);
router.get("/:id", issueController.getIssueById);
router.post("/", issueController.createIssue);
router.put("/:id/status", issueController.updateIssueStatus);

module.exports = router;