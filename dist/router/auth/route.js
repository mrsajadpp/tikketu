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
// src/auth/app.ts
const express_1 = __importDefault(require("express"));
const model_1 = __importDefault(require("../../models/users/model"));
const router = (mysql) => {
    const router = express_1.default.Router();
    model_1.default.create_table(mysql);
    // Signup Endpoint
    router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            const user = yield model_1.default.insert_user(mysql, { name, email, password });
            res.status(201).json({ message: "User created successfully", user });
            return;
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error creating user" });
            return;
        }
    }));
    // Login Endpoint
    router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password } = req.body;
        try {
            const user = yield model_1.default.find_user(mysql, email);
        }
        catch (error) {
            res.status(500).json({ error: "Error logging in" });
        }
    }));
    // Password Reset Endpoint
    router.post('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        try {
        }
        catch (error) {
            res.status(500).json({ error: "Error initiating password reset" });
        }
    }));
    // Password Reset Verification Endpoint
    router.get('/reset-password/:token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { token } = req.params;
        try {
        }
        catch (error) {
            res.status(500).json({ error: "Error verifying reset token" });
        }
    }));
    // Email URL Verification Endpoint
    router.get('/verify-email/:token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { token } = req.params;
        try {
        }
        catch (error) {
            res.status(500).json({ error: "Error verifying email" });
        }
    }));
    return router;
};
exports.default = router;
