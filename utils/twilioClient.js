const config = require("./config");

const accountSid = config.TWILIO_ACCOUNTSID;
const authToken = config.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

module.exports = client;
