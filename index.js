const mongoose = require("mongoose");
const adminController = require("./controllers/adminController");

const config = require("./utils/config");

const app = require("./app");

console.log("Connecting to MongoDB...");
// connect to MongoDB using mongoose
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB...");

    adminController
      .createAdmin()
      .then(() => {
        console.log("Admin user setup completed");
        const PORT = config.MONGODB_PORT || 5000;

        app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
        });
      })
      .catch((error) => {
        console.log("Failed to create admin user", error);
        process.exit(1);
      });
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB", error);
  });
