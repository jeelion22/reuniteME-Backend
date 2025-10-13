const createEmailContent = (name = "there", verificationLink) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" style="width: 100%; font-family: 'Inter', sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; padding: 0; margin: 0;">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Verify Your ReUniteME Account</title>

    <!-- Preheader Text - Appears in inbox preview -->
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;
            font-family: 'Inter', sans-serif;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            background-color: #f4f6f8;
            color: #333333;
        }
        table {
            border-spacing: 0;
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        td {
            padding: 0;
            vertical-align: top;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        a {
            text-decoration: none;
            color: #007BFF;
        }
        /* Mobile specific styles */
        @media screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
            }
            .content-padding {
                padding: 0 15px !important;
            }
            .button {
                padding: 12px 20px !important;
                font-size: 15px !important;
            }
            h2 {
                font-size: 22px !important;
            }
            p {
                font-size: 15px !important;
            }
            .header-logo {
                padding-left: 15px !important;
                text-align: center !important; /* Center on mobile if no specific image logo */
            }
            .header-logo a {
                display: block !important;
                text-align: center !important;
            }
            .footer-content {
                text-align: center !important;
            }
        }
    </style>
</head>
<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f4f6f8; color: #333333;">

    <!-- Preheader text (visible in some email clients before opening) -->
    <div style="display:none;font-size:1px;color:#f4f6f8;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
        Verify your ReUniteME account to get started!
    </div>
    
    <!-- Fallback for text-only email clients -->
    <pre style="display:none !important; visibility:hidden; mso-hide:all; font-size:1px; color:#ffffff; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
        Verify Your ReUniteME Account

        Hi ${name},

        Thank you for joining our community. To activate your account and start your journey with us, please use the verification link below:

        ${verificationLink}

        This link will be valid for only 30 minutes.

        If you did not sign up for this service, you can safely ignore this email.

        ReUniteME
    </pre>

    <center style="width: 100%; background-color: #f4f6f8;">
        <!-- Email Wrapper -->
        <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 auto; background-color: #f4f6f8;">
            <tr>
                <td style="padding: 20px 0;">
                    <!-- Main Container -->
                    <table class="email-container" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
                        <!-- Header -->
                        <tr>
                            <td class="header-logo" style="background: linear-gradient(270deg, rgb(149, 135, 175), rgb(200, 196, 209), rgb(255, 255, 255)); padding: 24px 20px; border-bottom: 1px solid #e0e0e0; text-align: left;">
                                <a href="https://reuniteme.netlify.app" target="_blank" rel="noopener noreferrer" style="font-size: 28px; font-weight: 700; color: #333333 !important; text-decoration: none;">ReUniteME</a>
                            </td>
                        </tr>

                        <!-- Content Area -->
                        <tr>
                            <td class="content-padding" style="padding: 20px 40px 0px 40px; text-align: center;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td style="padding-bottom: 20px;">
                                            <h2 style="margin: 0; font-family: 'Inter', sans-serif; font-size: 24px; line-height: 30px; font-weight: 600; color: #1a1a1a;">Welcome, ${name}!</h2>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 20px;">
                                            <p style="margin: 0; font-family: 'Inter', sans-serif; font-size: 16px; line-height: 24px; color: #555555;">Thank you for joining our community. To activate your account and start your journey with us, please click the button below to verify your email address.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 30px;">
                                            <!-- Button -->
                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: auto;">
                                                <tr>
                                                    <td style="border-radius: 8px; background: #007BFF; box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);">
                                                        <a href="${verificationLink}" target="_blank" rel="noopener noreferrer" class="button" style="background: #007BFF; border: 1px solid #007BFF; font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.2; text-align: center; text-decoration: none; padding: 14px 28px; color: #ffffff !important; border-radius: 8px; display: inline-block; font-weight: 600;">Verify My Account</a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 20px;">
                                            <p style="margin: 0; font-family: 'Inter', sans-serif; font-size: 14px; line-height: 20px; color: #555555;">If the button above does not work, please copy and paste the following link into your browser:</p>
                                            <p style="margin: 10px 0 0 0; font-family: 'Inter', sans-serif; font-size: 14px; line-height: 20px; color: #007BFF; word-break: break-all;"><a href="${verificationLink}" target="_blank" rel="noopener noreferrer" style="color: #007BFF; text-decoration: none;">${verificationLink}</a></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 40px;">
                                            <p style="margin: 0; font-family: 'Inter', sans-serif; font-size: 14px; line-height: 20px; color: #555555;">This link will be valid for only 30 minutes.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td class="content-padding footer-content" style="padding: 24px 40px; border-top: 1px solid #e0e0e0; font-size: 12px; line-height: 18px; color: #999999; text-align: center;">
                                <p style="margin: 0 0 5px 0; font-family: 'Inter', sans-serif; font-size: 12px; line-height: 18px; color: #999999;">This email was sent by ReUniteME.</p>
                                <p style="margin: 0; font-family: 'Inter', sans-serif; font-size: 12px; line-height: 18px; color: #999999;">If you did not sign up for this service, you can safely ignore this email.</p>
                                <!-- IMPORTANT: Implement List-Unsubscribe header in your email sending service -->
                                <!-- <p style="margin-top: 15px; font-family: 'Inter', sans-serif; font-size: 12px; line-height: 18px; color: #999999;"><a href="YOUR_UNSUBSCRIBE_LINK_HERE" style="color: #777777 !important; text-decoration: underline;">Unsubscribe</a></p> -->
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>

</body>
</html>`;
};

module.exports = { createEmailContent };
