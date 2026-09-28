"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function connectDB() {
    try {
        const dbUrl = process.env.DB_CONNECTION_URL;
        if (!dbUrl) {
            throw new Error("DB_CONNECTION_URL is not defined");
        }
        await mongoose_1.default.connect(dbUrl, { dbName: "hospitalDB" });
        console.log("MongoDB connected successfully");
    }
    catch (error) {
        console.error("MongoDB connection failed: ", error);
        process.exit(1);
    }
}
