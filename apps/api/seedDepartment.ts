import mongoose from "mongoose";
import dotenv from "dotenv";
import Department from "./Models/Department";
dotenv.config();
import cloudinary from "./config/Cloudinary"


async function seedDepartments() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_URL!, {
      dbName: "hospitalDB",
    });

    const Cardiology = await cloudinary.uploader.upload("./assets/heart.png", {
        folder: "department",
      });
      const Neurology = await cloudinary.uploader.upload("./assets/BRAIN.png", {
        folder: "department",
      });

    const departmentSeed = [
  {
    field: "Cardiology",
    category: "Medical",
    summary: "Heart and cardiovascular care. Specialized diagnostics and treatment for heart health.",
    availableSpecialist: 5,
    icon: "Heart",
    iconBgColor: "#FFF4F3",
    iconColor: "#FC0707",
    details: {
      image: Cardiology.secure_url,
      overview: "Our cardiology department provides comprehensive care for heart and vascular conditions.",
      services: ["ECG", "Echocardiogram", "Stress Test", "Cardiac Catheterization"],
    },
  },
  {
    field: "Neurology",
    category: "Medical",
    summary: "Brain and nervous system care. Advanced neurological assessment and management.",
    availableSpecialist: 5,
    icon: "Brain",
    iconBgColor: "#E0E7FF",
    iconColor: "#4338CA",
    details: {
      image: Neurology.secure_url,
      overview: "We diagnose and treat disorders of the brain, spinal cord, and nerves.",
      services: ["EEG", "MRI Scan", "Stroke Management", "Epilepsy Treatment"],
    },
  },
  {
    field: "Pediatrics",
    category: "Women & Children",
    summary: "Healthcare for children and adolescents. Compassionate care for our youngest patients.",
    availableSpecialist: 5,
    icon: "Baby",
    iconBgColor: "#FEF9C3",
    iconColor: "#CA8A04",
    details: {
      image: "/images/pediatrics.jpg",
      overview: "We provide specialized care for infants, children, and adolescents.",
      services: ["Child Wellness Checkups", "Vaccinations", "Growth Monitoring", "Nutritional Counseling"],
    },
  },
  {
    field: "Dentistry",
    category: "Medical",
    summary: "Dental care and oral health. Routine checkups and specialized dental procedures.",
    availableSpecialist: 5,
    icon: "Tooth",
    iconBgColor: "#E0F2FE",
    iconColor: "#0284C7",
    details: {
      image: "/images/dentistry.jpg",
      overview: "Our dental team provides preventive and restorative oral healthcare.",
      services: ["Cleaning", "Fillings", "Root Canal Therapy", "Tooth Extraction"],
    },
  },
  {
    field: "Ophthalmology",
    category: "Diagnostics",
    summary: "Diagnosis and treatment of eye and vision problems.",
    availableSpecialist: 5,
    icon: "Eye",
    iconBgColor: "#F0FDF4",
    iconColor: "#16A34A",
    details: {
      image: "/images/ophthalmology.jpg",
      overview: "Comprehensive care for vision and eye health.",
      services: ["Eye Exams", "Cataract Surgery", "Glaucoma Screening", "Vision Correction"],
    },
  },
  {
    field: "Orthopedics",
    category: "Surgical",
    summary: "Bones, joints, and mobility care. Advanced orthopedic surgery and rehabilitation.",
    availableSpecialist: 5,
    icon: "Bone",
    iconBgColor: "#FFF7ED",
    iconColor: "#EA580C",
    details: {
      image: "/images/orthopedics.jpg",
      overview: "Expert treatment for musculoskeletal conditions and injuries.",
      services: ["Joint Replacement", "Fracture Care", "Arthroscopy", "Physiotherapy"],
    },
  },
  {
    field: "OB-GYN",
    category: "Women & Children",
    summary: "Women’s reproductive health and pregnancy care.",
    availableSpecialist: 5,
    icon: "Venus",
    iconBgColor: "#FDF2F8",
    iconColor: "#DB2777",
    details: {
      image: "/images/obgyn.jpg",
      overview: "Comprehensive care for women throughout every stage of life.",
      services: ["Prenatal Care", "Family Planning", "Gynecologic Surgery", "Routine Screening"],
    },
  },
  {
    field: "General Practice",
    category: "Medical",
    summary: "Primary and preventive care. Your first point of contact for total health management.",
    availableSpecialist: 5,
    icon: "FirstAid",
    iconBgColor: "#F3F4F6",
    iconColor: "#374151",
    details: {
      image: "/images/general-practice.jpg",
      overview: "Primary care focused on prevention and long-term wellness.",
      services: ["Annual Checkups", "Vaccinations", "Chronic Disease Management", "Health Counseling"],
    },
  },
  {
    field: "Mental Health",
    category: "Mental Health",
    summary: "Support for emotional and psychological well-being.",
    availableSpecialist: 5,
    icon: "MentalHealth",
    iconBgColor: "#CFDFE0",
    iconColor: "#00454B",
    details: {
      image: "/images/mental-health.jpg",
      overview: "Compassionate support for emotional and psychological wellness.",
      services: ["Counseling", "Psychiatric Evaluation", "Therapy", "Stress Management"],
    },
  },
    ];

    await Department.deleteMany({});
    await Department.insertMany(departmentSeed);

    console.log("Departments seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Department seeding failed:", error);
    process.exit(1);
  }
}

seedDepartments();