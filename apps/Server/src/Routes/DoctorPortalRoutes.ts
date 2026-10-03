import { Router } from "express";
import { authMiddleware, requireRole } from "../middlewares/Auth";
import {
  addAddendum,
  addVisitNote,
  cancelAppointment,
  completeAppointment,
  downloadPatientRecordPdf,
  getAppointments,
  getDashboard,
  getMe,
  getPatient,
  getPatientRecord,
  getPatients,
  updateAvailability,
  writeRecord,
} from "../controller/DoctorPortalController";

const router = Router();

// The doctor portal. Doctor logins only; each handler then checks the login is
// linked to a doctor profile. (The public doctor directory is /api/doctors.)
router.use("/doctor", authMiddleware, requireRole("doctor"));
router.get("/doctor/me", getMe);
router.get("/doctor/dashboard", getDashboard);
router.get("/doctor/appointments", getAppointments);
router.patch("/doctor/appointments/:id/complete", completeAppointment);
router.patch("/doctor/appointments/:id/cancel", cancelAppointment);
router.post("/doctor/appointments/:id/records", writeRecord);
router.post("/doctor/records/:id/addenda", addAddendum);
router.get("/doctor/patients", getPatients);
router.get("/doctor/patients/:id", getPatient);
router.get("/doctor/patients/:id/records/:recordId", getPatientRecord);
router.get("/doctor/patients/:id/records/:recordId/pdf", downloadPatientRecordPdf);
router.post("/doctor/patients/:id/notes", addVisitNote);
router.put("/doctor/availability", updateAvailability);

export default router;
