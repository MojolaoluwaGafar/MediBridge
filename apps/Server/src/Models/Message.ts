import mongoose, { Schema, Document } from "mongoose";

export type MessageSender = "patient" | "doctor";

// One message between a patient and a doctor. A conversation is every message
// with the same (patient, doctor) pair, so there is no separate thread document.
export interface IMessage extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  sender: MessageSender;
  body: string;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    sender: { type: String, enum: ["patient", "doctor"], required: true },
    body: { type: String, required: true, trim: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

MessageSchema.index({ patient: 1, doctor: 1, createdAt: -1 });
// The doctor's side of the inbox (their conversations, newest first).
MessageSchema.index({ doctor: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
