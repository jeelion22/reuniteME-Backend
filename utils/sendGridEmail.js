const sgMail = require("@sendgrid/mail");
const { SENDGRID_API_KEY, SENDER_EMAIL } = require("./config");

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmailToVerifyEmail = async (option) => {
  const msg = {
    to: option.email,
    from: `ReUniteME <${SENDER_EMAIL}>`,
    subject: option.subject,
    html: option.message,
    trackingSettings: {
      clickTracking: { enable: false, enableText: false },
    },
  };

  try {
    const result = await sgMail.send(msg);
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error(
      "❌ Error sending email:",
      error.response?.body || error.message
    );
    throw error;
  }
};

module.exports = sendEmailToVerifyEmail;
