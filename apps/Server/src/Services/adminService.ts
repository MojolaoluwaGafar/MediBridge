import crypto from "crypto";
import mongoose from "mongoose";
import { Appointment } from "../Models/Appointment";
import Department from "../Models/Department";
import { Doctor } from "../Models/Doctor";
import Flagged from "../Models/Flagged";
import { MedicalRecord, RECORD_PUBLIC_PROJECTION, RECORD_TYPE_LABELS } from "../Models/MedicalRecord";
import { User, type IUser } from "../Models/User";
import { normalizePhone } from "../Utils/phone";
import { todayInHospital } from "../Utils/appointmentTime";
import { logger } from "../Utils/logger";
import type {
  DepartmentInput,
  DoctorProfileInput,
  PersonInput,
  UpdatePersonInput,
  UploadRecordInput,
} from "../Validation/adminSchema";
import { recordActivity } from "./activityService";
import { completePastAppointments } from "./appointmentService";
import { deleteDocument, saveDocument } from "./documentStorage";
import { linkDoctorAccount } from "./doctorAccountService";
import { updateAvailability } from "./doctorPortalService";
import type { AvailabilityInput } from "../Validation/doctorSchema";
import { ServiceError } from "./errors";

// Everything the admin portal reads and changes. Routes are admin-only.
//
// Nobody's password is ever set here. Patients, doctors and admins are
// pre-registered with their ID, email and phone; each person then activates
// their own account (code sent to their email and phone) and chooses a
// password, the same way patients always have.

const { ObjectId } = mongoose.Types;
type Id = mongoose.Types.ObjectId;
type Role = IUser["role"];

const PAGE_SIZE = 25;
const ID_COLLATION = { locale: "en", strength: 2 } as const;
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ---------- Overview ----------

export async function getOverview() {
  await completePastAppointments();
  const today = todayInHospital();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);

  const [
    patients,
    activePatients,
    doctors,
    doctorsWithLogin,
    acceptingDoctors,
    departments,
    todayCount,
    upcomingWeek,
    cancelledWeek,
    openFlags,
    urgentFlags,
    recordsWeek,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "user", isActive: true }),
    Doctor.countDocuments(),
    Doctor.countDocuments({ userId: { $exists: true, $ne: null } }),
    Doctor.countDocuments({ availability: true }),
    Department.countDocuments(),
    Appointment.countDocuments({ date: today, status: { $in: ["confirmed", "completed"] } }),
    Appointment.countDocuments({ status: "confirmed", date: { $gte: today, $lte: addDays(today, 6) } }),
    Appointment.countDocuments({ status: "cancelled", updatedAt: { $gte: weekAgo } }),
    Flagged.countDocuments({ status: "new" }),
    Flagged.countDocuments({ status: "new", level: { $in: ["urgent", "emergency"] } }),
    MedicalRecord.countDocuments({ createdAt: { $gte: weekAgo } }),
  ]);

  // Departments patients can't book in, because no doctor is taking bookings.
  const [allDepartments, staffed] = await Promise.all([
    Department.find({}, { field: 1 }).lean(),
    Doctor.distinct("department", { availability: true }),
  ]);
  const unstaffed = allDepartments.map((d) => d.field).filter((field) => !staffed.includes(field));

  return {
    patients: { total: patients, active: activePatients, pending: patients - activePatients },
    doctors: { total: doctors, withLogin: doctorsWithLogin, accepting: acceptingDoctors },
    departments: { total: departments, unstaffed },
    appointments: { today: todayCount, upcomingWeek, cancelledWeek },
    flags: { open: openFlags, urgent: urgentFlags },
    records: { addedThisWeek: recordsWeek },
  };
}

// ---------- People (patients and logins) ----------

const PREFIX: Record<Role, string> = { user: "P", doctor: "D", admin: "A" };

async function generateUserId(role: Role) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `${PREFIX[role]}${crypto.randomInt(100000, 1000000)}`;
    if (!(await User.exists({ UserId: candidate }).collation(ID_COLLATION))) return candidate;
  }
  throw new Error("Could not generate a unique ID");
}

