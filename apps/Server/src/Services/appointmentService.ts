import mongoose from "mongoose";
import { Appointment, IAppointment } from "../Models/Appointment";
import type { BookingPayload } from "../Validation/BookingSchema";
import type { IDoctor } from "../types/doctor";
import { recordActivity } from "./activityService";
import { ServiceError } from "./errors";

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

export async function bookAppointment(userId: string, booking: BookingPayload) {
  const { department, doctor, date, time, reason, shareRecords } = booking;

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
  });

  const populated = await Appointment.findById(appointment._id).populate("doctor").lean<IAppointment>();
  if (populated) {
    await recordActivity(userId, "confirmed", describe(populated, date));
  }
  return populated;
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
