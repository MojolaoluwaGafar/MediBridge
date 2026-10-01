import mongoose from "mongoose";
import { Activity } from "../Models/Activity";

export type ActivityType = "confirmed" | "rescheduled" | "cancelled";

export function recordActivity(userId: string, type: ActivityType, message: string) {
  return Activity.create({ userId, type, message });
}

export function getRecentActivities(userId: string, limit = 10) {
  return Activity.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ timestamp: -1 })
    .limit(limit);
}
