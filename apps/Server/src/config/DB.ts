import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "../Utils/logger";
dotenv.config()

export default async function connectDB() : Promise<void>{
    try {
        const dbUrl = process.env.DB_CONNECTION_URL;
        if (!dbUrl) {
            throw new Error("DB_CONNECTION_URL is not defined")
        }
        await mongoose.connect(dbUrl, {dbName : process.env.DB_NAME || "hospitalDB"})
        logger.info("MongoDB connected successfully");

    } catch (error) {
        logger.fatal({ err: error }, "MongoDB connection failed")
        process.exit(1);
    }
}