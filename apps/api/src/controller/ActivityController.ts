import { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/Auth";
import { Activity } from "../Models/Activity";
import mongoose from "mongoose";

export const getActivities = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const activities = await Activity.find({ userId: new mongoose.Types.ObjectId(req.user.id) })
      .sort({ timestamp: -1 })
      .limit(10);

    return res.status(200).json({ success: true, activities });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
