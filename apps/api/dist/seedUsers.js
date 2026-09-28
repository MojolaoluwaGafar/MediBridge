"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("./Models/User");
dotenv_1.default.config();
async function seedUsers() {
    try {
        await mongoose_1.default.connect(process.env.DB_CONNECTION_URL, {
            dbName: "hospitalDB",
        });
        const users = [
            {
                UserId: "P012",
                FirstName: "Timi",
                LastName: "Gafar",
                Email: "Only1maniac007@gmail.com",
                PhoneNumber: "07086440726",
                RegisteredNumber: "07086440726",
                role: "user",
                isActive: false,
            },
            {
                UserId: "P011",
                FirstName: "Margret",
                LastName: "Jacob",
                Email: "Jacobmeg970@gmail.com",
                PhoneNumber: "07031047842",
                RegisteredNumber: "07031047842",
                role: "user",
                isActive: false,
            },
        ];
        await User_1.User.insertMany(users);
        console.log("Users pre‑registered successfully!");
        process.exit(0);
    }
    catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}
seedUsers();
