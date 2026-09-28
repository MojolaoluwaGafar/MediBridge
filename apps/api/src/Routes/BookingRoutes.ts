import express from "express"
import { authMiddleware } from "../middlewares/Auth";
import { bookAppointment,getAppointments,rescheduleAppointment, cancelAppointment } from "../controller/BookingController";

const router = express.Router();

router.post("/bookAppointment", authMiddleware, bookAppointment);
router.get("/appointments", authMiddleware, getAppointments);
router.patch("/appointment/:id/reschedule", authMiddleware, rescheduleAppointment)
router.patch("/appointment/:id/cancel", authMiddleware, cancelAppointment);

export default router;
