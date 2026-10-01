import { Router } from "express";
import { authMiddleware, requireRole } from "../middlewares/Auth";
import { getDoctorAccounts, linkDoctorAccount, unlinkDoctorAccount } from "../controller/AdminController";

const router = Router();

// Admin only. The admin portal will use these; until then, `npm run link:doctor`.
router.use("/admin", authMiddleware, requireRole("admin"));
router.get("/admin/doctors", getDoctorAccounts);
router.put("/admin/doctors/:id/account", linkDoctorAccount);
router.delete("/admin/doctors/:id/account", unlinkDoctorAccount);

export default router;
