const mongoose = require("mongoose");
const validator = require("validator");

const contributionShema = new mongoose.Schema({
  name: { type: String, default: "NA" },
  address: {
    type: String,

    default: "NA",
  },
  phone: {
    type: String,
    default: "NA",
    validate: {
      validator: (phone) =>
        phone === "" ||
        phone === "NA" ||
        validator.isMobilePhone(phone, "any", { strictMode: false }),
      message: (props) => `${props.value} is not a valid phone number`,
    },
  },

  description: { type: String, default: "NA" },
  bucket: String,
  key: String,
  uploadDate: { type: Date, default: Date.now },
  fileName: String,
  fileType: String,
  fileSize: Number,
  location: { latitude: Number, longitude: Number },
  status: {
    type: String,
    enum: ["rescued", "not-rescued"],
    default: "not-rescued",
  },
});

module.exports = contributionShema;
