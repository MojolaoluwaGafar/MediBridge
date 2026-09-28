import mongoose from "mongoose";
import { Doctor } from "./Models/Doctor";
import dotenv from "dotenv";
import cloudinary from "./config/Cloudinary"

dotenv.config();

const seedDoctors = async () => {
  await mongoose.connect(process.env.DB_CONNECTION_URL!, {
    dbName: "hospitalDB",
  });

  const lizzyImg = await cloudinary.uploader.upload("./assets/Dr_Lizzy.jpeg",  {
    folder : "doctors"
  })

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

  await Doctor.insertMany(doctors);
  console.log("Doctors seeded with Cloudinary images!");
  process.exit();
};

seedDoctors();
