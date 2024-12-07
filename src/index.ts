// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const colors = require('colors');
const cors = require('cors');


const app: Express = express();
const PORT = process.env.PORT || 3002;

dotenv.config();

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "../access.log"),
    { flags: "a" }
);


// Define a custom token for coloring status code
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

// Define the custom morgan format
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

app.use('/user/', require('./user/app'));
app.use('/auth/', require('./auth/app'));
app.use('/img/', require('./img/app'));

app.listen(PORT, () => {
    console.log(`🚀 Listening at http://127.0.0.1:${PORT}/`);
});