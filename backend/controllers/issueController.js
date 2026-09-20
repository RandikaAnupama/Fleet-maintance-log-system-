const issueModel = require("../models/issueModel");
const myVehicleModel = require("../models/myVehicleModel");

const fail = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

const validId = (value) =>
  /^[1-9]\d*$/.test(String(value)) &&
  Number.isSafeInteger(Number(value));

const getActiveUser = async (req, res) => {
  if (!validId(req.user?.id)) {
    fail(res, 401, "Invalid login session. Please log in again.");
    return null;
  }

  const user = await myVehicleModel.getUserAssignment(Number(req.user.id));

  if (!user) {
    fail(res, 401, "User account not found. Please log in again.");
    return null;
  }

  if (user.status !== "ACTIVE") {
    fail(res, 403, "Your account is inactive.");
    return null;
  }

  if (!["ADMIN", "USER"].includes(user.role)) {
    fail(res, 403, "Access denied.");
    return null;
  }

  return user;
};

const getIssues = async (req, res) => {
  try {
    const user = await getActiveUser(req, res);
    if (!user) return;

    const issues =
      user.role === "ADMIN"
        ? await issueModel.getAllIssues()
        : await issueModel.getIssuesByUserId(user.id);

    return res.status(200).json({
      success: true,
      issues,
    });
  } catch (error) {
    console.error("Get issues error:", error);
    return fail(res, 500, "Failed to get issues.");
  }
};

const getIssueById = async (req, res) => {
  try {
    const user = await getActiveUser(req, res);
    if (!user) return;

    if (!validId(req.params.id)) {
      return fail(res, 400, "Invalid issue ID.");
    }

    const issue = await issueModel.getIssueById(Number(req.params.id));

    if (
      !issue ||
      (user.role !== "ADMIN" &&
        Number(issue.reported_by_user_id) !== Number(user.id))
    ) {
      return fail(res, 404, "Issue not found.");
    }

    return res.status(200).json({
      success: true,
      issue,
    });
  } catch (error) {
    console.error("Get issue error:", error);
    return fail(res, 500, "Failed to get issue.");
  }
};

const createIssue = async (req, res) => {
  try {
    const user = await getActiveUser(req, res);
    if (!user) return;

    if (user.role !== "USER") {
      return fail(res, 403, "Only USER accounts can submit vehicle issues.");
    }

    const body = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return fail(res, 400, "A JSON object is required.");
    }

    const allowedFields = ["title", "description", "priority"];

    if (Object.keys(body).some((key) => !allowedFields.includes(key))) {
      return fail(
        res,
        400,
        "Send only title, description and priority. Your vehicle and reporter details are determined automatically."
      );
    }

    const { title, description, priority = "MEDIUM" } = body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 150
    ) {
      return fail(res, 400, "Issue title must contain 1 to 150 characters.");
    }

    if (typeof description !== "string" || !description.trim()) {
      return fail(res, 400, "Issue description is required.");
    }

    if (Buffer.byteLength(description.trim(), "utf8") > 65535) {
      return fail(res, 400, "Issue description is too long.");
    }

    if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
      return fail(res, 400, "Invalid issue priority.");
    }

    const vehicle = await myVehicleModel.getAssignedVehicle(user.id);

    if (!vehicle) {
      return fail(
        res,
        400,
        "No vehicle assigned. Please contact the administrator."
      );
    }

    if (vehicle.status === "INACTIVE") {
      return fail(
        res,
        400,
        "Your assigned vehicle is inactive. Please contact the administrator."
      );
    }

    const issueId = await issueModel.createIssue({
      vehicle_id: vehicle.id,
      reported_by: user.full_name,
      reported_by_user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      priority,
    });

    return res.status(201).json({
      success: true,
      message: "Issue submitted successfully.",
      issueId,
    });
  } catch (error) {
    console.error("Create issue error:", error);

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return fail(
        res,
        409,
        "Your account or vehicle details changed. Refresh and try again."
      );
    }

    return fail(res, 500, "Failed to submit issue.");
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const user = await getActiveUser(req, res);
    if (!user) return;

    if (user.role !== "ADMIN") {
      return fail(res, 403, "Only administrators can update issue status.");
    }

    if (!validId(req.params.id)) {
      return fail(res, 400, "Invalid issue ID.");
    }

    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).some((key) => key !== "status")
    ) {
      return fail(res, 400, "Send only the status field.");
    }

    if (!["OPEN", "IN_PROGRESS", "RESOLVED"].includes(body.status)) {
      return fail(res, 400, "Invalid issue status.");
    }

    const id = Number(req.params.id);
    const issue = await issueModel.getIssueById(id);

    if (!issue) {
      return fail(res, 404, "Issue not found.");
    }

    await issueModel.updateIssueStatus(id, body.status);

    return res.status(200).json({
      success: true,
      message: "Issue status updated successfully.",
    });
  } catch (error) {
    console.error("Update issue status error:", error);
    return fail(res, 500, "Failed to update issue status.");
  }
};

module.exports = {
  getIssues,
  getIssueById,
  createIssue,
  updateIssueStatus,
};