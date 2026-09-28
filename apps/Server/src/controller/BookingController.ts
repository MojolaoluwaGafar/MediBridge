import mongoose from "mongoose";
import { Request, Response } from "express";
import { BookingSchema } from "../Validation/BookingSchema";
import { Appointment, IAppointment } from "../Models/Appointment";
import type { AuthRequest } from "../middlewares/Auth";
import { Activity } from "../Models/Activity";
import { IDoctor } from "../types/doctor";

export const bookAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = BookingSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { department, doctor, date, time, reason, shareRecords } = parsed.data;

    const appointment = await Appointment.create({
      department,
      doctor : new mongoose.Types.ObjectId(doctor),
      date,
      time,
      reason,
      shareRecords,
      status: "confirmed",
      userId: new mongoose.Types.ObjectId(req.user.id),
      createdAt: new Date(),
    });

    const populatedAppointment = await Appointment.findById(appointment._id).populate("doctor").lean<IAppointment>()

    await Activity.create({
      userId: req.user.id,
      type: "confirmed",
      message: `${populatedAppointment?.department} with ${(populatedAppointment?.doctor as IDoctor).docName} – ${date}`,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const appointments = await Appointment.find({
      userId: new mongoose.Types.ObjectId(req.user.id),
    }).sort({ date: 1, time: 1 }).populate("doctor")

    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const rescheduleAppointment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = req.params.id as string;
    const { date, time } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id)
      .where("userId")
      .equals(req.user.id)
      .populate("doctor");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.date = date;
    appointment.time = time;
    appointment.status = "confirmed";

    await appointment.save();

    await Activity.create({
      userId: req.user.id,
      type: "rescheduled",
      message: `${appointment.department} with ${
        (appointment.doctor as IDoctor).docName
      } – ${date}`,
    });

    return res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const cancelAppointment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id).where("userId").equals(req.user.id).populate("doctor");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status.toLowerCase() === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Appointment has already been cancelled",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    await Activity.create({
      userId: req.user.id,
      type: "cancelled",
      message: `${appointment.department} with ${
        (appointment.doctor as IDoctor).docName
      } – ${appointment.date}`,
    });

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};