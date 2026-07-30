const bcrypt = require("bcrypt");
const { createUser, findUserByEmail } = require("../models/userModel");
const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
    return res.status(400).json({
        success: false,
        message: "Email already exists.",
    });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser(full_name, email, hashedPassword);

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
};

module.exports = {
  register,
};