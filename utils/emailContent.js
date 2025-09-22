const createEmailContent = (name = "there", verificationLink) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            color: #333333;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            /* background-image: url('http://cdn.mcauto-images-production.sendgrid.net/398af6b9d6b7b0e6/c135bdc7-fb71-4de1-a930-e26483b434fa/203x150.png'); */
            background-repeat: repeat;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            text-align: center;
        }
        .header {
            background:linear-gradient(270deg, rgb(149, 135, 175), rgb(200, 196, 209), rgb(255, 255, 255));
            padding: 24px 0;
            border-bottom: 1px solid #e0e0e0;
            margin-bottom: 24px;
            display: flex;
            justify-content: flex-start; /* Aligns the logo to the left */
            align-items: center;
        }
        .header img {
            max-width: 120px; /* Minimized the logo size a little */
            height: auto;
        }
        .logo {
            font-size: 28px;
            font-weight: 700;
            color: #333;
            text-decoration: none;
        }
        .content {
            padding: 0 20px;
        }
        h2 {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-top: 0;
            margin-bottom: 16px;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
            margin-bottom: 20px;
        }
        a.button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #007BFF; /* Industry standard blue */
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        a.button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 123, 255, 0.4);
        }
        .link-container {
            font-size: 14px;
            margin-top: 20px;
        }
        .footer {
            padding: 24px 0;
            margin-top: 30px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #999999;
            line-height: 1.5;
        }
        a {
            color: #007BFF; /* Link color matching the button */
            text-decoration: none;
        }
        .footer a {
            color: #777;
            text-decoration: underline;
        }
        .disclaimer {
            font-size: 10px;
            color: #aaaaaa;
            margin-top: 20px;
            line-height: 1.4;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <a href="https://reuniteme.netlify.app" class="logo"><img src="http://cdn.mcauto-images-production.sendgrid.net/398af6b9d6b7b0e6/c135bdc7-fb71-4de1-a930-e26483b434fa/203x150.png" alt="REUNITEME-LOGO"/></a>
    </div>

    <div class="content">
        <h2>Welcome, ${name}!</h2>
        <p>Thank you for joining our community. To activate your account and start your journey with us, please click the button below to verify your email address.</p>
        <p>
            <a href="${verificationLink}" class="button" target="_blank">Verify My Account</a>
        </p>
        <div class="link-container">
            <p>If the button above does not work, please copy and paste the following link into your browser:</p>
            <p><a href="${verificationLink}" target="_blank">${verificationLink}</a></p>
        </div>
        <p>This link will be valid for only 30 minutes.</p>
    </div>

    <div class="footer">
        <p>This email was sent by reuniteme.</p>
        <p>If you did not sign up for this service, you can safely ignore this email.</p>
        
    </div>
</div>

</body>
</html>`;
};

module.exports = { createEmailContent };
