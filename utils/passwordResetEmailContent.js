const passwordResetEmailContent = (name = "", verificationLink) => {
  const date = new Date();
  const year = date.getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>ReUniteME - Password Reset Request</title>
    <style type="text/css">
        /* Basic styles for all email clients */
        body { margin: 0; padding: 0; min-width: 100%; background-color: #f4f4f4; }
        table { border-collapse: collapse; }
        td { padding: 0; }
        img { border: 0; -ms-interpolation-mode: bicubic; }

        /* Responsive styles */
        @media only screen and (max-width: 600px) {
            .wrapper { width: 100% !important; }
            .content { width: 100% !important; display: block !important; }
            .header-image img { width: 100% !important; height: auto !important; }
            .main-content { padding: 20px !important; }
            .button { width: 100% !important; display: block !important; }
            .button a { width: 100% !important; display: block !important; padding: 15px 0 !important; }
        }
    </style>
</head>
<body style="margin: 3rem; padding: 0; min-width: 100%; background-color: #f4f4f4;">
    <center style="width: 100%; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto;">
            <!--[if (gte mso 9)|(IE)]>
            <table width="600" align="center" style="border-spacing:0;font-family:sans-serif;color:#333333;" role="presentation">
            <tr>
            <td style="padding:0;">
            <![endif]-->
            <table class="wrapper" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-spacing:0;font-family:sans-serif;color:#333333;max-width:600px;margin:0 auto;">
                <tr>
                    <td class="header" style="background-color: #ffffff; padding: 20px 0; text-align: center;">
                        <img src="https://reuniteme-backend.onrender.com/public/images/reuniteme_logo.png" alt="ReUniteME Logo" width="60" style="border:0; -ms-interpolation-mode:bicubic;">
                        <p style="font-size: 24px; font-weight: bold; color: #6a0dad; margin: 10px 0 0 0;">ReUniteME</p>
                    </td>
                </tr>
                <tr>
                    <td class="main-content" style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
                        <p style="font-size: 18px; line-height: 26px; color: #333333; margin: 0 0 15px 0;">Hello, ${name}</p>
                        <p style="font-size: 16px; line-height: 24px; color: #555555; margin: 0 0 25px 0;">
                            We received a request to reset the password for your ReUniteME account.
                            If you made this request, please click the button below to reset your password:
                        </p>
                        <table class="button" cellpadding="0" cellspacing="0" role="presentation" style="border-spacing:0;margin:0 auto 30px auto;">
                            <tr>
                                <td align="center" style="padding: 10px 0;">
                                    <a href=${verificationLink} target="_blank" style="background-color: #6a0dad; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                                        Reset Password
                                    </a>
                                </td>
                            </tr>
                        </table>
                        <p style="font-size: 16px; line-height: 24px; color: #555555; margin: 0 0 15px 0;">
                            This link is valid for a limited time. If you did not request a password reset, please ignore this email.
                        </p>
                        <p style="font-size: 16px; line-height: 24px; color: #555555; margin: 0 0 15px 0;">
                            Thanks,<br>The ReUniteME Team
                        </p>
                    </td>
                </tr>
                <tr>
                    <td class="footer" style="padding: 20px; text-align: center; font-size: 12px; color: #888888;">
                        <p style="margin: 0;">&copy; ${year} ReUniteME. All rights reserved.</p>
                        <p style="margin: 5px 0 0 0;">123 Missing Person Dr, City, State, 12345</p>
                    </td>
                </tr>
            </table>
            <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
        </div>
    </center>
</body>
</html>`;
};

module.exports = passwordResetEmailContent;
