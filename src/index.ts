// src/index.ts
import express, { Express, Request, Response } from "express";
import * as dotenv from 'dotenv'
import path from 'path';

dotenv.config();

const fs = require("fs");
const morgan = require("morgan");
const colors = require('colors');
const cors = require('cors');
const mysql = require('./my_sql');


const app: Express = express();
const PORT = process.env.PORT || 3002;

import userRouter from './user/app';
import authRouter from './auth/app';
import imgRouter from './img/app';

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "../access.log"),
    { flags: "a" }
);



morgan.token('status', (req: Request, res: Response) => {
    const status = res.statusCode;
    let color = status >= 500 ? 'red'
        : status >= 400 ? 'yellow'
            : status >= 300 ? 'cyan'
                : status >= 200 ? 'green'
                    : 'reset';

    return colors[color](status);
});

app.use(cors());


app.use(
    morgan((tokens: any, req: Request, res: Response) => {
        return [
            colors.blue(tokens.method(req, res)),
            colors.magenta(tokens.url(req, res)),
            tokens.status(req, res),
            colors.cyan(tokens['response-time'](req, res) + ' ms'),
        ].join(' ');
    })
);

app.use(morgan("combined", { stream: accessLogStream }));

app.use(express.json());

app.use('/user/', userRouter(mysql));
app.use('/auth/', authRouter(mysql));
app.use('/img/', imgRouter(mysql));

app.listen(PORT, () => {
    mysql.connect((err: Error) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }
        console.log('Connected to MySQL database.');
    });
    console.log(`🚀 Listening at http://127.0.0.1:${PORT}/`);
});