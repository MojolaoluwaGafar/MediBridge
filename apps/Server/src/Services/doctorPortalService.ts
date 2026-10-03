import mongoose from "mongoose";
import { Appointment, type AppointmentStatus, type IAppointment } from "../Models/Appointment";
import { Activity } from "../Models/Activity";
import { type IDoctorDoc } from "../Models/Doctor";
import Flagged from "../Models/Flagged";
import { MedicalRecord, RECORD_PUBLIC_PROJECTION, RECORD_TYPE_LABELS } from "../Models/MedicalRecord";
import { Message } from "../Models/Message";
import { User } from "../Models/User";
import { VisitNote } from "../Models/VisitNote";
import { doctorFlagsFilter, getDoctorForUser } from "../Utils/doctorAccount";
import {
  compareDateTime,
  dayNameOf,
  formatTimeLabel,
  minutesNowInHospital,
  parseTimeLabel,
  SLOT_MINUTES,
  todayInHospital,
} from "../Utils/appointmentTime";
import type { AvailabilityInput, APPOINTMENT_VIEWS, WriteRecordInput } from "../Validation/doctorSchema";
import { WEEK_DAYS } from "../Validation/doctorSchema";
import { toPublicRecord } from "../Utils/recordDownload";
import { recordActivity } from "./activityService";
import { assertStillOpen, completePastAppointments, describe } from "./appointmentService";
import { ServiceError } from "./errors";

// Everything the doctor portal reads and changes. Each function takes the
// signed-in doctor's profile and only ever touches that doctor's own
// appointments, and the patients who booked them. A patient or appointment
// that isn't theirs is reported as not found (404), never forbidden: the
// client signs people out on 403.

const { ObjectId } = mongoose.Types;
type Id = mongoose.Types.ObjectId;

const PATIENT_FIELDS = "FirstName LastName UserId ProfileImage";
const ACTIVE = { $in: ["confirmed", "completed"] as AppointmentStatus[] };

export const NOT_LINKED_MESSAGE =
  "Your account isn't linked to a doctor profile yet. Please ask a MediBridge administrator to link it.";

export async function requireDoctor(userId: string): Promise<IDoctorDoc> {
  const doctor = await getDoctorForUser(userId);
  if (!doctor) throw new ServiceError(404, NOT_LINKED_MESSAGE);
  return doctor;
}

// ---------- Shapes sent to the client ----------

interface PatientDoc {
  _id: Id;
  FirstName: string;
  LastName: string;
  UserId: string;
  ProfileImage?: string | null;
}

const toPatientSummary = (p: PatientDoc | null | undefined) =>
  p
    ? { id: p._id.toString(), userId: p.UserId, firstname: p.FirstName, lastname: p.LastName, img: p.ProfileImage ?? null }
    : null;

type LeanAppointment = Omit<IAppointment, "userId"> & { _id: Id; userId?: PatientDoc | Id | null };

const toAppointmentDto = (a: LeanAppointment) => ({
  _id: a._id.toString(),
  date: a.date,
  time: a.time,
  reason: a.reason,
  status: a.status,
  department: a.department,
  shareRecords: Boolean(a.shareRecords),
  urgency: a.urgency ?? null,
  createdAt: a.createdAt,
  patient: a.userId && "FirstName" in a.userId ? toPatientSummary(a.userId) : null,
  hasRecord: false,
});

type AppointmentDto = ReturnType<typeof toAppointmentDto>;

// Marks the visits this doctor has already written a record for.
async function withRecordFlags(doctor: IDoctorDoc, appointments: AppointmentDto[]) {
  if (!appointments.length) return appointments;
  const written = await MedicalRecord.distinct("appointment", {
    doctor: doctor._id,
    appointment: { $in: appointments.map((a) => new ObjectId(a._id)) },
  });
  const ids = new Set(written.map(String));
  return appointments.map((a) => ({ ...a, hasRecord: ids.has(a._id) }));
}

export const toDoctorProfile = (doctor: IDoctorDoc) => ({
  _id: String(doctor._id),
  docName: doctor.docName,
  docImg: doctor.docImg ?? "",
  department: doctor.department,
  YOE: doctor.YOE,
  about: doctor.about ?? "",
  gender: doctor.gender,
  availability: doctor.availability,
  availableTime: (doctor.availableTime ?? []).map(({ day, start, end }) => ({ day, start, end })),
  slotMinutes: SLOT_MINUTES,
});

// ---------- Dates ----------

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Monday to Sunday around `date`.
function weekAround(date: string) {
  const offset = (WEEK_DAYS as readonly string[]).indexOf(dayNameOf(date));
  const start = addDays(date, -offset);
  return { start, end: addDays(start, 6) };
}

