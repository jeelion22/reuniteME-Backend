const nodemailer = require("nodemailer");
const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_PWD,
  EMAIL_USERNAME,
} = require("./config");

const sendEmailToVerifyEmail = async (option) => {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,

    secure: true,

    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PWD,
    },
  });

  const emailOptions = {
    from: "ReuniteME support<support@reuniteme.com>",
    to: option.email,
    subject: option.subject,
    text: option.message,
  };
  await transporter.sendMail(emailOptions);
};

module.exports = sendEmailToVerifyEmail;
