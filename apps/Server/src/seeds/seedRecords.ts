import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../Models/User";
import { Doctor } from "../Models/Doctor";
import { MedicalRecord } from "../Models/MedicalRecord";

dotenv.config();

// Sample records for one patient, so the Medical Records page can be tried
// before doctors can write records from the doctor portal.
// Usage: npm run seed:records -w @medibridge/server -- <PatientId, e.g. P015>
async function seedRecords() {
  const patientId = process.argv[2];
  if (!patientId) {
    console.error("Pass the patient's ID, e.g. npm run seed:records -w @medibridge/server -- P015");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.DB_CONNECTION_URL!, { dbName: "hospitalDB" });

    const patient = await User.findOne({ UserId: patientId });
    if (!patient) throw new Error(`No user with ID ${patientId}`);

    if (await MedicalRecord.exists({ patient: patient._id })) {
      console.log(`${patientId} already has records; nothing added.`);
      process.exit(0);
    }

    const doctors = await Doctor.find().limit(3).lean();
    if (!doctors.length) throw new Error("Seed doctors first: npm run seed:doctors -w @medibridge/server");

    const doctorAt = (i: number) => doctors[i % doctors.length];
    const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    await MedicalRecord.insertMany([
      {
        patient: patient._id,
        doctor: doctorAt(0)._id,
        department: doctorAt(0).department,
        type: "consultation",
        title: `${doctorAt(0).department} Consultation Notes`,
        visitDate: daysAgo(14),
        summary: "Follow-up visit. Symptoms improving with the current plan.",
        sections: [
          { heading: "Presenting complaint", body: "Occasional palpitations after exercise over the last month." },
          { heading: "Findings", body: "Blood pressure 128/82. Heart rate regular at rest." },
          { heading: "Plan", body: "Continue current medication. Repeat ECG in 3 months. Return sooner if symptoms get worse." },
        ],
      },
      {
        patient: patient._id,
        doctor: doctorAt(1)._id,
        department: doctorAt(1).department,
        type: "consultation",
        title: `${doctorAt(1).department} Consultation Notes`,
        visitDate: daysAgo(45),
        summary: "Review of recurring headaches.",
        sections: [
          { heading: "Presenting complaint", body: "Headaches two to three times a week, worse in the evening." },
          { heading: "Plan", body: "Keep a headache diary. Reduce screen time before bed. Review in 6 weeks." },
        ],
      },
      {
        patient: patient._id,
        doctor: doctorAt(2)._id,
        department: doctorAt(2).department,
        type: "lab_result",
        title: "Full Blood Count",
        visitDate: daysAgo(60),
        summary: "All values within the normal range.",
        sections: [{ heading: "Results", body: "Haemoglobin 13.8 g/dL. White cells 6.2 x10^9/L. Platelets 250 x10^9/L." }],
      },
    ]);

    console.log(`Added 3 sample records for ${patientId}.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedRecords();
