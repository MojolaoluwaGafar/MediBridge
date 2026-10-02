import mongoose, { Schema, Document } from "mongoose";

// A doctor's own working note about a patient, optionally tied to one visit.
// Notes are private to the doctor who wrote them: patients and other doctors
// never see them. Anything the patient should keep belongs in a MedicalRecord.
export interface IVisitNote extends Document {
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export const MAX_NOTE_LENGTH = 5000;

const VisitNoteSchema = new Schema<IVisitNote>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    appointment: { type: Schema.Types.ObjectId, ref: "Appointment" },
    body: { type: String, required: true, trim: true, maxlength: MAX_NOTE_LENGTH },
  },
  { timestamps: true }
);

VisitNoteSchema.index({ doctor: 1, patient: 1, createdAt: -1 });

export const VisitNote = mongoose.model<IVisitNote>("VisitNote", VisitNoteSchema);
