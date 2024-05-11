// const config = require("./config");
// const twilioClient = require("./twilioClient");

// const sendOTP = async (phoneNumber) => {
//   const otp = Math.floor(10000 + Math.random() * 900000);
//   const msge = `Your verification code for ReUniteME account is ${otp}`;

//   return await twilioClient.messages
//     .create({
//       body: msge,
//       to: phoneNumber,
//       from: config.TWILIO_PHONE_NUMBER,
//     })
//     .then((msge) => {
//       console.log(msge.sid);
//       return otp;
//     })
//     .catch((error) => {
//       console.log(error);
//       throw error;
//     });
// };

// module.exports = sendOTP;

const crypto = require("crypto");
const config = require("./config");
const twilioClient = require("./twilioClient");

const generateSecureOtp = () => {
  const buffer = crypto.randomBytes(3);
  const otp = parseInt(buffer.toString("hex"), 16) % 1000000;
  return otp.toString().padStart(6, "0"); // Ensuring the OTP is 6 digits
};

const sendOTP = async (phoneNumber) => {
  const otp = generateSecureOtp();
  const message = `Your verification code for ReUniteME account is ${otp}`;

  try {
    const response = await twilioClient.messages.create({
      body: message,
      to: phoneNumber,
      from: config.TWILIO_PHONE_NUMBER,
    });
    console.log("Message sent with SID:", response.sid);
    return otp; // Consider security implications of returning OTP
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};

module.exports = sendOTP;
