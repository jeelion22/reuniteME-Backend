const nodemailer = require("nodemailer");
const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_PWD,
  EMAIL_USERNAME,
} = require("./config");

const sendEmailToVerifyEmail = async (option) => {
  try {
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
      from: "ReuniteME support<contact.reuniteme@gmail.com>",
      to: option.email,
      subject: option.subject,
      html: option.message,
    };
    await transporter.sendMail(emailOptions);
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendEmailToVerifyEmail;
