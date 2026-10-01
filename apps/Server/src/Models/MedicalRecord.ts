import mongoose, { Schema, Document } from "mongoose";

// Kinds of record the hospital issues. Patients filter by these in the portal,
// so add new kinds here (and to the client's RECORD_TYPE_LABELS) together.
export const RECORD_TYPES = [
  "consultation",
  "lab_result",
  "prescription",
  "imaging",
  "discharge_summary",
] as const;

export type RecordType = (typeof RECORD_TYPES)[number];

export interface IRecordSection {
  heading: string;
  body: string;
}

export interface IMedicalRecord extends Document {
  patient: mongoose.Types.ObjectId;
  doctor?: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  type: RecordType;
  title: string;
  department: string;
  visitDate: Date;
  summary?: string;
  // Free-form headed sections ("Presenting complaint", "Plan", ...) so doctors
  // can write notes in their own structure without schema changes.
  sections: IRecordSection[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
    appointment: { type: Schema.Types.ObjectId, ref: "Appointment" },
    type: { type: String, enum: RECORD_TYPES, default: "consultation" },
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    visitDate: { type: Date, required: true },
    summary: { type: String, trim: true },
    sections: [
      {
        _id: false,
        heading: { type: String, required: true, trim: true },
        body: { type: String, required: true, trim: true },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

MedicalRecordSchema.index({ patient: 1, visitDate: -1 });

export const MedicalRecord = mongoose.model<IMedicalRecord>("MedicalRecord", MedicalRecordSchema);
