const crypto = require("crypto");
const {
  EMAIL_ENCRYPTION_ALGORITHM,
  EMAIL_ENCRYPTION_SECRET_KEY,
} = require("./config");

const KEY = crypto
  .createHash("sha256")
  .update(EMAIL_ENCRYPTION_SECRET_KEY)
  .digest();

function encryptOAuth2Secret(plainText) {
  if (!plainText && plainText !== "") return "";

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(EMAIL_ENCRYPTION_ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(String(plainText), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag(0);

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString(
    "hex"
  )}`;
}

function decryptOAuth2Secret(payload) {
  if (!payload) return "";
  const [ivHex, tagHex, encryptedHex] = payload.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(EMAIL_ENCRYPTION_ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

module.exports = { encryptOAuth2Secret, decryptOAuth2Secret };
