import send_mail from "./config";

const mailTemplates = {
    signup_verification: async (to: string, verificationLink: string) => {
        const mailOptions = {
            from: "noreply.grovix@gmail.com",
            to: to,
            subject: "Verify Your Email Address",
            text: `Welcome! Please verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 6 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                    <h2>Welcome to Our Platform!</h2>
                    <p>We're excited to have you join us. Please verify your email address by clicking the button below:</p>
                    <a href="${verificationLink}" style="background-color: #0078e8; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
                    <p>If you cannot click the button, copy and paste the following URL into your browser:</p>
                    <p><a href="${verificationLink}">${verificationLink}</a></p>
                    <p><strong>Note:</strong> This link will expire in 6 minutes.</p>
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
};

export default mailTemplates;
