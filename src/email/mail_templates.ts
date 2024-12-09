import send_mail from "./config";

const mailTemplates = {
    // Signup verification template for Tikketu
    signup_verification: async (to: string, verificationUrl: string, name: string) => {
        const mailOptions = {
            from: "noreply.grovix@gmail.com",
            to: to,
            subject: "Verify Your Tikketu Account",
            text: `Hello ${name},\n\nWelcome to Tikketu! To complete your registration, please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis step helps us ensure the security of your account.\n\nThank you for joining Tikketu!`,
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2>Hello, ${name}!</h2>
                <p>Welcome to <strong>Tikketu</strong>! To complete your registration, please verify your email address by clicking the button below:</p>
                <a href="${verificationUrl}" style="background-color: #0078e8; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
                <p>If the button above doesn't work, copy and paste the following URL into your browser:</p>
                <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                <p>This step helps us ensure the security of your account and provide you with a seamless ticketing experience.</p>
                <p>Thank you for joining us!</p>
                <p>Best Regards,</p>
                <p><strong>The Tikketu Team</strong></p>
            </div>
        `,
        };

        try {
            await send_mail(mailOptions);
            console.log("Verification email sent successfully to:", to);
        } catch (err) {
            console.error("Error sending verification email:", err);
        }
    },

    // Account successfully verified template for Tikketu
    account_verified: async (to: string, name: string) => {
        const mailOptions = {
            from: "noreply.grovix@gmail.com",
            to: to,
            subject: "Your Tikketu Account Has Been Verified!",
            text: `Hi ${name},\n\nCongratulations! Your Tikketu account has been successfully verified. You can now log in and explore all the features we offer to make your events more enjoyable.\n\nThank you for choosing Tikketu!`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                    <h2>Hi ${name},</h2>
                    <p>Congratulations! Your <strong>Tikketu</strong> account has been successfully verified.</p>
                    <p>You can now log in and explore all the features we offer to make managing and enjoying your events a breeze.</p>
                    <p>Thank you for choosing us!</p>
                    <p>Best Regards,</p>
                    <p><strong>The Tikketu Team</strong></p>
                </div>
            `,
        };

        try {
            await send_mail(mailOptions);
            console.log("Account verification email sent successfully to:", to);
        } catch (err) {
            console.error("Error sending account verification email:", err);
        }
    },

    // New login notification template for Tikketu
    new_login_notification: async (to: string, name: string, loginTime: string) => {
        const mailOptions = {
            from: "noreply@tikketu.com",
            to: to,
            subject: "New Login Detected on Your Tikketu Account",
            text: `Hi ${name},\n\nWe detected a new login to your Tikketu account at ${loginTime}.\n\nIf this was not you, please reset your password immediately.\n\nThank you for being with Tikketu.`,
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2>Hello, ${name},</h2>
                <p>We detected a new login to your <strong>Tikketu</strong> account:</p>
                <ul>
                    <li><strong>Time:</strong> ${loginTime}</li>
                </ul>
                <p>If this was you, no further action is needed. If this wasn't you, please reset your password immediately to secure your account.</p>
                <p>Thank you for being with us!</p>
                <p>Best Regards,</p>
                <p><strong>The Tikketu Team</strong></p>
            </div>
        `,
        };

        try {
            await send_mail(mailOptions);
            console.log("New login notification email sent successfully to:", to);
        } catch (err) {
            console.error("Error sending new login notification email:", err);
        }
    }
};

export default mailTemplates;
