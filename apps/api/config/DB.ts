import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()

export default async function connectDB() : Promise<void>{
    try {
        const dbUrl = process.env.DB_CONNECTION_URL;
        if (!dbUrl) {
            throw new Error("DB_CONNECTION_URL is not defined")
        }
        await mongoose.connect(dbUrl, {dbName : "hospitalDB"})
        console.log("MongoDB connected successfully");
        
    } catch (error) {
        console.error("MongoDB connection failed: ", error)
        process.exit(1);
    }
}