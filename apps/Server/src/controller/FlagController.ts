import { Response } from "express";
import mongoose from "mongoose";
import Flagged from "../Models/Flagged";
import { Appointment } from "../Models/Appointment";
import type { AuthRequest } from "../middlewares/Auth";
import { getDoctorForUser, getDoctorPatientIds } from "../Utils/doctorAccount";

// Admins see every flag. Doctors see flags from their own patients and on
// their own appointments. Anyone else gets null.
async function visibleFlagsFilter(req: AuthRequest): Promise<Record<string, unknown> | null> {
  if (req.user?.role === "admin") return {};

  if (req.user?.role === "doctor") {
    const doctor = await getDoctorForUser(req.user.id);
    if (!doctor) return null;

    const patientIds = await getDoctorPatientIds(doctor._id as mongoose.Types.ObjectId);
    const appointmentIds = await Appointment.distinct("_id", { doctor: doctor._id });
    return { $or: [{ userId: { $in: patientIds } }, { appointmentId: { $in: appointmentIds } }] };
  }

  return null;
}

export const getFlags = async (req: AuthRequest, res: Response) => {
  try {
    const filter = await visibleFlagsFilter(req);
    if (!filter) {
      return res.status(200).json({ success: true, flags: [] });
    }

    const { status, level } = req.query;
    if (status === "new" || status === "reviewed") filter.status = status;
    if (level === "urgent" || level === "emergency" || level === "routine") filter.level = level;

    const flags = await Flagged.find(filter)
      .sort({ flaggedAt: -1 })
      .limit(100)
      .populate("userId", "FirstName LastName UserId")
      .populate("reviewedBy", "FirstName LastName")
      .lean();

    return res.status(200).json({ success: true, flags });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const reviewFlag = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid flag ID" });
    }

    const filter = await visibleFlagsFilter(req);
    if (!filter) {
      return res.status(404).json({ success: false, message: "Flag not found" });
    }

    const note = typeof req.body?.note === "string" ? req.body.note.trim().slice(0, 1000) : undefined;

    const flag = await Flagged.findOneAndUpdate(
      { ...filter, _id: id },
      {
        status: "reviewed",
        reviewedBy: new mongoose.Types.ObjectId(req.user!.id),
        reviewedAt: new Date(),
        ...(note ? { reviewNote: note } : {}),
      },
      { new: true }
    );

    if (!flag) {
      return res.status(404).json({ success: false, message: "Flag not found" });
    }

    return res.status(200).json({ success: true, flag });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
