import { Router } from "express";
import { getDoctors, getDoctorById, getDoctorSlots } from "../controller/DoctorController";
import { authMiddleware } from "../middlewares/Auth";
import { publicCache } from "../middlewares/Performance";

const router = Router();

// The public directory may be a minute old; booking still checks the
// doctor's live availability. Slots are never cached.
router.get("/doctors", publicCache(60), getDoctors);
router.get("/doctors/:id", publicCache(60), getDoctorById);
router.get("/doctors/:id/slots", authMiddleware, getDoctorSlots);

export default router;
