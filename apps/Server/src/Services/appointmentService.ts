import mongoose from "mongoose";
import { Appointment, IAppointment } from "../Models/Appointment";
import { Doctor, type IDoctorDoc } from "../Models/Doctor";
import type { BookingPayload } from "../Validation/BookingSchema";
import type { IDoctor } from "../types/doctor";
import Flagged from "../Models/Flagged";
import { getDoctorForUser } from "../Utils/doctorAccount";
import {
  compareDateTime,
  dayNameOf,
  daysBetween,
  formatTimeLabel,
  minutesNowInHospital,
  parseTimeLabel,
  SLOT_MINUTES,
  slotStartsInWindow,
  todayInHospital,
} from "../Utils/appointmentTime";
import { recordActivity } from "./activityService";
import { ServiceError } from "./errors";
import { triage, needsFlag, emergencyReply, type TriageLevel } from "./triage";

export const URGENCY_LEVELS: TriageLevel[] = ["routine", "urgent", "emergency"];

// Patients can move an appointment only this many days ahead of it, so the
// doctor's schedule doesn't change at the last minute. The booking screens
// show the same rule.
export const RESCHEDULE_NOTICE_DAYS = Number(process.env.RESCHEDULE_NOTICE_DAYS ?? 7);

// "Cardiology with Dr. Ada – 2026-10-01", as shown in the patient's activity feed.
function describe(appointment: Pick<IAppointment, "department" | "doctor">, date: string) {
  return `${appointment.department} with ${(appointment.doctor as IDoctor).docName} – ${date}`;
}

// Confirmed appointments whose day has passed become "completed", so they
// leave Upcoming and show under Completed. Runs whenever appointments are
// read, which keeps it correct without a scheduled job. A doctor marking a
// visit completed (or a no-show) can be added on top in the doctor portal.
export function completePastAppointments(filter: Record<string, unknown> = {}) {
  return Appointment.updateMany(
    { ...filter, status: "confirmed", date: { $lt: todayInHospital() } },
    { status: "completed" }
  );
}

// Only the patient who booked an appointment can see or change it.
async function findOwnedAppointment(userId: string, appointmentId: string) {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw new ServiceError(400, "Invalid appointment ID");
  }

  const appointment = await Appointment.findById(appointmentId)
    .where("userId")
    .equals(userId)
    .populate("doctor");

  if (!appointment) throw new ServiceError(404, "Appointment not found");
  return appointment;
}

async function findBookableDoctor(doctorId: string) {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) throw new ServiceError(400, "Invalid doctor", "doctor");
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ServiceError(404, "Doctor not found", "doctor");
  if (!doctor.availability) throw new ServiceError(400, `${doctor.docName} isn't taking appointments right now`, "doctor");
  return doctor;
}

export interface Slot {
  time: string;
  available: boolean;
  // Why a slot can't be booked: already taken, or already started today.
  reason?: "booked" | "past";
}

// Every slot the doctor offers on `date`, marked available or not. Slots come
// from the doctor's weekly hours split into SLOT_MINUTES pieces.
// `ignoreAppointmentId` lets a patient keep their own slot when rescheduling.
async function slotsFor(doctor: IDoctorDoc, date: string, ignoreAppointmentId?: string): Promise<Slot[]> {
  const today = todayInHospital();
  if (date < today) return [];

  const day = dayNameOf(date);
  const starts = doctor.availableTime
    .filter((window) => window.day === day)
    .flatMap((window) => slotStartsInWindow(window.start, window.end));
  if (!starts.length) return [];

  const booked = await Appointment.find(
    {
      doctor: doctor._id,
      date,
      status: "confirmed",
      ...(ignoreAppointmentId ? { _id: { $ne: new mongoose.Types.ObjectId(ignoreAppointmentId) } } : {}),
    },
    { time: 1 }
  ).lean();
  const bookedMinutes = new Set(booked.map((a) => parseTimeLabel(a.time)));
  const nowMinutes = date === today ? minutesNowInHospital() : -1;

  return [...new Set(starts)]
    .sort((a, b) => a - b)
    .map((minutes): Slot => {
      if (minutes <= nowMinutes) return { time: formatTimeLabel(minutes), available: false, reason: "past" };
      if (bookedMinutes.has(minutes)) return { time: formatTimeLabel(minutes), available: false, reason: "booked" };
      return { time: formatTimeLabel(minutes), available: true };
    });
}

export async function getAvailableSlots(doctorId: string, date: string, ignoreAppointmentId?: string) {
  const doctor = await findBookableDoctor(doctorId);
  return { date, day: dayNameOf(date), slotMinutes: SLOT_MINUTES, slots: await slotsFor(doctor, date, ignoreAppointmentId) };
}

// Throws a clear error unless `time` on `date` is a free slot for the doctor.
// Returns the time in the stored format ("9:30 AM").
async function assertSlotFree(doctor: IDoctorDoc, date: string, time: string, ignoreAppointmentId?: string) {
  if (date < todayInHospital()) throw new ServiceError(400, "Please choose a date from today onwards", "date");

  const slots = await slotsFor(doctor, date, ignoreAppointmentId);
  if (!slots.length) {
    throw new ServiceError(400, `${doctor.docName} doesn't see patients on ${dayNameOf(date)}s`, "date");
  }

  const minutes = parseTimeLabel(time);
  const slot = minutes === null ? undefined : slots.find((s) => parseTimeLabel(s.time) === minutes);
  if (!slot) throw new ServiceError(400, "That time isn't one of the doctor's appointment slots", "time");
  if (slot.reason === "past") throw new ServiceError(400, "That time has already passed. Please pick a later slot.", "time");
  if (slot.reason === "booked") throw new ServiceError(409, "Sorry, that slot has just been booked. Please pick another time.", "time");
  return slot.time;
}

