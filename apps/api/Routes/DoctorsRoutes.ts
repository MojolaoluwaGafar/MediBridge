import { Router } from "express";
import { getDoctors, getDoctorById } from "../controller/DoctorController";

const router = Router();

router.get("/doctors", getDoctors);
router.get("/doctors/:id", getDoctorById);

export default router;
