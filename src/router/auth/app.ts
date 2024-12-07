// src/auth/app.ts
import express, { Router, Request, Response } from "express";
import userFunctions from "../../models/users/model";

const router = (mysql: any): Router => {
    const router = express.Router();
    userFunctions.create_table(mysql).then((result) => {
        console.log(result);
    });

    router.get('/', (req: Request, res: Response) => {
        const newUser = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'securepassword123',
        };

        userFunctions.insert_user(mysql, newUser);

        res.send('Fetching users from DB');
    });

    router.get('/:id', async (req: Request, res: Response) => {
        let users = await userFunctions.find_all_users(mysql);
        res.send(`Fetching user ${users} from DB`);
    });

    return router;
};

export default router;