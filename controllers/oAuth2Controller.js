const { google } = require("googleapis");
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } = require("../utils/config");

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

const oAuth2Controller = {
  googleAuthCallBack: async (req, res) => {
    const code = req.query.code;

    if (!code) return res.status(400).json({ message: "No code provided" });

    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      console.log("Refresh Token:", tokens.refresh_token);

      res.json({
        message: "Google OAuth successful! You can close this page now.",
      });
    } catch (error) {
      console.error("Error exchanging code for token:", error);
      res.status(500).send("Error during OAuth process");
    }
  },
};

module.exports = oAuth2Controller;