// "Thursday 8 October" for messages a patient reads.
function prettyDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`)
  );
}

const sortByDateTime = <T extends { date: string; time: string }>(items: T[]) => items.sort(compareDateTime);

// ---------- Appointments ----------

function findDoctorAppointments(doctor: IDoctorDoc, filter: Record<string, unknown> = {}) {
  return Appointment.find({ ...filter, doctor: doctor._id })
    .populate("userId", PATIENT_FIELDS)
    .lean<LeanAppointment[]>();
}

export type AppointmentView = (typeof APPOINTMENT_VIEWS)[number];

export async function listAppointments(doctor: IDoctorDoc, view: AppointmentView, date?: string) {
  await completePastAppointments({ doctor: doctor._id });
  const today = todayInHospital();

  const filters: Record<AppointmentView, Record<string, unknown>> = {
    upcoming: { status: "confirmed", date: { $gte: today } },
    today: { status: ACTIVE, date: today },
    completed: { status: "completed" },
    cancelled: { status: "cancelled" },
    all: {},
  };
  const filter = { ...filters[view], ...(date ? { date } : {}) };

  const appointments = sortByDateTime(await findDoctorAppointments(doctor, filter));
  // History reads newest first; the schedule reads soonest first.
  if (view === "completed" || view === "cancelled") appointments.reverse();
  return withRecordFlags(doctor, appointments.slice(0, 500).map(toAppointmentDto));
}

async function findOwnAppointment(doctor: IDoctorDoc, appointmentId: string) {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) throw new ServiceError(400, "Invalid appointment ID");
  const appointment = await Appointment.findOne({ _id: appointmentId, doctor: doctor._id }).populate("doctor");
  if (!appointment) throw new ServiceError(404, "Appointment not found");
  return appointment;
}

async function appointmentDto(appointmentId: Id) {
  const fresh = await Appointment.findById(appointmentId).populate("userId", PATIENT_FIELDS).lean<LeanAppointment>();
  return fresh ? toAppointmentDto(fresh) : null;
}

// A visit can be marked done once it has started. Earlier than that the slot
// would still be on offer, and the visit hasn't happened.
export async function completeAppointment(doctor: IDoctorDoc, appointmentId: string) {
  const appointment = await findOwnAppointment(doctor, appointmentId);
  if (appointment.status !== "confirmed") {
    throw new ServiceError(400, `This appointment is ${appointment.status}, so it can't be marked as completed.`);
  }

  const today = todayInHospital();
  const started =
    appointment.date < today ||
    (appointment.date === today && (parseTimeLabel(appointment.time) ?? 0) <= minutesNowInHospital());
  if (!started) throw new ServiceError(400, "You can mark a visit as completed once its start time has passed.");

  appointment.status = "completed";
  await appointment.save();
  return appointmentDto(appointment._id as Id);
}

// The doctor cancels a visit. The patient sees it in their activity feed and
// gets a message from the doctor with the reason, so they can rebook.
export async function cancelAppointment(doctor: IDoctorDoc, appointmentId: string, reason: string) {
  const appointment = await findOwnAppointment(doctor, appointmentId);
  assertStillOpen(appointment, "cancel");

  appointment.status = "cancelled";
  await appointment.save();

  if (appointment.userId) {
    const patientId = appointment.userId.toString();
    await recordActivity(patientId, "cancelled", `${describe(appointment, appointment.date)} (cancelled by your doctor)`, {
      doctor: doctor._id as Id,
      appointment: appointment._id as Id,
      actor: "doctor",
    });

    const because = reason ? ` Reason: ${reason}` : "";
    await Message.create({
      patient: appointment.userId,
      doctor: doctor._id,
      sender: "doctor",
      body:
        `I'm sorry, I've had to cancel your ${appointment.department} appointment on ` +
        `${prettyDate(appointment.date)} at ${appointment.time}.${because}\n\n` +
        "Please book another time that suits you, or reply here if you have any questions.",
    });
  }

  return appointmentDto(appointment._id as Id);
}

// ---------- Dashboard ----------

