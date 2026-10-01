import { Router } from "express";
import { authMiddleware, requireRole } from "../middlewares/Auth";
import { getConversations, getConversation, sendConversationMessage } from "../controller/MessageController";

const router = Router();

// :otherId is the doctor's profile ID for patients, and the patient's user ID for doctors.
router.get("/conversations", authMiddleware, requireRole("user", "doctor"), getConversations);
router.get("/conversations/:otherId", authMiddleware, requireRole("user", "doctor"), getConversation);
router.post("/conversations/:otherId/messages", authMiddleware, requireRole("user", "doctor"), sendConversationMessage);

export default router;
