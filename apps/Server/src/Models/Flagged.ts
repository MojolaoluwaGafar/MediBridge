import mongoose, { Schema, Document } from "mongoose";
import type { TriageCategory, TriageLevel, TriageSource } from "../Services/triage";

export interface IFlaggedMessage extends Document {
  source: "chat" | "booking" | "message";
  sessionId?: string;
  userId?: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  message: string;
  reason: string;
  level: TriageLevel;
  category: TriageCategory;
  triageSource: TriageSource;
  status: "new" | "reviewed";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNote?: string;
  flaggedAt: Date;
}

const FlaggedMessageSchema = new Schema<IFlaggedMessage>({
  source: { type: String, enum: ["chat", "booking", "message"], default: "chat" },
  sessionId: {
    type: String,
    required: function (this: IFlaggedMessage) {
      return this.source === "chat";
    },
  },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
  message: { type: String, required: true },
  reason: { type: String, required: true },
  level: { type: String, enum: ["routine", "urgent", "emergency"], required: true },
  category: {
    type: String,
    enum: ["none", "self_harm", "medical", "harm_to_others"],
    default: "none",
  },
  triageSource: { type: String, enum: ["keyword", "ai", "keyword+ai"], required: true },
  status: { type: String, enum: ["new", "reviewed"], default: "new" },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reviewedAt: { type: Date },
  reviewNote: { type: String },
  flaggedAt: { type: Date, default: Date.now },
});

FlaggedMessageSchema.index({ status: 1, flaggedAt: -1 });
// A doctor sees flags from their patients or on their appointments.
FlaggedMessageSchema.index({ userId: 1, flaggedAt: -1 });
FlaggedMessageSchema.index({ appointmentId: 1 }, { sparse: true });

export default mongoose.model<IFlaggedMessage>("FlaggedMessage", FlaggedMessageSchema);