async function openFlags(doctor: IDoctorDoc, limit: number) {
  const filter = { ...(await doctorFlagsFilter(doctor._id as Id)), status: "new" as const };
  const [count, flags] = await Promise.all([
    Flagged.countDocuments(filter),
    Flagged.find(filter)
      .sort({ flaggedAt: -1 })
      .limit(limit)
      .populate("userId", PATIENT_FIELDS)
      .populate("appointmentId", "date time")
      .lean(),
  ]);

  return {
    count,
    flags: flags.map((f) => {
      const appointment = f.appointmentId as unknown as { _id: Id; date: string; time: string } | null;
      return {
        _id: String(f._id),
        source: f.source,
        level: f.level,
        reason: f.reason,
        message: f.message.length > 300 ? `${f.message.slice(0, 300)}…` : f.message,
        flaggedAt: f.flaggedAt,
        patient: toPatientSummary(f.userId as unknown as PatientDoc | null),
        appointment: appointment ? { _id: appointment._id.toString(), date: appointment.date, time: appointment.time } : null,
      };
    }),
  };
}

async function recentActivity(doctor: IDoctorDoc, limit = 8) {
  const events = await Activity.find({ doctor: doctor._id })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate("userId", PATIENT_FIELDS)
    .populate("appointment", "date time")
    .lean();

  return events.map((e) => {
    const appointment = e.appointment as unknown as { date: string; time: string } | null;
    return {
      _id: String(e._id),
      type: e.type,
      actor: e.actor ?? "patient",
      // For "record" events: what was added.
      message: e.type === "record" ? e.message : null,
      timestamp: e.timestamp,
      patient: toPatientSummary(e.userId as unknown as PatientDoc | null),
      date: appointment?.date ?? null,
      time: appointment?.time ?? null,
    };
  });
}

export async function getDashboard(doctor: IDoctorDoc) {
  await completePastAppointments({ doctor: doctor._id });
  const today = todayInHospital();
  const week = weekAround(today);
  const doctorId = doctor._id as Id;

  const [todays, upcomingThisWeek, completedThisWeek, weekPatients, attention, activity] = await Promise.all([
    findDoctorAppointments(doctor, { date: today, status: ACTIVE }),
    Appointment.countDocuments({ doctor: doctorId, status: "confirmed", date: { $gte: today, $lte: week.end } }),
    Appointment.countDocuments({ doctor: doctorId, status: "completed", date: { $gte: week.start, $lte: week.end } }),
    Appointment.distinct("userId", { doctor: doctorId, status: ACTIVE, date: { $gte: week.start, $lte: week.end } }),
    openFlags(doctor, 6),
    recentActivity(doctor),
  ]);

  const schedule = sortByDateTime(todays).map(toAppointmentDto);
  const nowMinutes = minutesNowInHospital();
  const next = schedule.find((a) => a.status === "confirmed" && (parseTimeLabel(a.time) ?? 0) >= nowMinutes - SLOT_MINUTES);

  return {
    today,
    stats: {
      today: schedule.length,
      remainingToday: schedule.filter((a) => a.status === "confirmed" && (parseTimeLabel(a.time) ?? 0) > nowMinutes).length,
      upcomingThisWeek,
      patientsThisWeek: weekPatients.length,
      completedThisWeek,
      needsAttention: attention.count,
    },
    schedule,
    nextAppointmentId: next?._id ?? null,
    needsAttention: attention.flags,
    activity,
  };
}

// ---------- Patients ----------

export async function listPatients(doctor: IDoctorDoc) {
  const today = todayInHospital();
  const rows: { _id: Id; visits: number; lastVisit: string | null; nextVisit: string | null }[] = await Appointment.aggregate([
    { $match: { doctor: doctor._id, userId: { $ne: null } } },
    {
      $group: {
        _id: "$userId",
        visits: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        lastVisit: { $max: { $cond: [{ $eq: ["$status", "completed"] }, "$date", null] } },
        nextVisit: {
          $min: { $cond: [{ $and: [{ $eq: ["$status", "confirmed"] }, { $gte: ["$date", today] }] }, "$date", null] },
        },
      },
    },
  ]);

  const patients = await User.find({ _id: { $in: rows.map((r) => r._id) } }, PATIENT_FIELDS).lean<PatientDoc[]>();
  const byId = new Map(patients.map((p) => [p._id.toString(), p]));

  return rows
    .flatMap((row) => {
      const patient = toPatientSummary(byId.get(row._id.toString()));
      return patient ? [{ ...patient, visits: row.visits, lastVisit: row.lastVisit, nextVisit: row.nextVisit }] : [];
    })
    .sort((a, b) => {
      // Patients with a visit coming up first (soonest first), then by name.
      if (a.nextVisit && b.nextVisit) return a.nextVisit.localeCompare(b.nextVisit);
      if (a.nextVisit || b.nextVisit) return a.nextVisit ? -1 : 1;
      return `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`);
    });
}

