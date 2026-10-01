import { Response } from "express";
import type { AuthRequest } from "../middlewares/Auth";
import { getRecentActivities } from "../Services/activityService";

export const getActivities = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const activities = await getRecentActivities(req.user.id);

    return res.status(200).json({ success: true, activities });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
