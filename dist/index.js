"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv.config();
const fs = require("fs");
const morgan = require("morgan");
const colors = require('colors');
const cors = require('cors');
const mysql = require('./my_sql');
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
const route_1 = __importDefault(require("./router/user/route"));
const route_2 = __importDefault(require("./router/auth/route"));
const route_3 = __importDefault(require("./router/img/route"));
const accessLogStream = fs.createWriteStream(path_1.default.join(__dirname, "../access.log"), { flags: "a" });
morgan.token('status', (req, res) => {
    const status = res.statusCode;
    let color = status >= 500 ? 'red'
        : status >= 400 ? 'yellow'
            : status >= 300 ? 'cyan'
                : status >= 200 ? 'green'
                    : 'reset';
    return colors[color](status);
});
app.use(cors());
app.use(morgan((tokens, req, res) => {
    return [
        colors.blue(tokens.method(req, res)),
        colors.magenta(tokens.url(req, res)),
        tokens.status(req, res),
        colors.cyan(tokens['response-time'](req, res) + ' ms'),
    ].join(' ');
}));
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express_1.default.json());
app.use('/user/', (0, route_1.default)(mysql));
app.use('/auth/', (0, route_2.default)(mysql));
app.use('/img/', (0, route_3.default)(mysql));
app.use("*", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
});
app.listen(PORT, () => {
    mysql.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }
        console.log('Connected to MySQL database.');
    });
    console.log(`🚀 Listening at http://127.0.0.1:${PORT}/`);
});
