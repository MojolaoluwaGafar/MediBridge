import mongoose from "mongoose";

// One event in an appointment's life, shown in the patient's activity feed
// and (through `doctor`) in the doctor's. `message` is the patient's wording;
// the doctor portal builds its own from the linked appointment. `actor` says
// who did it, so a doctor's cancellation reads differently on each side.
// Events recorded before the doctor portal have no `doctor` or `appointment`.
const ActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["confirmed", "rescheduled", "cancelled"], required: true },
  message: { type: String, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  actor: { type: String, enum: ["patient", "doctor"], default: "patient" },
  timestamp: { type: Date, default: Date.now }
});

ActivitySchema.index({ userId: 1, timestamp: -1 });
ActivitySchema.index({ doctor: 1, timestamp: -1 });

export const Activity = mongoose.model("Activity", ActivitySchema);
