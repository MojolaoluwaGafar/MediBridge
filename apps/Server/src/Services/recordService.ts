import mongoose from "mongoose";
import { MedicalRecord, RECORD_PUBLIC_PROJECTION } from "../Models/MedicalRecord";
import { User } from "../Models/User";
import { ServiceError } from "./errors";
// Registers the Doctor model, which records are populated with.
import "../Models/Doctor";

const DOCTOR_FIELDS = "docName docImg department";

// Patients only ever see their own records. Doctors see them through the
// doctor portal (doctorPortalService) when the patient shares them.
export function listPatientRecords(patientId: string) {
  return MedicalRecord.find({ patient: new mongoose.Types.ObjectId(patientId) }, RECORD_PUBLIC_PROJECTION)
    .sort({ visitDate: -1, createdAt: -1 })
    .populate("doctor", DOCTOR_FIELDS)
    .lean();
}

function findOwnRecord(patientId: string, recordId: string, projection?: Record<string, 0>) {
  if (!mongoose.Types.ObjectId.isValid(recordId)) {
    throw new ServiceError(400, "Invalid record ID");
  }
  return MedicalRecord.findOne({ _id: recordId, patient: new mongoose.Types.ObjectId(patientId) }, projection)
    .populate("doctor", DOCTOR_FIELDS)
    .lean();
}

export async function getPatientRecord(patientId: string, recordId: string) {
  const record = await findOwnRecord(patientId, recordId, RECORD_PUBLIC_PROJECTION);
  if (!record) throw new ServiceError(404, "Record not found");
  return record;
}

// The full record (including where an uploaded file is stored) and the
// patient, for sendRecordDownload. Server-side use only.
export async function getRecordForDownload(patientId: string, recordId: string) {
  const [record, patient] = await Promise.all([
    findOwnRecord(patientId, recordId),
    User.findById(patientId, { FirstName: 1, LastName: 1, UserId: 1 }).lean(),
  ]);
  if (!record || !patient) throw new ServiceError(404, "Record not found");
  return { record, patient };
}
