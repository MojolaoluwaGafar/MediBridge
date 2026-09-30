import { Router } from "express";
import { authMiddleware, requireRole } from "../middlewares/Auth";
import { getFlags, reviewFlag } from "../controller/FlagController";

const router = Router();

router.get("/flags", authMiddleware, requireRole("admin", "doctor"), getFlags);
router.patch("/flags/:id/review", authMiddleware, requireRole("admin", "doctor"), reviewFlag);

export default router;
