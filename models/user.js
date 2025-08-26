const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const contributionShema = require("./contributions");

const { encrypt, decrypt } = require("../utils/encryption");

const userSchema = mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    minlength: [3, "First name should be at least 3 characters."],
    maxlength: [12, "First name should not exceed 12 characters."],
  },
  lastname: {
    type: String,
    required: true,
    minlength: [1, "Second name should be at least 1 character."],
    maxlength: [15, "Second name should not exceed 15 characters."],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (phone) =>
        validator.isMobilePhone(phone, "any", { strictMode: false }),
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  prevPhones: [],
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  passwordHash: {
    type: String,
    validate: {
      validator: function (v) {
        return this.isEmailVerified ? v : true;
      },
      message: "Password is required",
    },
  },
  contributions: [contributionShema],
  userCategory: {
    type: String,
    enum: ["communityUploader", "reuniteSeeker", "both"],
    default: "communityUploader",
    required: true,
  },
  address: {
    type: String,
    validate: {
      validator: function (v) {
        return this.userCategory === "reuniteSeeker" ||
          this.userCategory === "both"
          ? !!v
          : true;
      },
      message: "Address is required for Reunite Seeker or Both categories.",
    },
  },
  authorizedIdType: {
    type: String,
    validate: {
      validator: function (v) {
        return this.userCategory === "reuniteSeeker" ||
          this.userCategory === "both"
          ? !!v
          : true;
      },
      message:
        "Authorized ID Type is required for Reunite Seeker or Both categories.",
    },
  },
  authorizedIdNo: {
    type: String,
    validate: {
      validator: function (v) {
        return this.userCategory === "reuniteSeeker" ||
          this.userCategory === "both"
          ? !!v
          : true;
      },
      message:
        "Authorized ID Number is required for Reunite Seeker or Both categories.",
    },
  },
  role: {
    type: String,
    default: "user",
  },
  isActive: {
    type: Boolean,
    required: true,
    default: false,
  },
  isPasswordSet: {
    type: Boolean,
    required: true,
    default: false,
  },

  isAccountDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },

  accountRegisteredAt: { type: Date, default: Date.now },
  accountDeletetedAt: {
    type: Date,
  },
  whoDeleted: [
    {
      userId: {
        _id: false,
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      role: {
        type: String,
        enum: ["Admin", "User"],
      },
      deletionDate: { type: Date, default: Date.now },
    },
  ],
  emailVerificationToken: String,
  emailVerificationTokenExpires: Date,
  otp: String,
  otpExpires: Date,

  isRequestedPasswordReset: {
    type: Boolean,
    default: false,
  },
});

// Encrypt before save
userSchema.pre("save", function (next) {
  if (this.isModified("authorizedIdNo") && this.authorizedIdNo) {
    try {
      this.authorizedIdNo = encrypt(this.authorizedIdNo);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Encrypt on findOneAndUpdate
userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update && update.authorizedIdNo) {
    update.authorizedIdNo = encrypt(update.authorizedIdNo);
  }
  next();
});

// Helper to decrypt a single doc
function decryptAuthorizedIdNo(doc) {
  if (!doc) return;
  if (doc.authorizedIdNo) {
    try {
      doc.authorizedIdNo = decrypt(doc.authorizedIdNo);
    } catch (error) {
      console.error("Error decrypting authorizedIdNo", error);
    }
  }
}

// Decrypt after fetching
userSchema.post("init", decryptAuthorizedIdNo); // runs when a doc is initialized (single doc)
userSchema.post("findOne", decryptAuthorizedIdNo); // single doc
userSchema.post("find", function (docs) {
  docs.forEach((doc) => decryptAuthorizedIdNo(doc));
});

userSchema.methods.createEmailVerificationToken = function () {
  const emailToken = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(emailToken)
    .digest("hex");
  this.emailVerificationTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

  return emailToken;
};

userSchema.methods.createOTPHash = function (otp) {
  this.otp = crypto.createHash("sha256").update(otp).digest("hex");
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
};

module.exports = mongoose.model("User", userSchema, "users");
