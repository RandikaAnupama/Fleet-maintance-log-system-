const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

    const login = async (req, res) => {
    try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
    return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
    });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
    return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
    });
    }

    console.log("JWT_SECRET =", process.env.JWT_SECRET);

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
        );


    res.status(200).json({
        success: true,
        message: "Login successful.",
        token,
        user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
        },
    });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        res.status(500).json({
        success: false,
        message: error.message,
        });
    }
    };


module.exports = {
  register,
  login,
};