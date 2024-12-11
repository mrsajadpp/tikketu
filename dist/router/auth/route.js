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
// src/auth/route.ts
const express_1 = __importDefault(require("express"));
var jwt = require('jsonwebtoken');
const model_1 = __importDefault(require("../../models/users/model"));
const model_2 = __importDefault(require("../../models/secretlinks/model"));
const mail_templates_1 = __importDefault(require("../../email/mail_templates"));
const router = (mysql) => {
    const router = express_1.default.Router();
    model_1.default.create_table(mysql);
    model_2.default.create_table(mysql);
    // Signup Endpoint
    router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            const user = yield model_1.default.insert_user(mysql, name, email, password);
            const verification_url = yield model_2.default.generate_verification_link(mysql, email, "http://localhost:3001");
            mail_templates_1.default.signup_verification(email, verification_url, name);
            return res.status(201).json({ message: "User created successfully", user });
        }
        catch (error) {
            console.error(error);
            if (error.message === 'User already registered with this email') {
                return res.status(404).json({ error: 'User already registered with this email' });
            }
            return res.status(500).json({ error: "Error creating user" });
        }
    }));
    // Verification Endpoint
    router.post('/verify-user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { token } = req.body;
        try {
            if (!token) {
                return res.status(400).json({ error: "Token is required" });
            }
            const user = yield model_2.default.verify_and_fetch_user(mysql, token);
            var jwt_token = jwt.sign(user, 'tikketu@123');
            mail_templates_1.default.account_verified(user.email, user.name);
            return res.status(200).json({
                message: "User verified successfully",
                token: jwt_token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            });
        }
        catch (error) {
            console.error(error);
            if (error.message === 'Token not found or expired') {
                return res.status(404).json({ error: "Invalid or expired token" });
            }
            if (error.message === 'User not found') {
                return res.status(404).json({ error: "User not found" });
            }
            return res.status(500).json({ error: "Error logging in" });
        }
    }));
    // Login Endpoint
    router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password } = req.body;
        try {
            if (!email) {
                return res.status(400).json({ error: "Email is required" });
            }
            if (!password) {
                return res.status(400).json({ error: "Password is required" });
            }
            const user = yield model_1.default.find_user_by_email_and_password(mysql, email, password);
            const sessionData = {
                id: user.id,
                name: user.name,
                email: user.email,
            };
            var jwt_token = jwt.sign(sessionData, 'tikketu@123');
            let login_time = new Date().toString();
            mail_templates_1.default.new_login_notification(user.email, user.name, login_time);
            return res.status(200).json({
                message: "Login successful",
                user: sessionData,
                token: jwt_token
            });
        }
        catch (error) {
            if (error.message === "Invalid email or password") {
                return res.status(401).json({ error: "Invalid email or password" });
            }
            console.error("Error during login:", error);
            return res.status(500).json({ error: "Error logging in" });
        }
    }));
    // Password Reset Endpoint
    router.post('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        try {
            if (!email) {
                return res.status(400).json({ error: "Email is required" });
            }
            let user = yield model_1.default.find_by_email(mysql, email);
            let reset_link = yield model_2.default.generate_password_reset_link(mysql, email, "http://localhost:3001");
            mail_templates_1.default.password_reset(email, reset_link, user.name);
            return res.status(200).json({ message: "Password reset email has been sent" });
        }
        catch (error) {
            if (error.message === "Error saving verification token") {
                return res.status(401).json({ error: "Error saving verification token" });
            }
            return res.status(500).json({ error: "Error initiating password reset" });
        }
    }));
    // Password Reset Verification Endpoint
    router.post('/reset-password/:token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            let user = yield model_2.default.find_user_by_token(mysql, token);
            model_2.default.validate_and_update_password(mysql, token, password);
            mail_templates_1.default.password_reset_notification(user.email, user.name);
            return res.status(200).json({ message: "Password has been reset" });
        }
        catch (error) {
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
    }));
    return router;
};
exports.default = router;
