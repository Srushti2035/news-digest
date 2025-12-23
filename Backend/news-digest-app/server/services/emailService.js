const axios = require('axios');

const sendEmail = async ({ to, subject, htmlContent }) => {
    const apiKey = process.env.BREVO_API_KEY;
    console.log("Debug: Checking API Key...");
    if (!apiKey) {
        console.error("Debug: API Key is MISSING in process.env");
    } else {
        console.log(`Debug: API Key found. Length: ${apiKey.length}, Starts with: ${apiKey.substring(0, 10)}...`);
    }

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: { email: "machanna037@gmail.com", name: "News Digest" },
                to: [{ email: to }],
                subject: subject,
                htmlContent: htmlContent
            },
            {
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                    'content-type': 'application/json'
                }
            }
        );
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("Debug: Full Error Object:", error);
        if (error.response) {
            console.error("Debug: Brevo Error Response Data:", JSON.stringify(error.response.data, null, 2));
            console.error("Debug: Brevo Error Status:", error.response.status);
        }
        return false;
    }
};

const sendResetPasswordEmail = async (email, resetUrl) => {
    const htmlContent = `
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #2563eb; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Password Reset</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hi there,</p>
                        <p>You requested a password reset. Click the button below to set a new password:</p>
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                        </div>
                        <p>If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>
                    </div>
                    <div style="background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #666;">
                        &copy; ${new Date().getFullYear()} News Digest.
                    </div>
                </div>
            </body>
        </html>
    `;
    return sendEmail({ to: email, subject: "Reset Your Password", htmlContent });
};

module.exports = { sendEmail, sendResetPasswordEmail };
