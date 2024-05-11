// require dotenv library
require("dotenv").config();

// create configuration variables for db
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_PORT = process.env.MONGODB_PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
const EMAIL_PWD = process.env.EMAIL_PWD;
const TWILIO_ACCOUNTSID = process.env.TWILIO_ACCOUNTSID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const TWILIO_SERVICES = process.env.TWILIO_SERVICES;
const VONAGE_API_KEY = process.env.VONAGE_API_KEY;
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET;
const TOKEN_EXPIRES = process.env.TOKEN_EXPIRES;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME;
const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME;
const ADMIN_EMAIL_ADDR = process.env.ADMIN_EMAIL_ADDR;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PHONE = process.env.ADMIN_PHONE;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

// export all these configuration variables
module.exports = {
  MONGODB_URI,
  MONGODB_PORT,
  JWT_SECRET,
  TOKEN_EXPIRES,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USERNAME,
  EMAIL_PWD,
  TWILIO_ACCOUNTSID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  TWILIO_SERVICES,
  VONAGE_API_KEY,
  VONAGE_API_SECRET,
  ADMIN_USERNAME,
  ADMIN_USERNAME,
  ADMIN_FIRST_NAME,
  ADMIN_LAST_NAME,
  ADMIN_EMAIL_ADDR,
  ADMIN_PASSWORD,
  ADMIN_PHONE,
  ADMIN_JWT_SECRET,
};