// 409 naming the field, so the form can show it next to the right input.
async function assertUnique(input: { userId?: string; email?: string; phone?: string }, exceptId?: Id) {
  const not = exceptId ? { _id: { $ne: exceptId } } : {};
  if (input.userId && (await User.exists({ ...not, UserId: input.userId }).collation(ID_COLLATION))) {
    throw new ServiceError(409, `ID ${input.userId} is already in use`, "userId");
  }
  if (input.email && (await User.exists({ ...not, Email: input.email }))) {
    throw new ServiceError(409, "Someone already has that email address", "email");
  }
  if (input.phone && (await User.exists({ ...not, RegisteredNumber: normalizePhone(input.phone) }))) {
    throw new ServiceError(409, "Someone already has that phone number", "phone");
  }
}

const toPerson = (u: Pick<IUser, "UserId" | "FirstName" | "LastName" | "Email" | "PhoneNumber" | "role" | "isActive"> & { _id: unknown; createdAt?: Date; ProfileImage?: string | null }) => ({
  id: String(u._id),
  userId: u.UserId,
  firstname: u.FirstName,
  lastname: u.LastName,
  email: u.Email,
  phone: u.PhoneNumber,
  role: u.role,
  // Activated: they have set a password and can sign in.
  activated: u.isActive,
  img: u.ProfileImage ?? null,
  createdAt: u.createdAt ?? null,
});

export async function createPerson(role: Role, input: PersonInput) {
  const userId = input.userId || (await generateUserId(role));
  await assertUnique({ userId, email: input.email, phone: input.phone });

  const user = await User.create({
    UserId: userId,
    FirstName: input.firstname,
    LastName: input.lastname,
    Email: input.email,
    PhoneNumber: input.phone,
    RegisteredNumber: input.phone,
    role,
    isActive: false,
  });
  return toPerson(user.toObject() as never);
}

async function findPerson(id: string, role: Role) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ServiceError(404, "Not found");
  const user = await User.findOne({ _id: id, role });
  if (!user) throw new ServiceError(404, role === "user" ? "Patient not found" : "Account not found");
  return user;
}

// Name, email and phone are set by the hospital (people can't change them in
// the portal, since email and phone are used to recover accounts).
export async function updatePerson(id: string, role: Role, input: UpdatePersonInput) {
  const user = await findPerson(id, role);
  await assertUnique({ email: input.email, phone: input.phone }, user._id as Id);

  if (input.firstname) user.FirstName = input.firstname;
  if (input.lastname) user.LastName = input.lastname;
  if (input.email) user.Email = input.email;
  if (input.phone) {
    user.PhoneNumber = input.phone;
    user.RegisteredNumber = input.phone;
  }
  await user.save();
  return toPerson(user.toObject() as never);
}

export async function listPeople(role: Role, q: string, page: number) {
  const term = q.trim();
  const search = term
    ? {
        $or: [
          { FirstName: new RegExp(escapeRegex(term), "i") },
          { LastName: new RegExp(escapeRegex(term), "i") },
          { UserId: new RegExp(`^${escapeRegex(term)}`, "i") },
          { Email: new RegExp(escapeRegex(term), "i") },
        ],
      }
    : {};
  const filter = { role, ...search };

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter, "UserId FirstName LastName Email PhoneNumber role isActive ProfileImage createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);
  return { people: users.map((u) => toPerson(u as never)), total, page, pageSize: PAGE_SIZE };
}

export async function getPatient(id: string) {
  const user = await findPerson(id, "user");
  await completePastAppointments({ userId: user._id });

  const [appointments, records] = await Promise.all([
    Appointment.find({ userId: user._id }).populate("doctor", "docName department").sort({ date: -1 }).limit(100).lean(),
    MedicalRecord.find({ patient: user._id }, { sections: 0, ...RECORD_PUBLIC_PROJECTION })
      .populate("doctor", "docName department")
      .sort({ visitDate: -1, createdAt: -1 })
      .lean(),
  ]);

  return {
    patient: toPerson(user.toObject() as never),
    appointments: appointments.map((a) => ({
      _id: String(a._id),
      date: a.date,
      time: a.time,
      status: a.status,
      department: a.department,
      doctor: (a.doctor as unknown as { docName?: string } | null)?.docName ?? null,
      urgency: a.urgency?.level ?? "routine",
    })),
    records: records.map((r) => ({
      ...r,
      // Staff uploads are the ones admins can remove (e.g. a wrong-patient upload).
      uploadedByStaff: Boolean(!r.doctor && r.attachment),
    })),
  };
}

