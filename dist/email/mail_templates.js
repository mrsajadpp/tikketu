"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const mailTemplates = {
    // Signup verification template for Tikketu
    signup_verification: (to, verificationUrl, name) => __awaiter(void 0, void 0, void 0, function* () {
        const mailOptions = {
            from: 'Tikketu <noreply.tikketu@gmail.com>',
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
            yield (0, config_1.default)(mailOptions);
            console.log("Verification email sent successfully to:", to);
        }
        catch (err) {
            console.error("Error sending verification email:", err);
        }
    }),
    // Account successfully verified template for Tikketu
    account_verified: (to, name) => __awaiter(void 0, void 0, void 0, function* () {
        const mailOptions = {
            from: 'Tikketu <noreply.tikketu@gmail.com>',
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
            yield (0, config_1.default)(mailOptions);
            console.log("Account verification email sent successfully to:", to);
        }
        catch (err) {
            console.error("Error sending account verification email:", err);
        }
    }),
    // New login notification template for Tikketu
    new_login_notification: (to, name, loginTime) => __awaiter(void 0, void 0, void 0, function* () {
        const mailOptions = {
            from: 'Tikketu <noreply.tikketu@gmail.com>',
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
            yield (0, config_1.default)(mailOptions);
            console.log("New login notification email sent successfully to:", to);
        }
        catch (err) {
            console.error("Error sending new login notification email:", err);
        }
    }),
    // Password reset template for Tikketu
    password_reset: (to, resetUrl, name) => __awaiter(void 0, void 0, void 0, function* () {
        const mailOptions = {
            from: 'Tikketu <noreply.tikketu@gmail.com>',
            to: to,
            subject: "Reset Your Tikketu Password",
            text: `Hi ${name},\n\nWe received a request to reset your Tikketu account password. You can reset it by clicking the link below:\n\n${resetUrl}\n\nIf you did not request a password reset, please ignore this email or contact our support team.\n\nThe link will expire in 6 minutes.\n\nBest Regards,\nThe Tikketu Team`,
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2>Hello, ${name},</h2>
                <p>We received a request to reset your <strong>Tikketu</strong> account password. Click the button below to reset it:</p>
                <a href="${resetUrl}" style="background-color: #0078e8; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
                <p>If the button above doesn’t work, copy and paste the following URL into your browser:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p><strong>Note:</strong> This link will expire in 6 minutes. If you did not request a password reset, please ignore this email or contact our support team for assistance.</p>
                <p>Best Regards,</p>
                <p><strong>The Tikketu Team</strong></p>
            </div>
        `,
        };
        try {
            yield (0, config_1.default)(mailOptions);
            console.log("Password reset email sent successfully to:", to);
        }
        catch (err) {
            console.error("Error sending password reset email:", err);
        }
    }),
    password_reset_notification: (to, name) => __awaiter(void 0, void 0, void 0, function* () {
        const mailOptions = {
            from: 'Tikketu <noreply.tikketu@gmail.com>',
            to: to,
            subject: "Your Tikketu Password Has Been Reset",
            text: `Hi,\n\nYour Tikketu account password has been successfully reset. If you did not request this reset, please contact our support team immediately.\n\nBest Regards,\nThe Tikketu Team`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                    <h2>Hello,</h2>
                    <p>Your <strong>Tikketu</strong> account password has been successfully reset.</p>
                    <p>If you did not request this reset, please contact our support team immediately to secure your account.</p>
                    <p>Thank you for being with us!</p>
                    <p>Best Regards,</p>
                    <p><strong>The Tikketu Team</strong></p>
                </div>
            `,
        };
        try {
            yield (0, config_1.default)(mailOptions);
            console.log("Password reset email sent successfully to:", to);
        }
        catch (err) {
            console.error("Error sending password reset email:", err);
        }
    })
};
exports.default = mailTemplates;
