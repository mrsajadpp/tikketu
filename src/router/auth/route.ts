// src/auth/route.ts
import express, { Router, Request, Response, NextFunction } from "express";
var jwt = require('jsonwebtoken');
import userFunctions from "../../models/users/model";
import secretFunctions from "../../models/secretlinks/model";
import mailTemplates from "../../email/mail_templates";

const router = (mysql: any): Router => {
    const router = express.Router();
    userFunctions.create_table(mysql);
    secretFunctions.create_table(mysql);

    // Signup Endpoint
    router.post('/signup', async (req: Request, res: Response): Promise<any> => {
        const { name, email, password } = req.body;

        try {
            if (!name) {
                return res.status(400).json({ error: "Full name is required" });
            }
            if (!email) {
                return res.status(400).json({ error: "Email is required" });
            }
            if (!password) {
                return res.status(400).json({ error: "Password is required" });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: "Invalid email structure" });
            }

            const user = await userFunctions.insert_user(mysql, name, email, password);
            const verification_url = await secretFunctions.generate_verification_link(mysql, email, "http://localhost:3001");

            mailTemplates.signup_verification(email, verification_url, name);
            return res.status(201).json({ message: "User created successfully", user });
        } catch (error: any) {
            console.error(error);
            if (error.message === 'User already registered with this email') {
                return res.status(404).json({ error: 'User already registered with this email' });
            }
            return res.status(500).json({ error: "Error creating user" });
        }
    });

    // Verification Endpoint
    router.post('/verify-user', async (req: Request, res: Response): Promise<any> => {
        const { token } = req.body;
        try {

            if (!token) {
                return res.status(400).json({ error: "Token is required" });
            }
            const user = await secretFunctions.verify_and_fetch_user(mysql, token);
            var jwt_token = jwt.sign(user, 'tikketu@123');

            mailTemplates.account_verified(user.email, user.name);

            return res.status(200).json({
                message: "User verified successfully",
                token: jwt_token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error: any) {
            console.error(error);

            if (error.message === 'Token not found or expired') {
                return res.status(404).json({ error: "Invalid or expired token" });
            }
            if (error.message === 'User not found') {
                return res.status(404).json({ error: "User not found" });
            }

            return res.status(500).json({ error: "Error logging in" });
        }
    });

    // Login Endpoint
    router.post('/login', async (req: Request, res: Response): Promise<any> => {
        const { email, password } = req.body;
        try {
            if (!email) {
                return res.status(400).json({ error: "Email is required" });
            }
            if (!password) {
                return res.status(400).json({ error: "Password is required" });
            }

            const user = await userFunctions.find_user_by_email_and_password(mysql, email, password);

            const sessionData = {
                id: user.id,
                name: user.name,
                email: user.email,
            };

            var jwt_token = jwt.sign(sessionData, 'tikketu@123');

            let login_time = new Date().toString()

            mailTemplates.new_login_notification(user.email, user.name, login_time);

            return res.status(200).json({
                message: "Login successful",
                user: sessionData,
                token: jwt_token
            });
        } catch (error: any) {
            if (error.message === "Invalid email or password") {
                return res.status(401).json({ error: "Invalid email or password" });
            }
            console.error("Error during login:", error);
            return res.status(500).json({ error: "Error logging in" });
        }
    });


    // Password Reset Endpoint
    router.post('/reset-password', async (req: Request, res: Response): Promise<any> => {
        const { email } = req.body;
        try {
            if (!email) {
                return res.status(400).json({ error: "Email is required" });
            }

            let user = await userFunctions.find_by_email(mysql, email);

            let reset_link = await secretFunctions.generate_password_reset_link(mysql, email, "http://localhost:3001");

            mailTemplates.password_reset(email, reset_link, user.name);

            return res.status(200).json({ message: "Password reset email has been sent" });
        } catch (error: any) {
            if (error.message === "Error saving verification token") {
                return res.status(401).json({ error: "Error saving verification token" });
            }
            return res.status(500).json({ error: "Error initiating password reset" });
        }
    });

    // Password Reset Verification Endpoint
    router.post('/reset-password/:token', async (req: Request, res: Response): Promise<any> => {
        const { token } = req.params;
        const { password } = req.body;
        try {
            if (!token) {
                return res.status(400).json({ error: "Token is required" });
            }

            if (!password) {
                return res.status(400).json({ error: "New password is required" });
            }

            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({ error: "Password must be at least 8 characters long, include letters, numbers, and special symbols." });
            }

            let user = await secretFunctions.find_user_by_token(mysql, token);

            secretFunctions.validate_and_update_password(mysql, token, password);

            mailTemplates.password_reset_notification(user.email, user.name);
            return res.status(200).json({ message: "Password has been reset" });
        } catch (error: any) {
            if (error.message === "Error updating password") {
                return res.status(401).json({ error: "Error updating password" });
            }
            if (error.message === "Error deleting token") {
                return res.status(401).json({ error: "Error deleting token" });
            }
            if (error.message === "Error hashing password") {
                return res.status(401).json({ error: "Error hashing password" });
            }
            return res.status(500).json({ error: "Error verifying reset token" });
        }
    });

    return router;
};

export default router;