// ---------- Doctors ----------

export async function listDoctors() {
  const today = todayInHospital();
  const [doctors, upcoming] = await Promise.all([
    Doctor.find({}).populate("userId", "UserId Email isActive").sort({ department: 1, docName: 1 }).lean(),
    Appointment.aggregate([
      { $match: { status: "confirmed", date: { $gte: today } } },
      { $group: { _id: "$doctor", n: { $sum: 1 } } },
    ]),
  ]);
  const upcomingById = new Map(upcoming.map((u) => [String(u._id), u.n as number]));

  return doctors.map((d) => {
    const account = d.userId as unknown as { _id: unknown; UserId: string; Email: string; isActive: boolean } | null;
    return {
      _id: String(d._id),
      docName: d.docName,
      docImg: d.docImg ?? "",
      department: d.department,
      YOE: d.YOE,
      gender: d.gender,
      about: d.about ?? "",
      availability: d.availability,
      availableTime: (d.availableTime ?? []).map(({ day, start, end }) => ({ day, start, end })),
      upcomingAppointments: upcomingById.get(String(d._id)) ?? 0,
      account: account ? { id: String(account._id), userId: account.UserId, email: account.Email, activated: account.isActive } : null,
    };
  });
}

async function assertDepartment(field: string) {
  if (!(await Department.exists({ field }))) throw new ServiceError(400, `There's no ${field} department`, "department");
}

async function findDoctorProfile(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ServiceError(404, "Doctor not found");
  const doctor = await Doctor.findById(id);
  if (!doctor) throw new ServiceError(404, "Doctor not found");
  return doctor;
}

export async function createDoctor(input: DoctorProfileInput) {
  await assertDepartment(input.department);
  if (await Doctor.exists({ docName: input.docName })) {
    throw new ServiceError(409, `There's already a doctor called ${input.docName}`, "docName");
  }
  const doctor = await Doctor.create({ ...input, availableTime: input.availableTime ?? [], docImg: "" });
  return String(doctor._id);
}

export async function updateDoctor(id: string, input: Partial<DoctorProfileInput>) {
  const doctor = await findDoctorProfile(id);
  if (input.department) await assertDepartment(input.department);
  if (input.docName && input.docName !== doctor.docName && (await Doctor.exists({ docName: input.docName }))) {
    throw new ServiceError(409, `There's already a doctor called ${input.docName}`, "docName");
  }
  Object.assign(doctor, input);
  await doctor.save();
  return String(doctor._id);
}

// Same rules and warnings as when doctors set their own hours.
export async function setDoctorHours(id: string, input: AvailabilityInput) {
  return updateAvailability(await findDoctorProfile(id), input);
}

export async function setDoctorPhoto(id: string, url: string) {
  const doctor = await findDoctorProfile(id);
  doctor.docImg = url;
  await doctor.save();
}

// Creates the doctor's login (not yet activated) and links it to the profile.
// The doctor then activates it on the normal activation page.
export async function createDoctorLogin(doctorId: string, input: PersonInput) {
  const doctor = await findDoctorProfile(doctorId);
  if (doctor.userId) throw new ServiceError(409, `${doctor.docName} already has a login. Unlink it first.`);

  const person = await createPerson("doctor", input);
  await linkDoctorAccount(doctorId, person.userId);
  return person;
}

// ---------- Departments ----------

export async function listDepartments() {
  const [departments, counts] = await Promise.all([
    Department.find().sort({ field: 1 }).lean(),
    Doctor.aggregate([{ $group: { _id: "$department", total: { $sum: 1 }, accepting: { $sum: { $cond: ["$availability", 1, 0] } } } }]),
  ]);
  const byField = new Map(counts.map((c) => [c._id as string, c]));
  return departments.map((d) => ({
    ...d,
    doctors: byField.get(d.field)?.total ?? 0,
    acceptingDoctors: byField.get(d.field)?.accepting ?? 0,
  }));
}

