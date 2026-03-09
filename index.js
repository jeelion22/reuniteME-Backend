const mongoose = require("mongoose");
const adminController = require("./controllers/adminController");
const { MONGODB_PORT, MONGODB_URI } = require("./utils/config");
// const { connectMongo, mongoose } = require("./csfleClient");

const config = require("./utils/config");

const app = require("./app");

console.log("Connecting to MongoDB...");

console.log(MONGODB_URI)

const connectMongo = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};

connectMongo()
  .then(() => {
    return adminController.createAdmin();
  })
  .then(() => {
    console.log("Admin user setup completed");
    const PORT = config.MONGODB_PORT || 6000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error during startup process", error);
    process.exit(1);
  });
