import mongoose from "mongoose";
import dotenv from "dotenv";
import { Appointment } from "../Models/Appointment";
import { MedicalRecord } from "../Models/MedicalRecord";
// Registers the Doctor model so appointments can be populated with it.
import "../Models/Doctor";
import type { IDoctor } from "../types/doctor";

dotenv.config();

// Development data only. Until the doctor portal can write records, this gives
// every past (or confirmed) appointment a consultation note so the Medical
// Records page has something to show. Safe to re-run: appointments that
// already have a record are skipped.
const seedRecords = async () => {
  await mongoose.connect(process.env.DB_CONNECTION_URL!, { dbName: process.env.DB_NAME || "hospitalDB" });

  const appointments = await Appointment.find({ status: { $ne: "cancelled" } }).populate("doctor").lean();
  const existing = new Set(
    (await MedicalRecord.distinct("appointment", { appointment: { $ne: null } })).map((id) => id.toString())
  );

  const records = appointments
    .filter((a) => a.userId && !existing.has(a._id.toString()))
    .map((a) => {
      const doctor = a.doctor as unknown as IDoctor | null;
      return {
        patient: a.userId,
        doctor: doctor?._id,
        appointment: a._id,
        type: "consultation" as const,
        title: `${a.department} Consultation Notes`,
        department: a.department,
        visitDate: new Date(a.date),
        summary: `Consultation with ${doctor?.docName ?? "the doctor"} about: ${a.reason}`,
        sections: [
          { heading: "Presenting complaint", body: a.reason },
          { heading: "Examination", body: "Observations within normal limits. No acute distress." },
          { heading: "Plan", body: "Continue current care. Book a follow-up if symptoms persist or get worse." },
        ],
      };
    });

  if (records.length) await MedicalRecord.insertMany(records);
  console.log(`Seeded ${records.length} medical record(s).`);
  process.exit();
};

seedRecords();
