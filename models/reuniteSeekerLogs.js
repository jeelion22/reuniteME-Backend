const mongoose = require("mongoose");
const validator = require("validator");

const reuniteSeekersLogsSchema = new mongoose.Schema({
  contributionId: {
    type: String,
    required: true,
  },
  visitorsId: {
    type: String,
    required: true,
  },
  relationship: {
    type: String,
    required: true,
  },

  lastSeen: {
    type: Date,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  contactNo: {
    type: String,
    required: true,
    validate: {
      validator: (phone) =>
        validator.isMobilePhone(phone, "any", { strictMode: false }),
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  meetingDate: {
    type: Date,
    required: true,
  },
  willUpdate: {
    type: Boolean,
    required: true,
  },
  visitedDate: {
    type: Date,
    default: Date.now,
  },
  checking: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ["rescued", "not-rescued"],
    default: "not-rescued",
  },
});

module.exports = mongoose.model(
  "ReuniteSeekersLogs",
  reuniteSeekersLogsSchema,
  "reuniteSeekersLogs"
);
