import mongoose, { Schema, Document } from "mongoose";

// Kinds of record the hospital issues. Patients filter by these in the portal,
// so add new kinds here and to RECORD_TYPE_LABELS in the client together.
export const RECORD_TYPES = [
  "consultation",
  "lab_result",
  "prescription",
  "imaging",
  "discharge_summary",
] as const;

export type RecordType = (typeof RECORD_TYPES)[number];

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  consultation: "Consultation notes",
  lab_result: "Lab result",
  prescription: "Prescription",
  imaging: "Imaging report",
  discharge_summary: "Discharge summary",
};

export interface IRecordSection {
  heading: string;
  body: string;
}

// A file hospital staff uploaded (lab result, scan, discharge papers). The
// bytes live in private storage (see Services/documentStorage.ts); `key` is
// only usable with the server's credentials and is never sent to clients.
export interface IRecordAttachment {
  provider: "cloudinary" | "local";
  key: string;
  contentType: string;
  bytes: number;
  originalName: string;
}

// A clinical record written by the hospital about one patient. Patients can
// read and download their own records but never create or change them.
export interface IMedicalRecord extends Document {
  patient: mongoose.Types.ObjectId;
  doctor?: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  type: RecordType;
  title: string;
  department: string;
  visitDate: Date;
  summary?: string;
  // Headed sections ("Presenting complaint", "Plan", ...) so each record type
  // can have its own structure without schema changes.
  sections: IRecordSection[];
  attachment?: IRecordAttachment;
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
    attachment: {
      type: {
        _id: false,
        provider: { type: String, enum: ["cloudinary", "local"], required: true },
        key: { type: String, required: true },
        contentType: { type: String, required: true },
        bytes: { type: Number, required: true },
        originalName: { type: String, required: true },
      },
      default: undefined,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

MedicalRecordSchema.index({ patient: 1, visitDate: -1 });
// Records a doctor wrote, and which visits already have one.
MedicalRecordSchema.index({ doctor: 1, patient: 1 });
MedicalRecordSchema.index({ appointment: 1 }, { sparse: true });

// What clients may see of a record: everything except where its file is kept.
export const RECORD_PUBLIC_PROJECTION = { "attachment.key": 0, "attachment.provider": 0 } as const;

export const MedicalRecord = mongoose.model<IMedicalRecord>("MedicalRecord", MedicalRecordSchema);
