// src/auth/app.ts
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

            mailTemplates.signup_verification(email, verification_url);
            return res.status(201).json({ message: "User created successfully", user });
        } catch (error) {
            console.error(error);
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
            var jwt_token = jwt.sign(user, 'tikketu@123', { algorithm: 'RS256' });

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
    router.post('/login', async (req: Request, res: Response) => {
        const { email, password } = req.body;
        try {
            const user = await userFunctions.find_user(mysql, email);

        } catch (error) {
            res.status(500).json({ error: "Error logging in" });
        }
    });

    // Password Reset Endpoint
    router.post('/reset-password', async (req: Request, res: Response) => {
        const { email } = req.body;
        try {

        } catch (error) {
            res.status(500).json({ error: "Error initiating password reset" });
        }
    });

    // Password Reset Verification Endpoint
    router.get('/reset-password/:token', async (req: Request, res: Response) => {
        const { token } = req.params;
        try {

        } catch (error) {
            res.status(500).json({ error: "Error verifying reset token" });
        }
    });

    // Email URL Verification Endpoint
    router.get('/verify-email/:token', async (req: Request, res: Response) => {
        const { token } = req.params;
        try {

        } catch (error) {
            res.status(500).json({ error: "Error verifying email" });
        }
    });

    return router;
};

export default router;