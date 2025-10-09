const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const EmailCredential = require("../models/EmailCredential");
const { decryptOAuth2Secret } = require("../utils/emailCredentialEncryption");

const sendEmailToVerifyEmail = async (option) => {
  try {
    // Fetch credentails
    const cred = await EmailCredential.findOne();
    if (!cred) throw new Error("Email credentials not configured.");

    const clientId = decryptOAuth2Secret(cred.clientId);
    const clientSecret = decryptOAuth2Secret(cred.clientSecret);
    const refreshToken = decryptOAuth2Secret(cred.refreshToken);
    const senderEmail = cred.senderEmail;

    // OAuth2 client setup
    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oAuth2Client.setCredentials({ refresh_token: refreshToken });

    const { token: accessToken } = await oAuth2Client.getAccessToken();

    // Create Nodemailer transporter

    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        type: "OAuth2",
        user: "contact.reuniteme@gmail.com",
        clientId,
        clientSecret,
        refreshToken,
        accessToken,
      },
    });

    // 3. Define email
    const mailOptions = {
      from: `ReUniteME <${senderEmail}>`,
      to: option.email,
      subject: option.subject,
      html: option.message,
    };

    // 4. Send email
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error(
      "❌ Error sending email:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = sendEmailToVerifyEmail;
