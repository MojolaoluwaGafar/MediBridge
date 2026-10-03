import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
import { User } from "../Models/User";
import { Doctor } from "../Models/Doctor";
import { Appointment } from "../Models/Appointment";
import { Activity } from "../Models/Activity";
import { Message } from "../Models/Message";
import { MedicalRecord } from "../Models/MedicalRecord";
import { VisitNote } from "../Models/VisitNote";
import Flagged from "../Models/Flagged";
import { formatTimeLabel, minutesNowInHospital, todayInHospital } from "../Utils/appointmentTime";

dotenv.config();

// A demo doctor login with sample patients, appointments, messages, records
// and safety flags, so every doctor-portal screen has something to show.
//
//   npm run seed:demo-doctor -w @medibridge/server -- --yes
//
// Every demo account uses an @demo.medibridge.test address (a reserved
// domain that never receives mail) and a DEMO- ID, so it can't be mistaken for
// a real person. Running it again replaces the previous demo data. The
// password comes from DEMO_PASSWORD, or a random one is printed at the end.

const DOMAIN = "demo.medibridge.test";
const DOCTOR_USER_ID = "DEMO-DOC-01";
const ADMIN_USER_ID = "DEMO-ADMIN-01";

const PATIENTS = [
  { UserId: "DEMO-P01", FirstName: "Chioma", LastName: "Nwosu", phone: "08090000101" },
  { UserId: "DEMO-P02", FirstName: "Tunde", LastName: "Bakare", phone: "08090000102" },
  { UserId: "DEMO-P03", FirstName: "Ibrahim", LastName: "Musa", phone: "08090000103" },
  { UserId: "DEMO-P04", FirstName: "Grace", LastName: "Eze", phone: "08090000104" },
  { UserId: "DEMO-P05", FirstName: "Samuel", LastName: "Adeyemi", phone: "08090000105" },
  { UserId: "DEMO-P06", FirstName: "Fatima", LastName: "Bello", phone: "08090000106" },
];

function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// The nth weekday after `date`, so demo visits fall in the demo doctor's hours.
function addWorkdays(date: string, n: number) {
  let d = date;
  for (let left = n; left > 0; ) {
    d = addDays(d, 1);
    const day = new Date(`${d}T00:00:00Z`).getUTCDay();
    if (day !== 0 && day !== 6) left--;
  }
  return d;
}

async function removePreviousDemo() {
  const demoUsers = await User.find({ Email: { $regex: `@${DOMAIN.replace(/\./g, "\\.")}$` } }, { _id: 1 }).lean();
  const userIds = demoUsers.map((u) => u._id);
  const demoDoctors = await Doctor.find({ userId: { $in: userIds } }, { _id: 1 }).lean();
  const doctorIds = demoDoctors.map((d) => d._id);

  await Promise.all([
    Appointment.deleteMany({ $or: [{ userId: { $in: userIds } }, { doctor: { $in: doctorIds } }] }),
    Activity.deleteMany({ userId: { $in: userIds } }),
    Message.deleteMany({ $or: [{ patient: { $in: userIds } }, { doctor: { $in: doctorIds } }] }),
    MedicalRecord.deleteMany({ patient: { $in: userIds } }),
    VisitNote.deleteMany({ $or: [{ patient: { $in: userIds } }, { doctor: { $in: doctorIds } }] }),
    Flagged.deleteMany({ userId: { $in: userIds } }),
  ]);
  await Doctor.deleteMany({ _id: { $in: doctorIds } });
  await User.deleteMany({ _id: { $in: userIds } });
}

