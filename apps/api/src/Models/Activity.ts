import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["confirmed", "rescheduled", "cancelled"], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const Activity = mongoose.model("Activity", ActivitySchema);
