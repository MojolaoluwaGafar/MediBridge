import mongoose from "mongoose";
import { Doctor } from "../Models/Doctor";
import { Appointment } from "../Models/Appointment";

// The doctor profile linked to a doctor's login, or null if none is linked yet.
export const getDoctorForUser = (userId: string) =>
  Doctor.findOne({ userId: new mongoose.Types.ObjectId(userId) });

// Patients who have (or had) an appointment with this doctor.
export const getDoctorPatientIds = async (doctorId: mongoose.Types.ObjectId) =>
  (await Appointment.distinct("userId", { doctor: doctorId })) as mongoose.Types.ObjectId[];