const toDepartmentDoc = (input: Partial<DepartmentInput>) => {
  const { overview, services, ...rest } = input;
  return {
    ...rest,
    ...(overview !== undefined ? { "details.overview": overview } : {}),
    ...(services !== undefined ? { "details.services": services } : {}),
  };
};

export async function createDepartment(input: DepartmentInput) {
  if (await Department.exists({ field: input.field }).collation(ID_COLLATION)) {
    throw new ServiceError(409, `${input.field} already exists`, "field");
  }
  const { overview, services, ...rest } = input;
  const department = await Department.create({ ...rest, details: { overview, services, image: "" } });
  return String(department._id);
}

// Renaming moves the department's doctors with it. Past appointments and
// records keep the name they were made under.
export async function updateDepartment(id: string, input: Partial<DepartmentInput>) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ServiceError(404, "Department not found");
  const department = await Department.findById(id);
  if (!department) throw new ServiceError(404, "Department not found");

  const oldName = department.field;
  if (input.field && input.field !== oldName) {
    if (await Department.exists({ _id: { $ne: department._id }, field: input.field }).collation(ID_COLLATION)) {
      throw new ServiceError(409, `${input.field} already exists`, "field");
    }
  }
  await Department.updateOne({ _id: department._id }, { $set: toDepartmentDoc(input) }, { runValidators: true });
  if (input.field && input.field !== oldName) {
    await Doctor.updateMany({ department: oldName }, { department: input.field });
  }
  return String(department._id);
}

// ---------- Documents ----------

export async function uploadRecord(
  adminUserId: string,
  patientId: string,
  input: UploadRecordInput,
  file: { buffer: Buffer; originalname: string }
) {
  const patient = await findPerson(patientId, "user");
  await assertDepartment(input.department);

  const attachment = await saveDocument(file.buffer, file.originalname);
  try {
    const record = await MedicalRecord.create({
      patient: patient._id,
      type: input.type,
      title: input.title,
      department: input.department,
      visitDate: new Date(`${input.visitDate}T12:00:00Z`),
      summary: input.summary || undefined,
      sections: [],
      attachment,
      createdBy: new ObjectId(adminUserId),
    });

    await recordActivity(String(patient._id), "record", `${RECORD_TYPE_LABELS[input.type]} added: ${input.title}`);
    return MedicalRecord.findById(record._id, RECORD_PUBLIC_PROJECTION).lean();
  } catch (error) {
    // Don't leave an orphaned file if the record couldn't be saved.
    await deleteDocument(attachment);
    throw error;
  }
}

// For a document uploaded to the wrong patient, or the wrong file. Only staff
// uploads can be removed here; records doctors wrote are part of the clinical
// history and are corrected with an addendum instead.
export async function deleteUploadedRecord(adminUserId: string, recordId: string) {
  if (!mongoose.Types.ObjectId.isValid(recordId)) throw new ServiceError(404, "Record not found");
  const record = await MedicalRecord.findOne({ _id: recordId, doctor: { $exists: false }, attachment: { $exists: true } });
  if (!record) throw new ServiceError(404, "Record not found, or it isn't a staff upload");

  await record.deleteOne();
  if (record.attachment) await deleteDocument(record.attachment);
  logger.warn(
    { audit: "record_deleted", recordId, patient: String(record.patient), by: adminUserId, title: record.title },
    "Admin deleted an uploaded medical record"
  );
}

export async function getRecordForDownload(patientId: string, recordId: string) {
  const patient = await findPerson(patientId, "user");
  if (!mongoose.Types.ObjectId.isValid(recordId)) throw new ServiceError(404, "Record not found");
  const record = await MedicalRecord.findOne({ _id: recordId, patient: patient._id }).populate("doctor", "docName").lean();
  if (!record) throw new ServiceError(404, "Record not found");
  return { record, patient: patient.toObject() };
}
