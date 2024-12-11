// src/ads/route.ts
import express, { Router, Request, Response, NextFunction } from "express";
import adsFunctions from "../../models/ads/model";
import userFunctions from "../../models/users/model";

const jwt = require('jsonwebtoken');

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

    adsFunctions.create_table(mysql);

    // Need to fix bug

    router.post('/create', verifyToken, (req: Request, res: Response, next: NextFunction): Promise<any> => {
        return res.send('Fetching users from DB');
    });

    return router;
};

export default router;