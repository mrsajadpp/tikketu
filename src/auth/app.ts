// src/auth/app.ts
import express, { Router, Request, Response } from "express";
const router = (mysql: any): Router => {
    const router = express.Router();

    router.get('/', (req: Request, res: Response) => {
        res.send('Fetching users from DB');
    });

    router.get('/:id', (req: Request, res: Response) => {
        res.send(`Fetching user ${req.params.id} from DB`);
    });

    return router;
};

export default router;