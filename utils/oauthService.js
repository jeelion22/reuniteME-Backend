const { google } = require("googleapis");
const EmailCredential = require("../models/EmailCredential");
const {
  encryptOAuth2Secret,
  decryptOAuth2Secret,
} = require("./emailCredentialEncryption");

async function getDecryptedCredentials() {
  const doc = await EmailCredential.findOne();
  if (!doc) throw Error("Email credentials not set. Admin must initialize");
  return {
    clientId: decryptOAuth2Secret(doc.clientId),
    clientSecret: decryptOAuth2Secret(doc.clientSecret),
    senderEmail: doc.senderEmail,
    refreshToken: doc.refreshToken
      ? decryptOAuth2Secret(doc.refreshToken)
      : null,
    redirectUri: doc.redirectUri ? decryptOAuth2Secret(doc.redirectUri) : null,
  };
}

function createOAuthClient({ clientId, clientSecret, redirectUri }) {
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

async function saveRefreshToken(refreshToken) {
  const doc = await EmailCredential.findOne();
  if (!doc) throw Error("Email credentails not set.");
  doc.refreshToken = encryptOAuth2Secret(refreshToken);
  await doc.save();
}

module.exports = {
  getDecryptedCredentials,
  createOAuthClient,
  saveRefreshToken,
};
