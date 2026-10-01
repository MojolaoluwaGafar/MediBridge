import { Router } from "express";
import { getDoctors, getDoctorById, getDoctorSlots } from "../controller/DoctorController";
import { authMiddleware } from "../middlewares/Auth";

const router = Router();

router.get("/doctors", getDoctors);
router.get("/doctors/:id", getDoctorById);
router.get("/doctors/:id/slots", authMiddleware, getDoctorSlots);

export default router;
