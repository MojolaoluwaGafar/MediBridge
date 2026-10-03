import mongoose from "mongoose";
import { Activity } from "../Models/Activity";

export type ActivityType = "confirmed" | "rescheduled" | "cancelled" | "record";

// What an activity is about, so it also shows in the doctor's feed.
export interface ActivityLink {
  doctor?: mongoose.Types.ObjectId | string;
  appointment?: mongoose.Types.ObjectId | string;
  actor?: "patient" | "doctor";
}

export function recordActivity(userId: string, type: ActivityType, message: string, link: ActivityLink = {}) {
  return Activity.create({ userId, type, message, ...link });
}

export function getRecentActivities(userId: string, limit = 10) {
  return Activity.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ timestamp: -1 })
    .limit(limit);
}
