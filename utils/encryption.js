const crypto = require("crypto");
const { ENC_KEY, ALGORITHM, IV_LENGTH } = require("../utils/config");

const algorithm = ALGORITHM || "aes-256-cbc"; // default if undefined
const key = Buffer.from(ENC_KEY, "base64"); // convert base64 string to Buffer
const ivLength = Number(IV_LENGTH) || 16; // default IV length (16 bytes)

const encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
};

const decrypt = (data) => {
  if (!data || typeof data !== "string" || !data.includes(":")) {
    // Empty, null, or not in iv:encrypted format
    return data;
  }

  const [ivHex, encrypted] = data.split(":");

  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");

  decrypted += decipher.final("utf8");
  return decrypted;
};

module.exports = { encrypt, decrypt };
