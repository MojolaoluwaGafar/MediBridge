import { Response } from "express";
import type { AuthRequest } from "../middlewares/Auth";
import type { IDoctorDoc } from "../Models/Doctor";
import * as doctorPortal from "../Services/doctorPortalService";
import { writeRecordPdf } from "../Services/recordPdf";
import { sendError, sendValidationError } from "../Utils/sendError";
import { AppointmentListQuery, AvailabilitySchema, DoctorCancelSchema, VisitNoteSchema } from "../Validation/doctorSchema";

// Every doctor-portal handler needs the doctor profile linked to the login.
// An unlinked account gets a 404 with a message the portal shows as is.
const withDoctor =
  (handler: (req: AuthRequest, res: Response, doctor: IDoctorDoc) => Promise<unknown>) =>
  async (req: AuthRequest, res: Response) => {
    try {
      const doctor = await doctorPortal.requireDoctor(req.user!.id);
      await handler(req, res, doctor);
    } catch (error) {
      if (res.headersSent) {
        req.log.error({ err: error }, "Doctor portal response failed mid-stream");
        return res.end();
      }
      sendError(req, res, error);
    }
  };

const param = (req: AuthRequest, name: string) => String(req.params[name]);

export const getMe = withDoctor(async (_req, res, doctor) => {
  res.status(200).json({ success: true, doctor: doctorPortal.toDoctorProfile(doctor) });
});

export const getDashboard = withDoctor(async (_req, res, doctor) => {
  res.status(200).json({ success: true, ...(await doctorPortal.getDashboard(doctor)) });
});

export const getAppointments = withDoctor(async (req, res, doctor) => {
  const parsed = AppointmentListQuery.safeParse(req.query);
  if (!parsed.success) return sendValidationError(res, parsed.error);

  const appointments = await doctorPortal.listAppointments(doctor, parsed.data.view, parsed.data.date);
  res.status(200).json({ success: true, appointments });
});

export const completeAppointment = withDoctor(async (req, res, doctor) => {
  const appointment = await doctorPortal.completeAppointment(doctor, param(req, "id"));
  res.status(200).json({ success: true, message: "Marked as completed", appointment });
});

export const cancelAppointment = withDoctor(async (req, res, doctor) => {
  const parsed = DoctorCancelSchema.safeParse(req.body ?? {});
  if (!parsed.success) return sendValidationError(res, parsed.error);

  const appointment = await doctorPortal.cancelAppointment(doctor, param(req, "id"), parsed.data.reason);
  res.status(200).json({ success: true, message: "Appointment cancelled. The patient has been told.", appointment });
});

export const getPatients = withDoctor(async (_req, res, doctor) => {
  res.status(200).json({ success: true, patients: await doctorPortal.listPatients(doctor) });
});

export const getPatient = withDoctor(async (req, res, doctor) => {
  res.status(200).json({ success: true, ...(await doctorPortal.getPatientProfile(doctor, param(req, "id"))) });
});

export const getPatientRecord = withDoctor(async (req, res, doctor) => {
  const record = await doctorPortal.getSharedRecord(doctor, param(req, "id"), param(req, "recordId"));
  res.status(200).json({ success: true, record });
});

export const downloadPatientRecordPdf = withDoctor(async (req, res, doctor) => {
  const { fileName, pdf } = await doctorPortal.getSharedRecordForPdf(doctor, param(req, "id"), param(req, "recordId"));
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  // Medical documents must not be kept in shared or browser caches.
  res.setHeader("Cache-Control", "no-store");
  writeRecordPdf(pdf, res);
});

export const addVisitNote = withDoctor(async (req, res, doctor) => {
  const parsed = VisitNoteSchema.safeParse(req.body ?? {});
  if (!parsed.success) return sendValidationError(res, parsed.error);

  const note = await doctorPortal.addVisitNote(doctor, param(req, "id"), parsed.data.body, parsed.data.appointmentId);
  res.status(201).json({ success: true, message: "Note saved", note });
});

export const updateAvailability = withDoctor(async (req, res, doctor) => {
  const parsed = AvailabilitySchema.safeParse(req.body ?? {});
  if (!parsed.success) return sendValidationError(res, parsed.error);

  const result = await doctorPortal.updateAvailability(doctor, parsed.data);
  res.status(200).json({ success: true, message: "Availability saved", ...result });
});
