const express = require("express");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const driverRoutes = require("./routes/driverRoutes");
const errorHandler = require("./middleware/errorHandler");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const userRoutes = require("./routes/userRoutes");
const garageRoutes = require("./routes/garageRoutes");
const repairRoutes = require("./routes/repairRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const myVehicleRoutes = require("./routes/myVehicleRoutes");
const issueRoutes = require("./routes/issueRoutes");
const myMaintenanceRoutes = require("./routes/myMaintenanceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const profileRoutes = require("./routes/profileRoutes");
const swaggerUi = require("swagger-ui-express");
const openapi = require("./docs/openapi");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());

app.get("/api-docs.json", (req, res) => {
  res.json(openapi);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openapi, {
    swaggerOptions: {
      persistAuthorization: false,
      validatorUrl: null,
    },
    customSiteTitle: "Fleet Maintenance API Documentation",
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/users", userRoutes);
app.use("/api/garages", garageRoutes);
app.use("/api/repairs", repairRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/my-vehicle", myVehicleRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/my-maintenance", myMaintenanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fleet Maintenance Log System Backend API is running...",
  });
});
app.use(errorHandler);

module.exports = app;