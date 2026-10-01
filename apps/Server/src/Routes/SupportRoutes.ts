import { Router } from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { sendMessage, getLatestSession } from "../controller/SupportController";
import { authMiddleware, optionalAuth, type AuthRequest } from "../middlewares/Auth";

const router = Router();

// The chat is open to visitors, so limit it to protect the AI budget:
// 20 messages per 10 minutes for visitors, 60 for signed-in users.
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: (req) => ((req as AuthRequest).user ? 60 : 20),
  keyGenerator: (req) => (req as AuthRequest).user?.id ?? ipKeyGenerator(req.ip ?? ""),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "You've sent a lot of messages. Please wait a few minutes and try again." },
});

router.post("/aiChat", optionalAuth, chatLimiter, sendMessage);
router.get("/aiChat/latest", authMiddleware, getLatestSession);

export default router;
