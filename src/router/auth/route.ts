// src/auth/app.ts
import express, { Router, Request, Response } from "express";
import userFunctions from "../../models/users/model";

const router = (mysql: any): Router => {
    const router = express.Router();
    userFunctions.create_table(mysql);

    // Signup Endpoint
    router.post('/signup', async (req: Request, res: Response) => {
        const { name, email, password } = req.body;

        try {
            if (!name) {
                res.status(400).json({ error: "Full name is required" });
                return;
            }
            if (!email) {
                res.status(400).json({ error: "Email is required" });
                return;
            }
            if (!password) {
                res.status(400).json({ error: "Password is required" });
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({ error: "Invalid email structure" });
                return;
            }

            const user = await userFunctions.insert_user(mysql, { name, email, password });
            res.status(201).json({ message: "User created successfully", user });
            return;
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error creating user" });
            return;
        }
    })

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