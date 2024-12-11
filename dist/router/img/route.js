"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/img/route.ts
const express_1 = __importDefault(require("express"));
const router = (mysql) => {
    const router = express_1.default.Router();
    router.get('/', (req, res) => {
        res.send('Fetching users from DB');
    });
    router.get('/:id', (req, res) => {
        res.send(`Fetching user ${req.params.id} from DB`);
    });
    return router;
};
exports.default = router;