// The unique index on confirmed slots catches two bookings racing for the
// same slot; turn its duplicate-key error into the same friendly message.
function isSlotTakenError(error: unknown) {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}
const slotTaken = () => new ServiceError(409, "Sorry, that slot has just been booked. Please pick another time.", "time");

// Books the appointment and runs booking triage on the reason for the visit,
// so urgent requests stand out to the doctor. Returns a safety message for
// the patient when the reason sounds urgent or like an emergency.
export async function bookAppointment(userId: string, booking: BookingPayload) {
  const { doctor: doctorId, date, reason, shareRecords } = booking;

  const doctor = await findBookableDoctor(doctorId);
  const time = await assertSlotFree(doctor, date, booking.time);
  const urgency = await triage(reason);

  let appointment;
  try {
    appointment = await Appointment.create({
      // The doctor's own department, so a booking can't be filed under the wrong one.
      department: doctor.department,
      doctor: doctor._id,
      date,
      time,
      reason,
      shareRecords,
      status: "confirmed",
      userId: new mongoose.Types.ObjectId(userId),
      urgency: {
        level: urgency.level,
        reason: urgency.reason,
        source: urgency.source,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    if (isSlotTakenError(error)) throw slotTaken();
    throw error;
  }

  if (needsFlag(urgency)) {
    await Flagged.create({
      source: "booking",
      userId: new mongoose.Types.ObjectId(userId),
      appointmentId: appointment._id,
      message: reason,
      reason: urgency.reason,
      level: urgency.level,
      category: urgency.category,
      triageSource: urgency.source,
    });
  }

  const populated = await Appointment.findById(appointment._id).populate("doctor").lean<IAppointment>();
  if (populated) {
    await recordActivity(userId, "confirmed", describe(populated, date));
  }

  let safetyMessage: string | undefined;
  if (urgency.level === "emergency") {
    safetyMessage = emergencyReply(urgency.category);
  } else if (urgency.level === "urgent") {
    safetyMessage = "Your appointment is booked and marked as urgent for your doctor. If your symptoms get worse before then, contact the hospital or call emergency services.";
  }

  return { appointment: populated, safetyMessage };
}

// The patient's appointments in date and time order (string sorting would
// put "10:00 AM" before "9:00 AM").
export async function listAppointments(userId: string) {
  const filter = { userId: new mongoose.Types.ObjectId(userId) };
  await completePastAppointments(filter);
  const appointments = await Appointment.find(filter).populate("doctor");
  return appointments.sort(compareDateTime);
}

function assertStillOpen(appointment: IAppointment, action: "reschedule" | "cancel") {
  if (appointment.status === "cancelled") {
    throw new ServiceError(400, action === "cancel" ? "Appointment has already been cancelled" : "A cancelled appointment can't be rescheduled. Please book a new one.");
  }
  if (appointment.status === "completed" || appointment.date < todayInHospital()) {
    throw new ServiceError(400, `This appointment has already taken place, so it can't be ${action === "cancel" ? "cancelled" : "rescheduled"}.`);
  }
}

export async function rescheduleAppointment(userId: string, appointmentId: string, date: string, requestedTime: string) {
  const appointment = await findOwnedAppointment(userId, appointmentId);
  assertStillOpen(appointment, "reschedule");

  if (daysBetween(todayInHospital(), appointment.date) < RESCHEDULE_NOTICE_DAYS) {
    throw new ServiceError(
      400,
      `Appointments can only be rescheduled at least ${RESCHEDULE_NOTICE_DAYS} days before the scheduled date. Please contact the hospital.`
    );
  }

  const doctor = await findBookableDoctor(String((appointment.doctor as IDoctor)._id));
  const time = await assertSlotFree(doctor, date, requestedTime, appointmentId);

  appointment.date = date;
  appointment.time = time;
  try {
    await appointment.save();
  } catch (error) {
    if (isSlotTakenError(error)) throw slotTaken();
    throw error;
  }

  await recordActivity(userId, "rescheduled", describe(appointment, date));
  return appointment;
}

export async function cancelAppointment(userId: string, appointmentId: string) {
  const appointment = await findOwnedAppointment(userId, appointmentId);
  assertStillOpen(appointment, "cancel");

  appointment.status = "cancelled";
  await appointment.save();

  await recordActivity(userId, "cancelled", describe(appointment, appointment.date));
  return appointment;
}

// Doctors can correct the urgency the triage step set on their own appointments.
export async function setAppointmentUrgency(doctorUserId: string, appointmentId: string, level: unknown, reason: unknown) {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw new ServiceError(400, "Invalid appointment ID");
  }
  if (!URGENCY_LEVELS.includes(level as TriageLevel)) {
    throw new ServiceError(400, `Urgency must be one of: ${URGENCY_LEVELS.join(", ")}`);
  }

  const doctor = await getDoctorForUser(doctorUserId);
  if (!doctor) {
    throw new ServiceError(404, "Your account isn't linked to a doctor profile yet. Ask an admin to link it.");
  }

  const appointment = await Appointment.findOne({ _id: appointmentId, doctor: doctor._id });
  if (!appointment) throw new ServiceError(404, "Appointment not found");

  appointment.urgency = {
    level: level as TriageLevel,
    reason: typeof reason === "string" && reason.trim() ? reason.trim().slice(0, 300) : "Set by doctor",
    source: "doctor",
    updatedAt: new Date(),
  };
  await appointment.save();
  return appointment;
}
