import express from "express"
import { authMiddleware, requireRole } from "../middlewares/Auth";
import { bookAppointment,getAppointments,rescheduleAppointment, cancelAppointment, setAppointmentUrgency } from "../controller/BookingController";

const router = express.Router();

router.post("/bookAppointment", authMiddleware, bookAppointment);
router.get("/appointments", authMiddleware, getAppointments);
router.patch("/appointment/:id/reschedule", authMiddleware, rescheduleAppointment)
router.patch("/appointment/:id/cancel", authMiddleware, cancelAppointment);
router.patch("/appointment/:id/urgency", authMiddleware, requireRole("doctor"), setAppointmentUrgency);

export default router;
