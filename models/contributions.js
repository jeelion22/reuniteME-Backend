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
        phone === "NA" ||
        validator.isMobilePhone(phone, "any", { strictMode: false }),
      message: (props) => `${props.value} is not a valid phone number`,
    },
  },

  description: { type: String, default: "NA" },
  bucket: String,
  key: String,
  uploadDate: { type: Date, default: Date.now },
  fileType: String,
  fileSize: Number,
  location: { latitude: Number, longitude: Number },
});

module.exports = contributionShema;
