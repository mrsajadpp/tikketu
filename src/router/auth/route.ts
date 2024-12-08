// src/auth/app.ts
import express, { Router, Request, Response, NextFunction } from "express";
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