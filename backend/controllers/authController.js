const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../models/userModel");

const fail = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

const validBody = (body) =>
  body && typeof body === "object" && !Array.isArray(body);

const validEmail = (email) =>
  email.length <= 100 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const register = async (req, res) => {
  try {
    if (!validBody(req.body)) {
      return fail(res, 400, "A JSON object is required.");
    }

    const { full_name, email, password } = req.body;

    if (
      typeof full_name !== "string" ||
      full_name.trim().length < 3 ||
      full_name.trim().length > 100
    ) {
      return fail(res, 400, "Full name must contain 3 to 100 characters.");
    }

    if (typeof email !== "string" || !validEmail(email.trim())) {
      return fail(res, 400, "Enter a valid email address.");
    }

    if (
      typeof password !== "string" ||
      password.length < 6 ||
      !password.trim()
    ) {
      return fail(res, 400, "Password must contain at least 6 characters.");
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
      return fail(res, 400, "Password must not exceed 72 UTF-8 bytes.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return fail(res, 409, "Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser(
      full_name.trim(),
      normalizedEmail,
      hashedPassword,
      "USER"
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return fail(res, 409, "Email already exists.");
    }

    console.error("Registration error:", error);
    return fail(res, 500, "Registration failed.");
  }
};

const login = async (req, res) => {
  try {
    if (!validBody(req.body)) {
      return fail(res, 400, "A JSON object is required.");
    }

    const { email, password } = req.body;

    if (typeof email !== "string" || !validEmail(email.trim())) {
      return fail(res, 400, "Enter a valid email address.");
    }

    if (typeof password !== "string" || !password) {
      return fail(res, 400, "Password is required.");
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
      return fail(res, 401, "Invalid email or password.");
    }

    const user = await findUserByEmail(email.trim().toLowerCase());

    if (!user) {
      return fail(res, 401, "Invalid email or password.");
    }

    const matches = await bcrypt.compare(password, user.password);

    if (!matches) {
      return fail(res, 401, "Invalid email or password.");
    }

    if (user.status !== "ACTIVE") {
      return fail(
        res,
        403,
        "Your account is inactive. Please contact the administrator."
      );
    }

    if (!["ADMIN", "USER"].includes(user.role)) {
      return fail(res, 403, "Account role is not permitted.");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return fail(res, 500, "Login failed.");
  }
};

module.exports = {
  register,
  login,
};