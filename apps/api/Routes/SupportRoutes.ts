import { Router } from "express";
import { sendMessage } from "../controller/SupportController";

const router = Router();

router.post("/aiChat", sendMessage);

export default router;