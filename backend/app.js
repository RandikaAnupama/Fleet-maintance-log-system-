const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fleet Maintenance Log System Backend API is running...",
  });
});

module.exports = app;