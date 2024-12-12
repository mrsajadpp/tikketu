// src/ads/route.ts
import express, { Router, Request, Response, NextFunction } from "express";
var jwt = require('jsonwebtoken');
import userFunctions from "../../models/users/model";
import secretFunctions from "../../models/secretlinks/model";
import mailTemplates from "../../email/mail_templates";
import adsFunctions from "../../models/ads/model";

let verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const decoded = await jwt.verify(token, 'tikketu@123');
        decoded ? (decoded.id ? null : res.status(401).json({ error: 'Invalid token' })) : res.status(401).json({ error: 'Invalid token' });
        let user = await userFunctions.find_user(mysql, decoded.id);
        if (!user) return res.status(401).json({ error: 'Access denied' });
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

const router = (mysql: any): Router => {
    const router = express.Router();
    secretFunctions.create_table(mysql);

    // New Advertisement Endpoint
    router.post("/create", verifyToken, async (req: Request, res: Response): Promise<any> => {
        const {
            ads_publisher_id,
            images,
            videos,
            title,
            description,
            advertisement_url,
            last_payment_date,
            next_payment_date,
            amount,
            target_location,
            target_age,
            target_views,
            target_clicks,
            other_properties,
        } = req.body;

        try {
            if (!ads_publisher_id) {
                return res.status(400).json({
                    error: "ads_publisher_id is required."
                });
            }
            if (!title) {
                return res.status(400).json({
                    error: "title is required."
                });
            }
            if (!description) {
                return res.status(400).json({
                    error: "description is required."
                });
            }
            if (!advertisement_url) {
                return res.status(400).json({
                    error: "advertisement_url is required."
                });
            }
            if (!amount) {
                return res.status(400).json({
                    error: "amount is required."
                });
            }
            if (!target_location) {
                return res.status(400).json({
                    error: "target_location is required."
                });
            }

            const adData = {
                ads_publisher_id,
                images: images || null,
                videos: videos || null,
                title,
                description,
                advertisement_url,
                last_payment_date: last_payment_date || null,
                next_payment_date: next_payment_date || null,
                amount,
                target_location,
                target_age: target_age || null,
                target_views: target_views || 0,
                target_clicks: target_clicks || 0,
                other_properties: other_properties || null,
            };

            const result = await adsFunctions.insert_ad(mysql, adData);

            res.status(201).json({ message: "Ad created successfully", ad_id: result.insertId });
        } catch (error: any) {
            console.error("Error creating ad:", error.message);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    });

    return router;
};

export default router;