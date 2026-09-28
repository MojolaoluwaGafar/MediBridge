import { Request, Response } from "express"
import { sendToAI } from "../Services/ai"
import Flagged from "../Models/Flagged";
import { getUnsafeReason } from "../Utils/unsafe";
import { isEmergency } from "../Utils/emergency";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: true,
        message: "Message is required",
      });
    }


    const unsafeReason = getUnsafeReason(message);
    const emergency = isEmergency(message);
    
    if (emergency) {
      await Flagged.create({
        message,
        reason: "Emergency Self-Harm Risk",
      });
      // console.log("emergency text from user :",emergency);
      
      const emergencyReply = "It sounds like you may be going through something very serious right now. Please reach out to a trusted adult, family member, local emergency service, or mental health professional immediately.";
            
      return res.status(200).json({
        reply: emergencyReply,
      });
    }
    else if (unsafeReason) {
      await Flagged.create({
        message,
        reason: unsafeReason,
      });
    }

    const reply = await sendToAI(message);

    return res.json({
      reply,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "AI integration failed",
    });
  }
};