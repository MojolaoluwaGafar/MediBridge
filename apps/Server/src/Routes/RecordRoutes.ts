import { Router } from "express";
import { authMiddleware, requireRole } from "../middlewares/Auth";
import { getRecords, getRecord, downloadRecordPdf } from "../controller/RecordController";

const router = Router();

router.get("/records", authMiddleware, requireRole("user"), getRecords);
router.get("/records/:id", authMiddleware, requireRole("user"), getRecord);
router.get("/records/:id/pdf", authMiddleware, requireRole("user"), downloadRecordPdf);

export default router;
