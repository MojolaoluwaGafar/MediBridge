import { Request, Response } from "express";
import { listDoctors, getDoctor } from "../Services/doctorService";
import { isServiceError } from "../Services/errors";
import mongoose from "mongoose";
import { getAvailableSlots } from "../Services/appointmentService";
import { isDateString } from "../Utils/appointmentTime";
import { sendError } from "../Utils/sendError";

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await listDoctors();
    return res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const doctor = await getDoctor(req.params.id as string);
    return res.status(200).json({ success: true, doctor });
  } catch (error: any) {
    if (isServiceError(error)) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET /api/doctors/:id/slots?date=YYYY-MM-DD[&appointmentId=...]
// The doctor's slots on that date, each marked available or not. Pass the
// appointment being rescheduled so its current slot counts as free.
export const getDoctorSlots = async (req: Request, res: Response) => {
  try {
    const { date, appointmentId } = req.query;
    if (!isDateString(date)) {
      return res.status(400).json({ success: false, message: "Pick a date in YYYY-MM-DD format" });
    }
    const result = await getAvailableSlots(
      req.params.id as string,
      date,
      typeof appointmentId === "string" && mongoose.Types.ObjectId.isValid(appointmentId) ? appointmentId : undefined
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return sendError(req, res, error);
  }
};
