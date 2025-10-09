const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");

const EmailCredentialSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    senderEmail: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },

    redirectUri: {
      type: String,
    },
    state: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timeStamps: true }
);

module.exports = mongoose.model(
  "EmailCredential",
  EmailCredentialSchema,
  "emailCredentials"
);
