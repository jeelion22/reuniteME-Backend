const express = require("express");
const gmailController = require("../controllers/gmailController");
const auth = require("../middleware/auth");

const gmailRouter = express.Router();

gmailRouter.post(
  "/credentials",
  auth.isAuthAdmin,
  auth.isAdminPermittedToRead,
  auth.isAdminPermittedToUpdate,
  auth.isAdminPermittedToDelete,

  gmailController.saveCredentials
);

gmailRouter.get(
  "/auth-url",
  auth.isAuthAdmin,
  auth.isAdminPermittedToRead,
  auth.isAdminPermittedToUpdate,
  auth.isAdminPermittedToDelete,
  gmailController.getAuthUrl
);

gmailRouter.get(
  "/oauth2callback",

  gmailController.oauth2Callback
);

module.exports = gmailRouter;
