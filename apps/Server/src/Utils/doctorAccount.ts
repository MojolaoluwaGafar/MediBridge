import mongoose from "mongoose";
import { Doctor } from "../Models/Doctor";
import { Appointment } from "../Models/Appointment";

// The doctor profile linked to a doctor's login, or null if none is linked yet.
export const getDoctorForUser = (userId: string) =>
  Doctor.findOne({ userId: new mongoose.Types.ObjectId(userId) });

// Patients who have (or had) an appointment with this doctor.
export const getDoctorPatientIds = async (doctorId: mongoose.Types.ObjectId) =>
  (await Appointment.distinct("userId", { doctor: doctorId })) as mongoose.Types.ObjectId[];

// Safety flags a doctor may see: any from their own patients, and any raised
// on their own appointments.
export async function doctorFlagsFilter(doctorId: mongoose.Types.ObjectId) {
  const [patientIds, appointmentIds] = await Promise.all([
    getDoctorPatientIds(doctorId),
    Appointment.distinct("_id", { doctor: doctorId }),
  ]);
  return { $or: [{ userId: { $in: patientIds } }, { appointmentId: { $in: appointmentIds } }] } as Record<string, unknown>;
}
