"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (payload) => {
    const jwt_secret_key = process.env.JWT_SECRET_KEY;
    if (!jwt_secret_key) {
        throw new Error("JWT_SECRET is not defined in ENV");
    }
    ;
    return jsonwebtoken_1.default.sign(payload, jwt_secret_key, { expiresIn: "1h" });
};
exports.generateToken = generateToken;