// The patient must have booked with this doctor at least once.
async function findOwnPatient(doctor: IDoctorDoc, patientIdText: string) {
  if (!mongoose.Types.ObjectId.isValid(patientIdText)) throw new ServiceError(404, "Patient not found");
  const patientId = new ObjectId(patientIdText);
  const hasBooked = await Appointment.exists({ doctor: doctor._id, userId: patientId });
  if (!hasBooked) throw new ServiceError(404, "Patient not found");

  const patient = await User.findById(patientId, `${PATIENT_FIELDS} Email PhoneNumber`).lean<
    PatientDoc & { Email: string; PhoneNumber: string }
  >();
  if (!patient) throw new ServiceError(404, "Patient not found");
  return patient;
}

// Records are visible only while the patient has a live booking with this
// doctor where they chose to share their medical history.
const recordsShared = (doctor: IDoctorDoc, patientId: Id) =>
  Appointment.exists({ doctor: doctor._id, userId: patientId, shareRecords: true, status: { $ne: "cancelled" } });

const notesFor = (doctor: IDoctorDoc, patientId: Id) =>
  VisitNote.find({ doctor: doctor._id, patient: patientId }).sort({ createdAt: -1 }).limit(50).lean();

const toNoteDto = (n: { _id: unknown; body: string; appointment?: Id | null; createdAt: Date }) => ({
  _id: String(n._id),
  body: n.body,
  appointmentId: n.appointment ? n.appointment.toString() : null,
  createdAt: n.createdAt,
});

export async function getPatientProfile(doctor: IDoctorDoc, patientIdText: string) {
  const patient = await findOwnPatient(doctor, patientIdText);
  await completePastAppointments({ doctor: doctor._id, userId: patient._id });

  const [appointments, shared, notes] = await Promise.all([
    findDoctorAppointments(doctor, { userId: patient._id }),
    recordsShared(doctor, patient._id),
    notesFor(doctor, patient._id),
  ]);

  // With sharing on, the patient's whole history; otherwise only the records
  // this doctor wrote, which they can always see.
  const records = await MedicalRecord.find(
    shared ? { patient: patient._id } : { patient: patient._id, doctor: doctor._id },
    { sections: 0, ...RECORD_PUBLIC_PROJECTION }
  )
    .sort({ visitDate: -1, createdAt: -1 })
    .populate("doctor", "docName department")
    .lean();

  const ordered = await withRecordFlags(doctor, sortByDateTime(appointments).map(toAppointmentDto));
  const today = todayInHospital();

  return {
    patient: {
      ...toPatientSummary(patient)!,
      email: patient.Email,
      phone: patient.PhoneNumber,
    },
    nextAppointment: ordered.find((a) => a.status === "confirmed" && a.date >= today) ?? null,
    // Newest first for the history table.
    appointments: ordered.reverse(),
    recordsShared: Boolean(shared),
    records: records.map((r) => ({
      ...r,
      writtenByYou: String((r.doctor as unknown as { _id?: Id } | null)?._id ?? "") === String(doctor._id),
    })),
    notes: notes.map(toNoteDto),
  };
}

// A record the doctor may open: one they wrote, or any of the patient's
// records while the patient shares them.
async function findSharedRecord(doctor: IDoctorDoc, patientIdText: string, recordId: string) {
  const patient = await findOwnPatient(doctor, patientIdText);
  if (!mongoose.Types.ObjectId.isValid(recordId)) throw new ServiceError(404, "Record not found");

  const shared = await recordsShared(doctor, patient._id);
  const record = await MedicalRecord.findOne({
    _id: recordId,
    patient: patient._id,
    ...(shared ? {} : { doctor: doctor._id }),
  })
    .populate("doctor", "docName docImg department")
    .lean();
  if (!record) {
    throw new ServiceError(404, shared ? "Record not found" : "This patient hasn't shared their records with you.");
  }
  return { patient, record };
}

// ---------- Records the doctor writes ----------

// "2 Oct 2026, 7:05 PM" in hospital time, for addendum headings.
const stamp = (date = new Date()) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: process.env.HOSPITAL_TIMEZONE || "Africa/Lagos",
  }).format(date);

