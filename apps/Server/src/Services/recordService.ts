import mongoose from "mongoose";
import { MedicalRecord, RECORD_TYPE_LABELS } from "../Models/MedicalRecord";
import { User } from "../Models/User";
import type { IDoctor } from "../types/doctor";
import type { RecordPdfInput } from "./recordPdf";
import { ServiceError } from "./errors";
// Registers the Doctor model, which records are populated with.
import "../Models/Doctor";

const DOCTOR_FIELDS = "docName docImg department";

// Patients only ever see their own records. Doctor access (for appointments
// where the patient chose to share records) comes with the doctor portal.
export function listPatientRecords(patientId: string) {
  return MedicalRecord.find({ patient: new mongoose.Types.ObjectId(patientId) })
    .sort({ visitDate: -1 })
    .populate("doctor", DOCTOR_FIELDS)
    .lean();
}

export async function getPatientRecord(patientId: string, recordId: string) {
  if (!mongoose.Types.ObjectId.isValid(recordId)) {
    throw new ServiceError(400, "Invalid record ID");
  }

  const record = await MedicalRecord.findOne({ _id: recordId, patient: new mongoose.Types.ObjectId(patientId) })
    .populate("doctor", DOCTOR_FIELDS)
    .lean();
  if (!record) throw new ServiceError(404, "Record not found");
  return record;
}

// Everything the PDF needs, plus a safe file name for the download.
export async function getRecordForPdf(patientId: string, recordId: string): Promise<{ fileName: string; pdf: RecordPdfInput }> {
  const [record, patient] = await Promise.all([
    getPatientRecord(patientId, recordId),
    User.findById(patientId, { FirstName: 1, LastName: 1, UserId: 1 }).lean(),
  ]);
  if (!patient) throw new ServiceError(404, "Record not found");

  const doctor = record.doctor as unknown as IDoctor | undefined;
  return {
    fileName: `${record.title.replace(/[^\w-]+/g, "-").replace(/-+/g, "-")}.pdf`,
    pdf: {
      title: record.title,
      typeLabel: RECORD_TYPE_LABELS[record.type],
      department: record.department,
      visitDate: record.visitDate,
      doctorName: doctor?.docName,
      patientName: `${patient.FirstName} ${patient.LastName}`,
      patientId: patient.UserId,
      summary: record.summary,
      sections: record.sections ?? [],
    },
  };
}
