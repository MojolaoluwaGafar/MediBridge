import { Response } from "express";
import { sendToAI } from "../Services/ai";
import type { AuthRequest } from "../middlewares/Auth";

export const sendMessage = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const reply = await sendToAI(message);

    return res.json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "AI integration failed",
    });
  }
};