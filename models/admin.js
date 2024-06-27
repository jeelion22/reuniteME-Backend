const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");

const adminSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: [5, "Username should be at least 5 characters."],
    maxlength: [8, "Username should not exceed 8 characters."],
  },
  firstname: {
    type: String,
    required: true,
    minlength: [3, "First name should be at lease 3 characters"],
    maxlength: [12, "First name should not exceed 12 characters"],
  },

  lastname: {
    type: String,
    required: true,
    minlength: [1, "Last name should be at least 3 characters"],
    maxlength: [15, "Last name should not exceed 15 characters."],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: (props) => `${props.value} is not a valid email address.`,
    },
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (phone) =>
        validator.isMobilePhone(phone, "any", { strictMode: false }),
      message: (props) => `${props.value} is not a valid phone number`,
    },
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "admin",
  },
  permissions: {
    type: [
      {
        type: String,
        required: true,
        enum: ["read", "write", "delete", "update"],
      },
    ],
    default: ["read"],
    requried: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["active", "suspended", "deleted"],
    default: "active",
  },
  lastLogin: {
    type: Date,
  },

  emailVerificationToken: {
    type: String,
  },
  emailVerificationTokenExpires: {
    type: Date,
  },

  isRequestedPasswordReset: {
    type: Boolean,
    default: false,
  },
});

adminSchema.methods.createEmailVerificationToken = function () {
  const emailToken = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(emailToken)
    .digest("hex");
  this.emailVerificationTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

  return emailToken;
};

module.exports = mongoose.model("Admin", adminSchema, "admins");
