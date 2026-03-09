const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI,
  GMAIL_REFRESH_TOKEN,
  GMAIL_USERNAME,
  GMAIL_SERVICE
} = require("./config");

const oAuth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI,
);

oAuth2Client.setCredentials({
    refresh_token: GMAIL_REFRESH_TOKEN
});

const sendEmailToVerifyEmail = async (option)=>{

    

    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: GMAIL_SERVICE,
            auth: {
                type: "OAuth2",
                user: GMAIL_USERNAME,
                clientId: GMAIL_CLIENT_ID,
                clientSecret: GMAIL_CLIENT_SECRET,
                refreshToken: GMAIL_REFRESH_TOKEN,
                accessToken: accessToken.token
            }
        });

        const mailOptions = {
            to: option.email,
            from: `ReUniteME <${GMAIL_USERNAME}>`,
            subject: option.subject,
            html: option.message
        }

        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent:", result.messageId)

        


    } catch (error) {
        console.log("Error:", error)
    }
}