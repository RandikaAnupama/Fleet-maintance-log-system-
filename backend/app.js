const express = require("express");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const driverRoutes = require("./routes/driverRoutes");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fleet Maintenance Log System Backend API is running...",
  });
});

module.exports = app;