// A record for one of the doctor's visits, once it has happened. The patient
// sees it straight away in Medical Records, marked as written by this doctor.
export async function writeRecord(doctor: IDoctorDoc, authorUserId: string, appointmentId: string, input: WriteRecordInput) {
  const appointment = await findOwnAppointment(doctor, appointmentId);
  const happened =
    appointment.status === "completed" ||
    (appointment.status === "confirmed" &&
      (appointment.date < todayInHospital() ||
        (appointment.date === todayInHospital() && (parseTimeLabel(appointment.time) ?? 0) <= minutesNowInHospital())));
  if (!happened) {
    throw new ServiceError(400, "You can write a record once the visit has taken place.");
  }
  if (!appointment.userId) throw new ServiceError(400, "This appointment has no patient.");

  const record = await MedicalRecord.create({
    patient: appointment.userId,
    doctor: doctor._id,
    appointment: appointment._id,
    type: input.type,
    title: input.title,
    department: appointment.department,
    // Midday UTC so the date reads the same in every time zone.
    visitDate: new Date(`${appointment.date}T12:00:00Z`),
    summary: input.summary || undefined,
    sections: input.sections,
    createdBy: new ObjectId(authorUserId),
  });

  await recordActivity(
    appointment.userId.toString(),
    "record",
    `${RECORD_TYPE_LABELS[input.type]} from ${doctor.docName}: ${input.title}`,
    { doctor: doctor._id as Id, appointment: appointment._id as Id, actor: "doctor" }
  );

  return MedicalRecord.findById(record._id).populate("doctor", "docName docImg department").lean();
}

// Records aren't edited once the patient can see them. A correction or later
// finding is added as a dated addendum, and the original text stays.
export async function addAddendum(doctor: IDoctorDoc, recordId: string, body: string) {
  if (!mongoose.Types.ObjectId.isValid(recordId)) throw new ServiceError(404, "Record not found");
  const record = await MedicalRecord.findOne({ _id: recordId, doctor: doctor._id });
  if (!record) throw new ServiceError(404, "Record not found, or it wasn't written by you.");

  record.sections.push({ heading: `Addendum, ${stamp()}`, body });
  await record.save();

  await recordActivity(record.patient.toString(), "record", `Addendum from ${doctor.docName}: ${record.title}`, {
    doctor: doctor._id as Id,
    appointment: record.appointment,
    actor: "doctor",
  });

  return MedicalRecord.findById(record._id).populate("doctor", "docName docImg department").lean();
}

export async function getSharedRecord(doctor: IDoctorDoc, patientIdText: string, recordId: string) {
  return toPublicRecord((await findSharedRecord(doctor, patientIdText, recordId)).record);
}

// The full record and patient, for sendRecordDownload. Server-side use only.
export const getSharedRecordForDownload = (doctor: IDoctorDoc, patientIdText: string, recordId: string) =>
  findSharedRecord(doctor, patientIdText, recordId);


export async function addVisitNote(doctor: IDoctorDoc, patientIdText: string, body: string, appointmentId?: string) {
  const patient = await findOwnPatient(doctor, patientIdText);

  let appointment: Id | undefined;
  if (appointmentId) {
    const own = mongoose.Types.ObjectId.isValid(appointmentId)
      ? await Appointment.exists({ _id: appointmentId, doctor: doctor._id, userId: patient._id })
      : null;
    if (!own) throw new ServiceError(400, "That appointment isn't one of this patient's visits with you", "appointmentId");
    appointment = new ObjectId(appointmentId);
  }

  const note = await VisitNote.create({ doctor: doctor._id, patient: patient._id, appointment, body });
  return toNoteDto(note);
}

// ---------- Availability ----------

// Saves the doctor's weekly hours. Appointments already booked stay booked
// even if they now fall outside the hours; they're returned so the doctor
// can decide what to do with them.
export async function updateAvailability(doctor: IDoctorDoc, input: AvailabilityInput) {
  const dayOrder = (day: string) => (WEEK_DAYS as readonly string[]).indexOf(day);

  doctor.availability = input.availability;
  doctor.availableTime = input.availableTime
    .map((w) => ({
      day: w.day,
      start: formatTimeLabel(parseTimeLabel(w.start)!),
      end: formatTimeLabel(parseTimeLabel(w.end)!),
    }))
    .sort((a, b) => dayOrder(a.day) - dayOrder(b.day) || parseTimeLabel(a.start)! - parseTimeLabel(b.start)!);
  await doctor.save();

  const upcoming = await findDoctorAppointments(doctor, { status: "confirmed", date: { $gte: todayInHospital() } });
  const insideHours = (a: { date: string; time: string }) => {
    const minutes = parseTimeLabel(a.time) ?? -1;
    const day = dayNameOf(a.date);
    return doctor.availableTime.some(
      (w) => w.day === day && minutes >= parseTimeLabel(w.start)! && minutes + SLOT_MINUTES <= parseTimeLabel(w.end)!
    );
  };

  return {
    doctor: toDoctorProfile(doctor),
    outsideHours: sortByDateTime(upcoming.filter((a) => !insideHours(a))).map(toAppointmentDto),
  };
}
