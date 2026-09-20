const jwt = require("jsonwebtoken");
const { getUserById } = require("../models/userModel");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const match =
    typeof authHeader === "string"
      ? /^Bearer\s+(\S+)$/i.exec(authHeader.trim())
      : null;

  if (!match) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization header.",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }

  const userId = Number(decoded?.id);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return res.status(401).json({
      success: false,
      message: "Invalid login session.",
    });
  }

  try {
    const user = await getUserById(userId);

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        message: "Your session is no longer valid. Please log in again.",
      });
    }

    if (!["ADMIN", "USER"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      status: user.status,
    };
  } catch (error) {
    console.error("Authentication database error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify your account. Please try again.",
    });
  }

  return next();
};

module.exports = verifyToken;