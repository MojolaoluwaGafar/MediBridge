export type RecordType =
  | "consultation"
  | "lab_result"
  | "prescription"
  | "imaging"
  | "discharge_summary";

// Keep in step with RECORD_TYPES in apps/Server/src/Models/MedicalRecord.ts.
export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  consultation: "Consultation notes",
  lab_result: "Lab result",
  prescription: "Prescription",
  imaging: "Imaging report",
  discharge_summary: "Discharge summary",
};

export interface IMedicalRecord {
  _id: string;
  type: RecordType;
  title: string;
  department: string;
  visitDate: string;
  summary?: string;
  sections: { heading: string; body: string }[];
  doctor?: {
    _id: string;
    docName: string;
    docImg?: string;
    department: string;
  } | null;
  createdAt: string;
}

export interface IGetRecordsRes {
  success: boolean;
  records: IMedicalRecord[];
}
