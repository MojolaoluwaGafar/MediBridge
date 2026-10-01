import mongoose from "mongoose";
import { Appointment, IAppointment } from "../Models/Appointment";
import type { BookingPayload } from "../Validation/BookingSchema";
import type { IDoctor } from "../types/doctor";
import Flagged from "../Models/Flagged";
import { getDoctorForUser } from "../Utils/doctorAccount";
import { recordActivity } from "./activityService";
import { ServiceError } from "./errors";
import { triage, needsFlag, emergencyReply, type TriageLevel } from "./triage";

export const URGENCY_LEVELS: TriageLevel[] = ["routine", "urgent", "emergency"];

// "Cardiology with Dr. Ada – 2026-10-01", as shown in the patient's activity feed.
function describe(appointment: Pick<IAppointment, "department" | "doctor">, date: string) {
  return `${appointment.department} with ${(appointment.doctor as IDoctor).docName} – ${date}`;
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

// Books the appointment and runs booking triage on the reason for the visit,
// so urgent requests stand out to the doctor. Returns a safety message for
// the patient when the reason sounds urgent or like an emergency.
export async function bookAppointment(userId: string, booking: BookingPayload) {
  const { department, doctor, date, time, reason, shareRecords } = booking;

  const urgency = await triage(reason);

  const appointment = await Appointment.create({
    department,
    doctor: new mongoose.Types.ObjectId(doctor),
    date,
    time,
    reason,
    shareRecords,
    status: "confirmed",
    userId: new mongoose.Types.ObjectId(userId),
    createdAt: new Date(),
    urgency: {
      level: urgency.level,
      reason: urgency.reason,
      source: urgency.source,
      updatedAt: new Date(),
    },
  });

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

export function listAppointments(userId: string) {
  return Appointment.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ date: 1, time: 1 })
    .populate("doctor");
}

export async function rescheduleAppointment(userId: string, appointmentId: string, date: string, time: string) {
  const appointment = await findOwnedAppointment(userId, appointmentId);

  appointment.date = date;
  appointment.time = time;
  appointment.status = "confirmed";
  await appointment.save();

  await recordActivity(userId, "rescheduled", describe(appointment, date));
  return appointment;
}

export async function cancelAppointment(userId: string, appointmentId: string) {
  const appointment = await findOwnedAppointment(userId, appointmentId);

  if (appointment.status.toLowerCase() === "cancelled") {
    throw new ServiceError(400, "Appointment has already been cancelled");
  }

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
