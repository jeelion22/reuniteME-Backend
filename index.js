const mongoose = require("mongoose");
const adminController = require("./controllers/adminController");
const { MONGODB_PORT, MONGODB_URI } = require("./utils/config");
// const { connectMongo, mongoose } = require("./csfleClient");

const config = require("./utils/config");

const app = require("./app");

console.log("Connecting to MongoDB...");

const connectMongo = async () => {
  await mongoose.connect(MONGODB_URI);
};

connectMongo()
  .then(() => {
    console.log("Connected to MongoDB...");

    return adminController.createAdmin();
  })
  .then(() => {
    console.log("Admin user setup completed");
    const PORT = config.MONGODB_PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error during startup process", error);
    process.exit(1);
  });
