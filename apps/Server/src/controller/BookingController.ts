import { Response } from "express";
import { BookingSchema, RescheduleSchema } from "../Validation/BookingSchema";
import type { AuthRequest } from "../middlewares/Auth";
import * as appointmentService from "../Services/appointmentService";
import { sendError, sendValidationError } from "../Utils/sendError";

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

    const { appointment, safetyMessage } = await appointmentService.bookAppointment(req.user.id, parsed.data);

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
      safetyMessage,
    });
  } catch (error: any) {
    return sendError(req, res, error);
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
    return sendError(req, res, error);
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

    const parsed = RescheduleSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error);

    const { date, time } = parsed.data;
    const appointment = await appointmentService.rescheduleAppointment(req.user.id, req.params.id as string, date, time);

    return res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment,
    });
  } catch (error: any) {
    return sendError(req, res, error);
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
    return sendError(req, res, error);
  }
};

export const setAppointmentUrgency = async (req: AuthRequest, res: Response) => {
  try {
    const { level, reason } = req.body ?? {};
    const appointment = await appointmentService.setAppointmentUrgency(req.user!.id, req.params.id as string, level, reason);
    return res.status(200).json({ success: true, appointment });
  } catch (error: any) {
    return sendError(req, res, error);
  }
};
