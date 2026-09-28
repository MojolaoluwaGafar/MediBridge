import mongoose, { Schema, Document } from "mongoose";

export interface IFlaggedMessage extends Document {
  sessionId: string;
  message: string;
  reason: string;
  flaggedAt: Date;
}

const FlaggedMessageSchema = new Schema<IFlaggedMessage>({
  sessionId: { type: String, required: true },
  message: { type: String, required: true },
  reason: { type: String, required: true },
  flaggedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFlaggedMessage>("FlaggedMessage", FlaggedMessageSchema);