async function seed() {
  if (!process.argv.includes("--yes")) {
    throw new Error("This adds demo accounts to the database. Re-run with --yes to confirm.");
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed demo accounts with NODE_ENV=production.");
  }

  const dbName = process.env.DB_NAME || "hospitalDB";
  await mongoose.connect(process.env.DB_CONNECTION_URL!, { dbName });
  console.log(`Seeding demo doctor into database "${dbName}" on ${mongoose.connection.host}`);

  await removePreviousDemo();

  const password = process.env.DEMO_PASSWORD || `Demo-${crypto.randomBytes(6).toString("base64url")}9`;
  const hash = await bcrypt.hash(password, 12);

  const doctorUser = await User.create({
    UserId: DOCTOR_USER_ID,
    FirstName: "Adaeze",
    LastName: "Okafor",
    Email: `doctor@${DOMAIN}`,
    PhoneNumber: "08090000100",
    RegisteredNumber: "08090000100",
    Password: hash,
    role: "doctor",
    isActive: true,
  });

  await User.create({
    UserId: ADMIN_USER_ID,
    FirstName: "Bola",
    LastName: "Admin",
    Email: `admin@${DOMAIN}`,
    PhoneNumber: "08090000199",
    RegisteredNumber: "08090000199",
    Password: hash,
    role: "admin",
    isActive: true,
  });

  const doctor = await Doctor.create({
    docName: "Dr. Adaeze Okafor",
    department: "Cardiology",
    YOE: 12,
    gender: "female",
    availability: true,
    about: "Consultant cardiologist with an interest in hypertension and preventive heart care. (Demo profile)",
    docImg: "",
    availableTime: [
      { day: "Monday", start: "9:00 AM", end: "1:00 PM" },
      { day: "Tuesday", start: "9:00 AM", end: "5:00 PM" },
      { day: "Wednesday", start: "9:00 AM", end: "5:00 PM" },
      { day: "Thursday", start: "10:00 AM", end: "2:00 PM" },
      { day: "Friday", start: "9:00 AM", end: "5:00 PM" },
    ],
    userId: doctorUser._id,
  });

  const patients = await User.insertMany(
    PATIENTS.map((p) => ({
      UserId: p.UserId,
      FirstName: p.FirstName,
      LastName: p.LastName,
      Email: `${p.FirstName.toLowerCase()}.${p.LastName.toLowerCase()}@${DOMAIN}`,
      PhoneNumber: p.phone,
      RegisteredNumber: p.phone,
      Password: hash,
      role: "user",
      isActive: true,
    }))
  );
  const [chioma, tunde, ibrahim, grace, samuel, fatima] = patients;

  const today = todayInHospital();
  // Today's times are set around "now", so the schedule always has visits
  // that are done, one that's next, and some still to come.
  // Kept between 2:00 AM and 9:00 PM so every visit (-2h to +2.5h) lands on
  // its own slot the same day, whatever time the seed runs.
  const nowSlot = Math.min(Math.max(Math.floor(minutesNowInHospital() / 30) * 30, 120), 21 * 60);
  const at = (offsetMinutes: number) => formatTimeLabel(Math.min(Math.max(nowSlot + offsetMinutes, 0), 23 * 60 + 30));
  const routine = { level: "routine", reason: "No urgent signs", source: "keyword", updatedAt: new Date() };
  const urgent = (reason: string) => ({ level: "urgent", reason, source: "keyword+ai", updatedAt: new Date() });

  const base = { doctor: doctor._id, department: "Cardiology" };
  const appointments = await Appointment.insertMany([
    // Today
    { ...base, userId: tunde._id, date: today, time: at(-120), status: "completed", reason: "Follow-up: blood pressure check", urgency: routine },
    { ...base, userId: chioma._id, date: today, time: at(30), status: "confirmed", shareRecords: true, reason: "Chest pain when climbing stairs, worse over the last two weeks", urgency: urgent("Chest pain on exertion") },
    { ...base, userId: ibrahim._id, date: today, time: at(90), status: "confirmed", reason: "Post-surgery review after stent placement", urgency: routine },
    { ...base, userId: grace._id, date: today, time: at(150), status: "confirmed", shareRecords: true, reason: "Discuss ECG results", urgency: routine },
    // Coming up
    { ...base, userId: samuel._id, date: addWorkdays(today, 1), time: "10:00 AM", status: "confirmed", reason: "Palpitations at night", urgency: urgent("Recurring palpitations") },
    { ...base, userId: fatima._id, date: addWorkdays(today, 2), time: "11:30 AM", status: "confirmed", reason: "New patient consultation, family history of heart disease", urgency: routine },
    { ...base, userId: tunde._id, date: addWorkdays(today, 6), time: "9:30 AM", status: "confirmed", reason: "Medication review", urgency: routine },
    // History
    { ...base, userId: chioma._id, date: addDays(today, -40), time: "9:00 AM", status: "completed", shareRecords: true, reason: "Routine check-up", urgency: routine },
    { ...base, userId: grace._id, date: addDays(today, -21), time: "2:00 PM", status: "completed", reason: "Shortness of breath", urgency: routine },
    { ...base, userId: ibrahim._id, date: addDays(today, -10), time: "10:30 AM", status: "completed", reason: "Pre-surgery assessment", urgency: routine },
    { ...base, userId: chioma._id, date: addDays(today, -90), time: "1:00 PM", status: "cancelled", reason: "Palpitations", urgency: routine },
    { ...base, userId: samuel._id, date: addWorkdays(today, 3), time: "3:00 PM", status: "cancelled", reason: "Blood test results", urgency: routine },
  ]);

  const findAppt = (patient: typeof chioma, date: string) =>
    appointments.find((a) => String(a.userId) === String(patient._id) && a.date === date)!;
  const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);

  await Activity.insertMany([
    { userId: chioma._id, type: "confirmed", message: `Cardiology with Dr. Adaeze Okafor – ${today}`, doctor: doctor._id, appointment: findAppt(chioma, today)._id, timestamp: minutesAgo(90) },
    { userId: samuel._id, type: "cancelled", message: `Cardiology with Dr. Adaeze Okafor – ${addWorkdays(today, 3)}`, doctor: doctor._id, appointment: findAppt(samuel, addWorkdays(today, 3))._id, timestamp: minutesAgo(300) },
    { userId: samuel._id, type: "confirmed", message: `Cardiology with Dr. Adaeze Okafor – ${addWorkdays(today, 1)}`, doctor: doctor._id, appointment: findAppt(samuel, addWorkdays(today, 1))._id, timestamp: minutesAgo(320) },
    { userId: fatima._id, type: "confirmed", message: `Cardiology with Dr. Adaeze Okafor – ${addWorkdays(today, 2)}`, doctor: doctor._id, appointment: findAppt(fatima, addWorkdays(today, 2))._id, timestamp: minutesAgo(60 * 26) },
    { userId: ibrahim._id, type: "rescheduled", message: `Cardiology with Dr. Adaeze Okafor – ${today}`, doctor: doctor._id, appointment: findAppt(ibrahim, today)._id, timestamp: minutesAgo(60 * 30) },
  ]);

  await Message.insertMany([
    { patient: chioma._id, doctor: doctor._id, sender: "patient", body: "Good morning doctor, the chest pain came back last night when I climbed the stairs at home.", createdAt: minutesAgo(180), readAt: null },
    { patient: chioma._id, doctor: doctor._id, sender: "patient", body: "Should I still come in today or go to the emergency room?", createdAt: minutesAgo(170), readAt: null },
    { patient: grace._id, doctor: doctor._id, sender: "doctor", body: "Hi Grace, your ECG results are in. We'll go through them together at your appointment.", createdAt: minutesAgo(60 * 20), readAt: minutesAgo(60 * 19) },
    { patient: grace._id, doctor: doctor._id, sender: "patient", body: "Thank you doctor, see you then.", createdAt: minutesAgo(60 * 19), readAt: minutesAgo(60 * 18) },
    { patient: ibrahim._id, doctor: doctor._id, sender: "patient", body: "The wound is healing well. Is it okay to start walking every morning?", createdAt: minutesAgo(60 * 5), readAt: null },
  ]);

  await MedicalRecord.insertMany([
    {
      patient: chioma._id, doctor: doctor._id, type: "consultation", title: "Cardiology consultation", department: "Cardiology",
      visitDate: new Date(`${addDays(today, -40)}T09:00:00Z`), summary: "Routine review. Blood pressure slightly raised; lifestyle advice given.",
      sections: [
        { heading: "Presenting complaint", body: "Occasional tiredness, no chest pain at the time." },
        { heading: "Examination", body: "BP 138/88, pulse 76 regular, heart sounds normal." },
        { heading: "Plan", body: "Reduce salt intake, regular exercise, review in 3 months." },
      ],
    },
    {
      patient: chioma._id, doctor: doctor._id, type: "lab_result", title: "Lipid panel", department: "Cardiology",
      visitDate: new Date(`${addDays(today, -38)}T09:00:00Z`), summary: "LDL mildly raised.",
      sections: [{ heading: "Results", body: "Total cholesterol 5.6 mmol/L, LDL 3.6 mmol/L, HDL 1.2 mmol/L." }],
    },
    {
      patient: grace._id, doctor: doctor._id, type: "imaging", title: "ECG report", department: "Cardiology",
      visitDate: new Date(`${addDays(today, -3)}T10:00:00Z`), summary: "Sinus rhythm, no acute changes.",
      sections: [{ heading: "Findings", body: "Normal sinus rhythm at 72 bpm. No ST changes." }],
    },
  ]);

  await Flagged.insertMany([
    {
      source: "message", userId: chioma._id, message: "Should I still come in today or go to the emergency room?",
      reason: "Patient asking whether chest pain needs emergency care", level: "urgent", category: "medical",
      triageSource: "keyword+ai", status: "new", flaggedAt: minutesAgo(170),
    },
    {
      source: "booking", userId: samuel._id, appointmentId: findAppt(samuel, addWorkdays(today, 1))._id,
      message: "Palpitations at night", reason: "Recurring palpitations", level: "urgent", category: "medical",
      triageSource: "keyword+ai", status: "new", flaggedAt: minutesAgo(320),
    },
  ]);

  await VisitNote.create({
    doctor: doctor._id, patient: chioma._id, appointment: findAppt(chioma, addDays(today, -40))._id,
    body: "BP borderline. Advised lifestyle changes; consider medication if still raised at next visit.",
    createdAt: new Date(`${addDays(today, -40)}T10:00:00Z`),
  });

  console.log("\nDemo doctor ready.");
  console.log(`  Doctor login:  User ID ${DOCTOR_USER_ID}   password ${password}`);
  console.log(`  Admin login:   User ID ${ADMIN_USER_ID}   password ${password}`);
  console.log(`  Patient logins (same password): ${PATIENTS.map((p) => p.UserId).join(", ")}`);
}

seed()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await mongoose.disconnect();
    process.exit(1);
  });
