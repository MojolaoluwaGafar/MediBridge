import mongoose, { Schema, Document } from "mongoose";
import type { TriageLevel } from "../Services/triage";

export type ChatRole = "guest" | "patient" | "doctor";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  level?: TriageLevel;
  at: Date;
}

export interface IChatSession extends Document {
  sessionId: string;
  userId?: mongoose.Types.ObjectId;
  role: ChatRole;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["guest", "patient", "doctor"], required: true },
    messages: [
      {
        _id: false,
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        level: { type: String, enum: ["routine", "urgent", "emergency"] },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// A signed-in user's chat history, newest first.
ChatSessionSchema.index({ userId: 1, role: 1, updatedAt: -1 });

export const ChatSession = mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
