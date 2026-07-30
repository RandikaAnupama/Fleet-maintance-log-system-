require("dotenv").config();

console.log("Step 1: server.js started");

const app = require("./app");

console.log("Step 2: app imported");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});