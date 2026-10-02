import mongoose from "mongoose";
import dotenv from "dotenv";
import { Doctor } from "../Models/Doctor";
import Department from "../Models/Department";

dotenv.config();

// Two doctors for every department, so patients can book in each one.
//
//   npm run seed:doctors -w @medibridge/server
//
// Safe to run again: a doctor is added only if no doctor with that name
// exists, and existing doctors (their hours, photo or linked login) are never
// changed. These are booking profiles only; give a doctor a login with
// `npm run link:doctor`. Photos are left empty and the portal shows initials.

type Window = { day: string; start: string; end: string };

const WEEKDAY_MORNINGS: Window[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => ({
  day,
  start: "9:00 AM",
  end: "1:00 PM",
}));
const LONG_DAYS: Window[] = [
  { day: "Monday", start: "10:00 AM", end: "4:00 PM" },
  { day: "Wednesday", start: "10:00 AM", end: "4:00 PM" },
  { day: "Friday", start: "9:00 AM", end: "3:00 PM" },
];
const AFTERNOONS: Window[] = [
  { day: "Tuesday", start: "12:00 PM", end: "5:00 PM" },
  { day: "Thursday", start: "12:00 PM", end: "5:00 PM" },
  { day: "Saturday", start: "9:00 AM", end: "12:00 PM" },
];

interface Seed {
  docName: string;
  gender: "male" | "female";
  YOE: number;
  about: string;
  availableTime: Window[];
}

// Keyed by the department's `field`, exactly as stored.
const ROSTER: Record<string, Seed[]> = {
  Cardiology: [
    { docName: "Dr. Emeka Obi", gender: "male", YOE: 15, availableTime: LONG_DAYS,
      about: "Consultant cardiologist focused on high blood pressure, chest pain and heart rhythm problems." },
    { docName: "Dr. Halima Sani", gender: "female", YOE: 8, availableTime: AFTERNOONS,
      about: "Cardiologist with an interest in preventive heart care and cardiac rehabilitation." },
  ],
  Pediatrics: [
    { docName: "Dr. Funmilayo Adebayo", gender: "female", YOE: 12, availableTime: WEEKDAY_MORNINGS,
      about: "Paediatrician caring for newborns to teenagers, from routine check-ups to childhood illnesses." },
    { docName: "Dr. Chukwudi Okeke", gender: "male", YOE: 7, availableTime: AFTERNOONS,
      about: "Paediatrician with an interest in childhood asthma, allergies and growth concerns." },
  ],
  Dentistry: [
    { docName: "Dr. Aisha Bello", gender: "female", YOE: 9, availableTime: LONG_DAYS,
      about: "Dentist providing check-ups, fillings, extractions and advice on oral hygiene." },
    { docName: "Dr. Tobi Akinola", gender: "male", YOE: 6, availableTime: AFTERNOONS,
      about: "Dentist with an interest in gum health and treating dental pain." },
  ],
  "OB-GYN": [
    { docName: "Dr. Ngozi Eze", gender: "female", YOE: 14, availableTime: WEEKDAY_MORNINGS,
      about: "Obstetrician and gynaecologist supporting pregnancy care, family planning and women's health." },
    { docName: "Dr. Ifeoma Nwachukwu", gender: "female", YOE: 10, availableTime: AFTERNOONS,
      about: "Gynaecologist with an interest in menstrual health, fertility and menopause." },
  ],
  "General Practice": [
    { docName: "Dr. Elizabeth Ade", gender: "female", YOE: 10, availableTime: WEEKDAY_MORNINGS,
      about: "General practitioner for everyday health concerns, check-ups and referrals to specialists." },
    { docName: "Dr. Samuel Ogunleye", gender: "male", YOE: 11, availableTime: LONG_DAYS,
      about: "General practitioner with an interest in long-term conditions such as diabetes and hypertension." },
  ],
  "Mental Health": [
    { docName: "Dr. Kemi Lawal", gender: "female", YOE: 13, availableTime: LONG_DAYS,
      about: "Psychiatrist supporting patients with anxiety, depression and stress-related conditions." },
    { docName: "Dr. Musa Abdullahi", gender: "male", YOE: 9, availableTime: AFTERNOONS,
      about: "Psychiatrist with an interest in sleep problems, mood disorders and recovery support." },
  ],
  Ophthalmology: [
    { docName: "Dr. Yetunde Coker", gender: "female", YOE: 12, availableTime: WEEKDAY_MORNINGS,
      about: "Ophthalmologist for eye examinations, cataracts, glaucoma and vision changes." },
    { docName: "Dr. Ibrahim Yusuf", gender: "male", YOE: 8, availableTime: AFTERNOONS,
      about: "Ophthalmologist with an interest in diabetic eye disease and eye infections." },
  ],
  Orthopedics: [
    { docName: "Dr. Daniel Okoro", gender: "male", YOE: 16, availableTime: LONG_DAYS,
      about: "Orthopaedic surgeon treating bone, joint and sports injuries, and arthritis." },
    { docName: "Dr. Blessing Umeh", gender: "female", YOE: 7, availableTime: WEEKDAY_MORNINGS,
      about: "Orthopaedic doctor with an interest in back pain, fractures and rehabilitation." },
  ],
  Neurology: [
    { docName: "Dr. Olumide Bankole", gender: "male", YOE: 14, availableTime: LONG_DAYS,
      about: "Neurologist for headaches, seizures, numbness and other nerve and brain conditions." },
    { docName: "Dr. Zainab Mohammed", gender: "female", YOE: 9, availableTime: AFTERNOONS,
      about: "Neurologist with an interest in stroke prevention, migraine and memory concerns." },
  ],
};

async function seedDoctors() {
  const dbName = process.env.DB_NAME || "hospitalDB";
  await mongoose.connect(process.env.DB_CONNECTION_URL!, { dbName });
  console.log(`Seeding doctors into database "${dbName}" on ${mongoose.connection.host}`);

  const departments = await Department.find({}, { field: 1 }).lean();
  let added = 0;

  for (const { field } of departments) {
    const roster = ROSTER[field];
    if (!roster) {
      console.warn(`  ! No doctors listed for department "${field}". Add them to ROSTER in seedDoctors.ts.`);
      continue;
    }

    for (const doctor of roster) {
      const result = await Doctor.updateOne(
        { docName: doctor.docName },
        { $setOnInsert: { ...doctor, department: field, availability: true, docImg: "" } },
        { upsert: true }
      );
      if (result.upsertedCount) {
        added++;
        console.log(`  + ${doctor.docName} (${field})`);
      }
    }
  }

  const counts = await Doctor.aggregate([{ $group: { _id: "$department", n: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
  console.log(`\nAdded ${added} doctor${added === 1 ? "" : "s"}. Doctors per department:`);
  for (const c of counts) console.log(`  ${c._id}: ${c.n}`);
}

seedDoctors()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await mongoose.disconnect();
    process.exit(1);
  });
