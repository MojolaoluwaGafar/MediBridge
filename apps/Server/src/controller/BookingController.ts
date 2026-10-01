import { Response } from "express";
import { BookingSchema } from "../Validation/BookingSchema";
import type { AuthRequest } from "../middlewares/Auth";
import * as appointmentService from "../Services/appointmentService";
import { isServiceError } from "../Services/errors";

function sendError(res: Response, error: any) {
  if (isServiceError(error)) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message,
  });
}

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

    const appointment = await appointmentService.bookAppointment(req.user.id, parsed.data);

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const appointments = await appointmentService.listAppointments(req.user.id);

    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error: any) {
    return sendError(res, error);
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

    const { date, time } = req.body;
    const appointment = await appointmentService.rescheduleAppointment(req.user.id, req.params.id as string, date, time);

    return res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment,
    });
  } catch (error: any) {
    return sendError(res, error);
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

    const appointment = await appointmentService.cancelAppointment(req.user.id, req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};
