const EmailCredential = require("../models/EmailCredential");
const {
  encryptOAuth2Secret,
  decryptOAuth2Secret,
} = require("../utils/emailCredentialEncryption");
const { google } = require("googleapis");
const { saveRefreshToken } = require("../utils/oauthService");
const crypto = require("crypto");

const gmailController = {
  saveCredentials: async (req, res) => {
    try {
      const { clientId, clientSecret, senderEmail, createdBy } = req.body;
      if (!clientId || !clientSecret || !senderEmail || !createdBy) {
        return res.status(400).json({ message: "Missing fields" });
      }
      await EmailCredential.deleteMany({});
      await EmailCredential.create({
        clientId: encryptOAuth2Secret(clientId),
        clientSecret: encryptOAuth2Secret(clientSecret),
        senderEmail,
        createdBy,
        refreshToken: "",
        redirectUri: "",
      });
      res.json({
        message: "Encrypted credentials saved. Generate OAuth2 const URL next.",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
      });
    }
  },

  getAuthUrl: async (req, res) => {
    try {
      const redirect_uri = req.query.redirect_uri;

      if (!redirect_uri)
        return res
          .status(400)
          .json({ message: "redirect_uri query param required." });

      const cred = await EmailCredential.findOne();
      if (!cred)
        return res.status(400).json({
          message: "No credentials stored. Save them first.",
        });

      const clientId = decryptOAuth2Secret(cred.clientId);
      const clientSecret = decryptOAuth2Secret(cred.clientSecret);

      const oAuth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirect_uri
      );

      const state = crypto.randomBytes(16).toString("hex");

      const authUri = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ["https://mail.google.com/"],
        state,
      });

      cred.redirectUri = encryptOAuth2Secret(redirect_uri);
      cred.state = encryptOAuth2Secret(state);
      await cred.save();

      res.json({ authUri });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
  oauth2Callback: async (req, res) => {
    try {
      const { code, state } = req.query;
      const cred = await EmailCredential.findOne();
      if (!cred) return res.status(400).send("Credentials not found.");

      const savedState = cred.state ? decryptOAuth2Secret(cred.state) : null;
      if (!state || state !== savedState)
        return res.status(403).send("Invalid or missing state parameter.");

      const clientId = decryptOAuth2Secret(cred.clientId);
      const clientSecret = decryptOAuth2Secret(cred.clientSecret);
      const redirectUri = decryptOAuth2Secret(cred.redirectUri);

      const oAuth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
      );
      const { tokens } = await oAuth2Client.getToken(code);

      if (tokens.refresh_token) {
        await saveRefreshToken(tokens.refresh_token);
      }
      await EmailCredential.updateOne({}, { $unset: { state: "" } });
      res.send(
        "<h3>OAuth2 setup complete. Refresh token stored encrypted.</h3>"
      );
    } catch (error) {
      console.error(error);
      res.status(500).send("OAuth callback error: " + error.message);
    }
  },
};

module.exports = gmailController;
