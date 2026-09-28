"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Doctor_1 = require("./Models/Doctor");
const dotenv_1 = __importDefault(require("dotenv"));
const Cloudinary_1 = __importDefault(require("./config/Cloudinary"));
dotenv_1.default.config();
const seedDoctors = async () => {
    await mongoose_1.default.connect(process.env.DB_CONNECTION_URL, {
        dbName: "hospitalDB",
    });
    const lizzyImg = await Cloudinary_1.default.uploader.upload("./assets/Dr_Lizzy.jpeg", {
        folder: "doctors"
    });
    const doctors = [
        {
            docImg: lizzyImg.secure_url,
            docName: "Dr. Elizabeth",
            department: "General Practices",
            YOE: 10,
            availability: true,
            about: "Dr. Elizabeth specializes in general health practices  ...",
            availableTime: [
                { day: "Monday", start: "9:00 AM", end: "1:00 PM" },
                { day: "Tuesday", start: "10:00 AM", end: "1:00 PM" },
                { day: "Thursday", start: "10:00 AM", end: "2:00 PM" },
            ],
            gender: "female",
        },
        {
            docImg: lizzyImg.secure_url,
            docName: "Dr. Doom",
            department: "Orthopedics",
            YOE: 10,
            availability: true,
            about: "Dr. Doom specializes in Orthopedics ...",
            availableTime: [
                { day: "Monday", start: "9:00 AM", end: "1:00 PM" },
                { day: "Tuesday", start: "10:00 AM", end: "1:00 PM" },
            ],
            gender: "male",
        },
    ];
    await Doctor_1.Doctor.insertMany(doctors);
    console.log("Doctors seeded with Cloudinary images!");
    process.exit();
};
seedDoctors();
